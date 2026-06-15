# use utils.sh

simba_array_create() {
    local name="$1"
    if simba_defined $name || command -v $name; then
        simba_fatal "simba_array_create: Occupied identifier: '$name'"
    fi
    declare -ga "$name"
}

simba_array_length() {
    local -n ar="$1"
    echo "${#ar[@]}"
}

simba_array_at() {
    local -n ar="$1"
    local i="$2"
    echo "${ar[$i]}"
}

simba_array_push() {
    local -n ar="$1"
    local value="$2"
    ar+=("$value")
}

simba_array_pop() {
    local -n ar="$1"
    local i="${#ar[@]}"
    ((--i))
    if test $i -lt 0; then
        simba_fatal "simba_array_pop: Trying to pop an empty array"
    fi
    local value="${ar[$i]}"
    unset ar["$i"]
}

simba_array_shift() {
    local -n ar="$1"
    local ln="${#ar[@]}"
    local -i i=1

    while test $i -lt $ln; do
        echo "$((i - 1))" "$i"
        ar[i - 1]="${ar[$i]}"
        ((++i))
    done
    unset ar[$(( ln - 1 ))]
}

simba_array_unshift() {
    local -n ar="$1"
    local value="$2"
    local ln="${#ar[@]}"

    ar+=('tmp')
    while test $ln -gt 0; do
        ar[((ln--))]="${ar[ln - 1]}"
    done
    ar[0]="$value"
}

simba_array_keys() {
    local -n ar="$1"
    echo "${!ar[@]}"
}

simba_array_values() {
    local -n ar="$1"
    echo "${ar[@]}"
}

simba_array_for_each() {
    local -n ar="$1"
    local fn="$2"

    for i in "${!ar[@]}"; do
        # index value
        "$fn" "$i" "${ar[$i]}"
    done
}

simba_array_log() {
    simba_array_for_each "$1" simba_print
}

# simba_array_find() {}
# simba_array_find_index() {}
# simba_array_includes() {}
