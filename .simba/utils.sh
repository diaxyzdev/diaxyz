simba_undefined() {
    return $(test -z "${!1+x}")
}

simba_defined() {
    return $(test -n "${!1+x}")
}

simba_empty() {
    return $(test -z "${1}")
}

simba_nempty() {
    return $(test -n "${1}")
}

simba_true() {
    return $(test "$1" == true || test "$1" == "0")
}

simba_false() {
    return $(test "$1" == false || test "$1" == "1")
}

simba_fatal() {
    echo "$0:" "$@"
    exit 1
}

# $1 parameter must be quoted otherwise it will undergo expansion
# before this function is invoked; meaning every space delimited text
# within shall become a positional argument to the function: $1 -> $1,$2,$3...
simba_trim() {
    echo $1
}

simba_reset_ifs() {
    # IFS needs to be set, to space, tab, and newline, in precisely that order.
    # (If _AS_PATH_WALK were called with IFS unset, it would have the
    # side effect of setting IFS to empty, thus disabling word splitting.)
    # Quoting is to prevent editors from complaining about space-tab.
    as_nl='
    '
    export as_nl
    IFS=" ""	$as_nl"

    PS1='$ '
    PS2='> '
    PS4='+ '

    # Ensure predictable behavior from utilities with locale-dependent output.
    LC_ALL=C
    export LC_ALL
    LANGUAGE=C
    export LANGUAGE
}

simba_log_configure_output() {
    rm -f config.log
    exec > >(tee config.log)
}
