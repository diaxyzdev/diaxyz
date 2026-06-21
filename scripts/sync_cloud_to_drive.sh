#!/usr/bin/env bash
#
# sync_cloud_to_drive.sh
#
# Keeps all files under a local directory (default: cloud/) in sync with
# Google Drive using a Google Service Account.
#
# Usage:
#   ./sync_cloud_to_drive.sh [options]
#
# Options:
#   -c, --credentials PATH   Path to Google Service Account JSON file
#   -s, --src PATH           Path to local source directory
#   -d, --dest NAME          Name of the destination folder on Google Drive
#   -i, --dest-id ID         ID of an existing Google Drive folder (e.g. shared with service account)
#   --delete                 Delete files on Google Drive that do not exist locally (mirror sync)
#   --dry-run                Simulate operations without making any changes
#   -h, --help               Show this help message
#

set -eo pipefail

# --- Color Definitions for Logging ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0;0m' # No Color

log_info() {
    printf "${BLUE}[INFO]${NC} %s\n" "$*"
}

log_success() {
    printf "${GREEN}[SUCCESS]${NC} %s\n" "$*"
}

log_warn() {
    printf "${YELLOW}[WARN]${NC} %s\n" "$*"
}

log_error() {
    printf "${RED}[ERROR]${NC} %s\n" "$*" >&2
}

# --- Default Configurations ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_CREDENTIALS_FILE="$(cd "$SCRIPT_DIR/../infrastructure/google" 2>/dev/null && pwd)/infrastructure-499408-d0d60a83e42d.json" || DEFAULT_CREDENTIALS_FILE=""
DEFAULT_SRC_DIR="$(cd "$SCRIPT_DIR/../cloud" 2>/dev/null && pwd)" || DEFAULT_SRC_DIR=""

CREDENTIALS_FILE="${GOOGLE_APPLICATION_CREDENTIALS:-$DEFAULT_CREDENTIALS_FILE}"
SRC_DIR="$DEFAULT_SRC_DIR"
DRIVE_FOLDER_NAME="diaxyz-cloud"
DRIVE_FOLDER_ID=""
DELETE_EXTRANEOUS=false
DRY_RUN=false

show_help() {
    cat <<EOF
Google Drive Sync Script
========================
Keeps a local directory in sync with Google Drive using a Service Account.

Usage:
  $(basename "$0") [options]

Options:
  -c, --credentials PATH  Path to Service Account JSON (default: $DEFAULT_CREDENTIALS_FILE)
  -s, --src PATH          Path to local directory to sync (default: $DEFAULT_SRC_DIR)
  -d, --dest NAME         Name of folder to create/use in Drive (default: $DRIVE_FOLDER_NAME)
  -i, --dest-id ID        ID of an existing Google Drive folder.
                          Use this if you shared a folder from your personal Drive
                          with the service account email.
  --delete                Enable strict sync: delete remote files/folders not present locally
  --dry-run               Simulate and display what would be done without modifying Drive
  -h, --help              Show this help message

Requirements:
  - curl, jq, openssl

Note on Service Accounts:
  Service accounts live in their own isolated Google Drive. To sync to your personal
  Google Drive, create a folder in your personal Drive, share it with the service account's
  client email (found in the JSON credentials), and provide its Folder ID with the '-i' option.
EOF
}

# --- Parse Arguments ---
while [[ $# -gt 0 ]]; do
    case "$1" in
        -c|--credentials)
            CREDENTIALS_FILE="$2"
            shift 2
            ;;
        -s|--src)
            SRC_DIR="$2"
            shift 2
            ;;
        -d|--dest)
            DRIVE_FOLDER_NAME="$2"
            shift 2
            ;;
        -i|--dest-id)
            DRIVE_FOLDER_ID="$2"
            shift 2
            ;;
        --delete)
            DELETE_EXTRANEOUS=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# --- Validation ---
if [ ! -f "$CREDENTIALS_FILE" ]; then
    log_error "Credentials file not found at: $CREDENTIALS_FILE"
    exit 1
fi

if [ ! -d "$SRC_DIR" ]; then
    log_error "Source directory not found at: $SRC_DIR"
    exit 1
fi

# Ensure required commands are available
for cmd in curl jq openssl; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        log_error "Required command '$cmd' is not installed. Please install it."
        exit 1
    fi
done

# Resolve absolute path for source directory
SRC_DIR="$(cd "$SRC_DIR" && pwd)"

# --- Global Variables & Caches ---
ACCESS_TOKEN=""
declare -A folder_cache
declare -A verified_ids

# --- Base64url Encoder Helper ---
base64url() {
    base64 | tr -d '\n' | tr -- '+/' '-_' | tr -d '='
}

# --- Google OAuth2 Authentication ---
get_access_token() {
    log_info "Authenticating with Google Drive API using service account..."
    
    local client_email=$(jq -r '.client_email' "$CREDENTIALS_FILE")
    local private_key=$(jq -r '.private_key' "$CREDENTIALS_FILE")
    local token_uri=$(jq -r '.token_uri' "$CREDENTIALS_FILE")
    
    if [ -z "$client_email" ] || [ -z "$private_key" ] || [ -z "$token_uri" ]; then
        log_error "Invalid service account credential JSON."
        exit 1
    fi
    
    log_info "Service Account Email: $client_email"
    
    local iat=$(date +%s)
    local exp=$((iat + 3600))
    
    # 1. Header
    local header='{"alg":"RS256","typ":"JWT"}'
    local header_b64=$(echo -n "$header" | base64url)
    
    # 2. Claim Set
    local claim_set=$(cat <<EOF
{
  "iss": "$client_email",
  "scope": "https://www.googleapis.com/auth/drive",
  "aud": "$token_uri",
  "exp": $exp,
  "iat": $iat
}
EOF
)
    local claim_set_b64=$(echo -n "$claim_set" | base64url)
    
    # 3. Signature
    local signature_input="${header_b64}.${claim_set_b64}"
    local signature_b64=$(echo -n "$signature_input" | openssl dgst -sha256 -sign <(echo "$private_key") | base64url)
    
    # 4. JWT
    local jwt="${header_b64}.${claim_set_b64}.${signature_b64}"
    
    # 5. Fetch Token
    local response=$(curl -s -X POST "$token_uri" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      --data-urlencode "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer" \
      --data-urlencode "assertion=$jwt")
      
    ACCESS_TOKEN=$(echo "$response" | jq -r '.access_token // empty')
    
    if [ -z "$ACCESS_TOKEN" ]; then
        log_error "Failed to obtain OAuth2 access token. API response:"
        log_error "$response"
        exit 1
    fi
    
    log_success "Authenticated successfully!"
}

# --- Google Drive API Helpers ---

# Create a folder in Google Drive
create_drive_folder() {
    local name="$1"
    local parent_id="$2"
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Would create Drive folder '$name' (parent: $parent_id)"
        echo "dry-run-folder-id-$(date +%s%N)"
        return
    fi
    
    local post_data
    if [ -z "$parent_id" ]; then
        post_data=$(cat <<EOF
{
  "name": "$name",
  "mimeType": "application/vnd.google-apps.folder"
}
EOF
)
    else
        post_data=$(cat <<EOF
{
  "name": "$name",
  "mimeType": "application/vnd.google-apps.folder",
  "parents": ["$parent_id"]
}
EOF
)
    fi
    
    local response=$(curl -s -X POST -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$post_data" \
        "https://www.googleapis.com/drive/v3/files?fields=id")
        
    local folder_id=$(echo "$response" | jq -r '.id // empty')
    if [ -z "$folder_id" ]; then
        log_error "Failed to create folder '$name'. Response: $response"
        exit 1
    fi
    echo "$folder_id"
}

# Recursively resolves and caches Drive folder IDs based on local relative paths
get_or_create_drive_folder() {
    local rel_path="$1"
    
    # Normalize relative path (e.g. "./images/sub" -> "images/sub")
    rel_path=$(echo "$rel_path" | sed -e 's|^\./||' -e 's|^/||' -e 's|/$||')
    
    if [ -z "$rel_path" ] || [ "$rel_path" = "." ]; then
        echo "${folder_cache["."]}"
        return
    fi
    
    # Return from cache if we already resolved it
    if [ -n "${folder_cache["$rel_path"]}" ]; then
        echo "${folder_cache["$rel_path"]}"
        return
    fi
    
    # Resolve parent path first
    local parent_path=$(dirname "$rel_path")
    local folder_name=$(basename "$rel_path")
    
    local parent_id
    if [ "$parent_path" = "." ] || [ -z "$parent_path" ]; then
        parent_id="${folder_cache["."]}"
    else
        parent_id=$(get_or_create_drive_folder "$parent_path")
    fi
    
    # Search for this folder under the parent
    local query="name = '$(echo "$folder_name" | sed "s/'/\\\\'/g")' and mimeType = 'application/vnd.google-apps.folder' and '$parent_id' in parents and trashed = false"
    local folder_id=$(curl -s -G -H "Authorization: Bearer $ACCESS_TOKEN" \
        --data-urlencode "q=$query" \
        --data-urlencode "fields=files(id)" \
        "https://www.googleapis.com/drive/v3/files" | jq -r '.files[0].id // empty')
        
    if [ -z "$folder_id" ]; then
        log_info "Creating folder on Drive: $rel_path"
        folder_id=$(create_drive_folder "$folder_name" "$parent_id")
    else
        log_info "Found existing folder on Drive: $rel_path"
    fi
    
    # Cache and register as verified
    folder_cache["$rel_path"]="$folder_id"
    verified_ids["$folder_id"]=1
    
    echo "$folder_id"
}

# Determine MIME type of a file
get_mime_type() {
    local file_path="$1"
    local mime_type=""
    if command -v file >/dev/null 2>&1; then
        mime_type=$(file --mime-type -b "$file_path" 2>/dev/null)
    fi
    if [ -z "$mime_type" ] || [[ "$mime_type" == *"cannot open"* ]]; then
        case "$file_path" in
            *.html|*.htm) mime_type="text/html" ;;
            *.css) mime_type="text/css" ;;
            *.js) mime_type="application/javascript" ;;
            *.json) mime_type="application/json" ;;
            *.png) mime_type="image/png" ;;
            *.jpg|*.jpeg) mime_type="image/jpeg" ;;
            *.gif) mime_type="image/gif" ;;
            *.svg) mime_type="image/svg+xml" ;;
            *.txt) mime_type="text/plain" ;;
            *.pdf) mime_type="application/pdf" ;;
            *.zip) mime_type="application/zip" ;;
            *) mime_type="application/octet-stream" ;;
        esac
    fi
    echo "$mime_type"
}

# Search for file on Drive by name and parent
find_drive_file() {
    local name="$1"
    local parent_id="$2"
    
    local query="name = '$(echo "$name" | sed "s/'/\\\\'/g")' and mimeType != 'application/vnd.google-apps.folder' and '$parent_id' in parents and trashed = false"
    curl -s -G -H "Authorization: Bearer $ACCESS_TOKEN" \
        --data-urlencode "q=$query" \
        --data-urlencode "fields=files(id,md5Checksum)" \
        "https://www.googleapis.com/drive/v3/files" | jq -c '.files[0] // empty'
}

# Upload a brand new file
upload_new_file() {
    local file_path="$1"
    local name="$2"
    local parent_id="$3"
    local mime_type="$4"
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Would upload new file: $name"
        echo "dry-run-file-id-$(date +%s%N)"
        return
    fi
    
    local boundary="diaxyz_sync_multipart_boundary"
    local metadata=$(cat <<EOF
{
  "name": "$name",
  "parents": ["$parent_id"]
}
EOF
)
    
    local temp_body=$(mktemp)
    
    printf -- "--%s\r\n" "$boundary" > "$temp_body"
    printf "Content-Type: application/json; charset=UTF-8\r\n\r\n" >> "$temp_body"
    printf "%s\r\n" "$metadata" >> "$temp_body"
    printf -- "--%s\r\n" "$boundary" >> "$temp_body"
    printf "Content-Type: %s\r\n\r\n" "$mime_type" >> "$temp_body"
    cat "$file_path" >> "$temp_body"
    printf "\r\n--%s--\r\n" "$boundary" >> "$temp_body"
    
    local response=$(curl -s -X POST \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: multipart/related; boundary=$boundary" \
        --data-binary @"$temp_body" \
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id")
        
    rm -f "$temp_body"
    
    local file_id=$(echo "$response" | jq -r '.id // empty')
    if [ -z "$file_id" ]; then
        log_error "Failed to upload file '$name'. Response: $response"
        exit 1
    fi
    echo "$file_id"
}

# Update an existing file's content
update_file_content() {
    local file_id="$1"
    local file_path="$2"
    local mime_type="$3"
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Would update content for file ID: $file_id"
        echo "$file_id"
        return
    fi
    
    local response=$(curl -s -X PATCH \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: $mime_type" \
        --data-binary @"$file_path" \
        "https://www.googleapis.com/upload/drive/v3/files/$file_id?uploadType=media&fields=id")
        
    local updated_id=$(echo "$response" | jq -r '.id // empty')
    if [ -z "$updated_id" ]; then
        log_error "Failed to update file ID '$file_id'. Response: $response"
        exit 1
    fi
    echo "$updated_id"
}

# Trash an item from Drive
trash_drive_item() {
    local item_id="$1"
    local item_name="$2"
    local item_type="$3"
    
    if [ "$DRY_RUN" = true ]; then
        log_warn "[DRY-RUN] Would trash remote $item_type: '$item_name' (ID: $item_id)"
        return
    fi
    
    log_warn "Trashing remote $item_type: '$item_name' (ID: $item_id)"
    local response=$(curl -s -X PATCH -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"trashed": true}' \
        "https://www.googleapis.com/drive/v3/files/$item_id")
        
    # Check response for success
    if ! echo "$response" | jq -e '.trashed == true' >/dev/null; then
        log_error "Failed to trash item ID $item_id. Response: $response"
    fi
}

# --- Initialization of Root Drive Sync Directory ---
init_root_sync_folder() {
    if [ -n "$DRIVE_FOLDER_ID" ]; then
        log_info "Using specified target Drive folder ID: $DRIVE_FOLDER_ID"
        
        # Verify the folder exists and is accessible
        local response=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
            "https://www.googleapis.com/drive/v3/files/$DRIVE_FOLDER_ID?fields=id,name,mimeType,trashed")
            
        local check_id=$(echo "$response" | jq -r '.id // empty')
        local check_trashed=$(echo "$response" | jq -r '.trashed // false')
        
        if [ -z "$check_id" ] || [ "$check_trashed" = "true" ]; then
            log_error "Drive folder ID '$DRIVE_FOLDER_ID' was not found, is trashed, or is not accessible."
            exit 1
        fi
        
        local folder_name=$(echo "$response" | jq -r '.name')
        log_success "Verified target folder: '$folder_name' (ID: $DRIVE_FOLDER_ID)"
        
        folder_cache["."]="$DRIVE_FOLDER_ID"
        verified_ids["$DRIVE_FOLDER_ID"]=1
    else
        log_info "Searching for sync root folder named '$DRIVE_FOLDER_NAME'..."
        local query="name = '$(echo "$DRIVE_FOLDER_NAME" | sed "s/'/\\\\'/g")' and mimeType = 'application/vnd.google-apps.folder' and 'root' in parents and trashed = false"
        local root_id=$(curl -s -G -H "Authorization: Bearer $ACCESS_TOKEN" \
            --data-urlencode "q=$query" \
            --data-urlencode "fields=files(id)" \
            "https://www.googleapis.com/drive/v3/files" | jq -r '.files[0].id // empty')
            
        if [ -z "$root_id" ]; then
            log_info "Sync root folder not found. Creating a new one named '$DRIVE_FOLDER_NAME'..."
            root_id=$(create_drive_folder "$DRIVE_FOLDER_NAME" "")
            log_success "Created folder '$DRIVE_FOLDER_NAME' with ID: $root_id"
        else
            log_success "Found existing root folder '$DRIVE_FOLDER_NAME' with ID: $root_id"
        fi
        
        folder_cache["."]="$root_id"
        verified_ids["$root_id"]=1
    fi
}

# --- Main Sync Routine ---
sync_local_to_remote() {
    log_info "Scanning local directory '$SRC_DIR'..."
    
    # We find all files and directories in the source folder
    # We run find in a way that respects space characters
    
    # First, let's make sure all directories are created
    find . -type d | while read -r local_dir; do
        if [ "$local_dir" = "." ]; then
            continue
        fi
        # Resolve/create directory on Drive
        get_or_create_drive_folder "$local_dir" > /dev/null
    done
    
    # Now, process all files
    local total_files=0
    local synced_files=0
    local updated_files=0
    local skipped_files=0
    
    # Read files line by line (handles spaces correctly)
    while IFS= read -r -d '' local_file; do
        ((total_files++))
        
        local file_rel_path="${local_file#./}"
        local file_dir=$(dirname "$file_rel_path")
        local file_name=$(basename "$file_rel_path")
        
        # Get parent Drive ID
        local parent_id
        if [ "$file_dir" = "." ] || [ -z "$file_dir" ]; then
            parent_id="${folder_cache["."]}"
        else
            parent_id=$(get_or_create_drive_folder "$file_dir")
        fi
        
        # Get local file info
        local local_full_path="$SRC_DIR/$file_rel_path"
        local local_md5=$(md5sum "$local_full_path" | awk '{print $1}')
        local mime_type=$(get_mime_type "$local_full_path")
        
        # Check if file exists on Google Drive
        local drive_file_json=$(find_drive_file "$file_name" "$parent_id")
        
        if [ -z "$drive_file_json" ]; then
            log_info "Uploading: $file_rel_path ($mime_type)"
            local file_id=$(upload_new_file "$local_full_path" "$file_name" "$parent_id" "$mime_type")
            verified_ids["$file_id"]=1
            ((synced_files++))
        else
            local drive_id=$(echo "$drive_file_json" | jq -r '.id')
            local drive_md5=$(echo "$drive_file_json" | jq -r '.md5Checksum')
            verified_ids["$drive_id"]=1
            
            if [ "$local_md5" != "$drive_md5" ]; then
                log_info "Updating (MD5 mismatch): $file_rel_path"
                update_file_content "$drive_id" "$local_full_path" "$mime_type" > /dev/null
                ((updated_files++))
            else
                log_info "Up-to-date (MD5 match): $file_rel_path"
                ((skipped_files++))
            fi
        fi
        
    done < <(find . -type f -print0)
    
    log_success "Scan and upload complete."
    log_info "Files processed: $total_files (New uploaded: $synced_files, Updated: $updated_files, Unchanged: $skipped_files)"
}

# --- Cleanup Extraneous Remote Items ---
delete_extraneous_remote() {
    log_info "Checking for extraneous remote files and folders to delete..."
    
    # For every folder we touched/resolved during the sync, we list its items on Google Drive.
    # If any item in that folder has an ID NOT in verified_ids, we trash it.
    
    local deleted_count=0
    
    for rel_path in "${!folder_cache[@]}"; do
        local folder_id="${folder_cache["$rel_path"]}"
        
        # Skip dry-run folder IDs
        if [[ "$folder_id" == dry-run-folder-id-* ]]; then
            continue
        fi
        
        # Query all files and folders immediately inside this Drive folder
        local query="'$folder_id' in parents and trashed = false"
        local response=$(curl -s -G -H "Authorization: Bearer $ACCESS_TOKEN" \
            --data-urlencode "q=$query" \
            --data-urlencode "fields=files(id,name,mimeType)" \
            "https://www.googleapis.com/drive/v3/files")
            
        # Parse the files list
        local items_json=$(echo "$response" | jq -c '.files[] // empty')
        
        if [ -n "$items_json" ]; then
            while read -r item; do
                local item_id=$(echo "$item" | jq -r '.id')
                local item_name=$(echo "$item" | jq -r '.name')
                local mime_type=$(echo "$item" | jq -r '.mimeType')
                local item_type="file"
                if [ "$mime_type" = "application/vnd.google-apps.folder" ]; then
                    item_type="folder"
                fi
                
                # If this item ID was never verified, it is extraneous and should be deleted
                if [ -z "${verified_ids["$item_id"]}" ]; then
                    trash_drive_item "$item_id" "$item_name" "$item_type"
                    ((deleted_count++))
                fi
            done <<< "$items_json"
        fi
    done
    
    if [ "$deleted_count" -gt 0 ]; then
        log_success "Cleaned up extraneous remote items."
        log_info "Total items deleted/trashed: $deleted_count"
    else
        log_info "No extraneous remote items found to delete."
    fi
}

# --- Main Flow ---
main() {
    log_info "Starting Google Drive sync..."
    if [ "$DRY_RUN" = true ]; then
        log_warn "=== DRY RUN MODE ENABLED ==="
    fi
    
    get_access_token
    init_root_sync_folder
    
    # Move into the source directory to make finding relative paths easier
    pushd "$SRC_DIR" > /dev/null
    
    sync_local_to_remote
    
    if [ "$DELETE_EXTRANEOUS" = true ]; then
        delete_extraneous_remote
    fi
    
    popd > /dev/null
    
    log_success "Sync completed successfully!"
}

main
