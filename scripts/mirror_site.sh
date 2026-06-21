#!/usr/bin/env bash
# Usage: ./mirror_site.sh <website_url>

if [ -z "$1" ]; then
    echo "Usage: $0 <URL>"
    exit 1
fi


SITE_URL="$1"
DESTDIR="${2:-.}"

wget --mirror --page-requisites --adjust-extension --convert-links --no-parent "$SITE_URL" --directory-prefix="$DESTDIR" --no-host-directories
