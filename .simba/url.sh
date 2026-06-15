simba_url_parse() {
    # Shamelessly copied over from: https://gist.github.com/joshisa/297b0bc1ec0dcdda0d1625029711fa24
    # With some own additions
    url="$1"
    local prefix="$1"
    local _port="$2"

    protocol=$(echo "$url" | grep "://" | sed -e's,^\(.*://\).*,\1,g')
    # Remove the protocol
    local url_no_protocol=$(echo "${url/$protocol/}")
    # Use tr: Make the protocol lower-case for easy string compare
    protocol=$(echo "$protocol" | tr '[:upper:]' '[:lower:]')

    # Extract the user and password (if any)
    # cut 1: Remove the path part to prevent @ in the querystring from breaking the next cut
    # rev: Reverse string so cut -f1 takes the (reversed) rightmost field, and -f2- is what we want
    # cut 2: Remove the host:port
    # rev: Undo the first rev above
    local userpass=$(echo "$url_no_protocol" | grep "@" | cut -d"/" -f1 | rev | cut -d"@" -f2- | rev)
    local pass=$(echo "$userpass" | grep ":" | cut -d":" -f2)
    if [ -n "$pass" ]; then
        user=$(echo "$userpass" | grep ":" | cut -d":" -f1)
    else
        user="$userpass"
    fi
    # Extract the host
    local hostport=$(echo "${url_no_protocol/$userpass@/}" | cut -d"/" -f1)
    host=$(echo "$hostport" | cut -d":" -f1)
    port=$(echo "$hostport" | grep ":" | cut -d":" -f2)
    port=${port:-$_port}
    path="/"$(echo "$url_no_protocol" | grep "/" | cut -d"/" -f2-)

    protocol="${protocol:-http://}"
    # origin
    origin="${protocol:-http://}"
    [[ "$user" != "" ]] && origin="${origin}${user}"
    [[ "$pass" != "" ]] && origin="${origin}:${pass}"
    [[ "$userpass" != "" ]] && origin="${origin}@"
    origin="${origin}${host}:${port}"

    protocol="${protocol%:*}"
    username="$user"
    password="$pass"
    port="${port:-$PORT}"
    path="${path:-/}"
    url="${origin}${path%/*}"
}

