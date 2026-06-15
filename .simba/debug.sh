# use mode.sh

simba_debugv() {
    ! simba_mode_in_debug && return
    echo $1:"${!1}"
}

simba_debug() {
    ! simba_mode_in_debug && return
    echo -e "$@"
}

simba_debug_unless_pipe() {
    ! test -t 1 && return
    simba_debug "$@"
}

simba_debugv_unless_pipe() {
    ! test -t 1 && return
    simba_debugv "$@"
}

simba_print() {
    echo -e "$@"
}

simba_print_unless_pipe() {
    ! test -t 1 && return
    simba_print "$@"
}
