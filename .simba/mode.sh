simba_mode_in_dev() {
    return $(test "$MODE" == dev || test "$MODE" == development)
}

simba_mode_in_test() {
    return $(test "$MODE" == test)
}

simba_mode_in_stag() {
    return $(test "$MODE" == stag || test "$MODE" == staging)
}

simba_mode_in_prod() {
    return $(test "$MODE" == prod || test "$MODE" == production)
}

simba_mode_in_debug() {
    return $(test -n "${DEBUG+x}" && (test "$DEBUG" == true || test "$DEBUG" == "0"))
}
