#!/usr/bin/env bash

TARGET_LANG="$1"

# Run the filter
jq -c --arg lang "$TARGET_LANG" 'select(.success == true) | .data[$lang]'
