# use utils.sh

simba_dict_create() {
    local name="$1"
    if simba_defined $name || command -v $name; then
        simba_fatal "simba_dict_create: Occupied identifier: '$name'"
    fi
    declare -gA $name
}

simba_dict_set() {
    local -n dict="$1"
    local key="$2"
    local value="$3"
    dict["$key"]="$value"
}

simba_dict_unset() {
    local -n dict="$1"
    local key="$2"
    unset dict["$key"]
}

simba_dict_exists() {
    local -n dict="$1"
    local key="$2"
    return $(simba_defined dict[$key])
}

simba_dict_get() {
    local -n dict="$1"
    local key="$2"
    echo "${dict[$key]}"
}

simba_dict_keys() {
    local -n dict="$1"
    echo "${!dict[@]}"
}

simba_dict_values() {
    local -n dict="$1"
    echo "${dict[@]}"
}

simba_dict_clear() {
    local -n dict="$1"
    dict=()
}

simba_dict_for_each() {
    local -n dict="$1"
    local fn="$2"

    for key in "${!dict[@]}"; do
        # key value
        "$fn" "$key" "${dict[$key]}"
    done
}

simba_dict_map() {
    local -n dict_from="$1"
    simba_dict_create "$2"
    local -n dict_to="$2"
    local fn="$3"

    for key in "${!dict_from[@]}"; do
        # key value
        dict_to["$key"]="$($fn "$key" ${dict_from["$key"]})"
    done
}

simba_dict_log() {
    simba_dict_for_each "$1" simba_print
}
