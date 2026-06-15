# use utils.sh
# use envars.sh
# use array.sh
# use dict.sh

# if simba_undefined SIMBA_CLI_ARGS; then
#     simba_dict_create SIMBA_CLI_ARGS
# fi

simba_builtin_options() {
    local arg="$1"
    case "$arg" in
        --prefix | --prefix=*) ;;
        --exec_prefix | --exec_prefix=*) ;;
        --bindir | --bindir=*) ;;
        --sbindir | --sbindir=*) ;;
        --libexecdir | --libexecdir=*) ;;
        --datarootdir | --datarootdir=*) ;;
        --datadir | --datadir=*) ;;
        --libdir | --libdir=*) ;;
        --sysconfdir | --sysconfdir=*) ;;
        --sharedstatedir | --sharedstatedir=*) ;;
        --localstatedir | --localstatedir=*) ;;
        --runstatedir | --runstatedir=*) ;;
        --includedir | --includedir=*) ;;
        --oldincludedir | --oldincludedir=*) ;;
        --docdir | --docdir=*) ;;
        --infodir | --infodir=*) ;;
        --htmldir | --htmldir=*) ;;
        --dvidir | --dvidir=*) ;;
        --pdfdir | --pdfdir=*) ;;
        --psdir | --psdir=*) ;;
        --localedir | --localedir=*) ;;
        --mandir | --mandir=*) ;;
        --tmpdir | --tmpdir=*) ;;
        --tmpdir_persistent | --tmpdir_persistent=*) ;;
        --statedir | --statedir=*) ;;
        --cachedir | --cachedir=*) ;;
        --logdir | --logdir=*) ;;
        --spooldir | --spooldir=*) ;;
        --lockdir | --lockdir=*) ;;
        --desktopdir | --desktopdir=*) ;;
        --icondir | --icondir=*) ;;
        --metainfodir | --metainfodir=*) ;;
        *) ;;
        esac
}


#     case "$arg" in
#         # (--name=value) Long option followed by a value delimited by an equal sign
#         --[a-zA-Z][a-zA-Z0-9]*=*)
#             echo '(--name=value) Long option followed by a value delimited by an equal sign'
#             ;;
#         # (--name [value]) Long option followed possibly by a value delimited by a space
#         --[a-zA-Z][a-zA-Z0-9]*)
#             echo '(--name [value]) Long option followed by a possible value delimited by a space'
#             ;;
#         # (-n=v) Short option followed by a value delimited by an equal sign
#         -[a-zA-Z0-9]=*)
#             echo '(-n=v) Short option followed by a value delimited by an equal sign'
#             ;;
#         # (-n [value]) Short option followed possibly by a value
#         -[a-zA-Z0-9])
#             echo '(-n [value]) Short option followed by a possible value'
#             ;;
#         # (-abc) Option chaining
#         -[a-zA-Z0-9][a-zA-Z0-9]*)
#             echo '(-abc) Option chaining'
#             ;;
#         # (abc) Positional option
#         [a-zA-Z0-9]*)
#             echo '(abc) Positional option'
#             ;;
#         # (--) Signals the start of positional arguments
#         --)
#             echo '(--) Signals the start of positional arguments'
#             ;;
#         # Unrecognized
#         *)
#             echo 'Unrecognized'
#             exit 1
#             ;;
#     esac
#     ((++offset))
# }

simba_cli_match_arg() {
    local arg="${cli_args[$offset]}"
    local name=
    local value=
    if ! simba_dict_exists SIMBA_CLI_ARGS "${cli_args[$offset]}"; then
        echo "cli option ${cli_args[$offset]} has not been set"
    else
        echo "cli option ${cli_args[$offset]} has been set"
    fi
    ((++offset))
}

simba_cli_parse_args() {
    declare -ga cli_args=("$@")
    declare -g offset=0
    declare -ga cli_pos_args=()
    declare -g ln="${#cli_args[@]}"

    while test $offset -lt $ln; do
        simba_cli_match_arg
    done

    # while (("${#cli_args[@]}" > 0)); do
    #     echo "${#cli_args[@]}"
    #     simba_cli_match_args "${cli_args[0]}"
    # done
}

# simba_cli_parse_options() {
#     declare -ga POSARGS=()
#     _param=
#     while (($# > 0)); do
#         case "${1:-}" in
#             --mode | --mode=*)
#                 parse_param "$@" || shift $?
#                 MODE="$_param"
#                 ;;
#             --prod | --production)
#                 MODE="$_param"
#                 ;;
#             --dev | --dev)
#                 MODE="$_param"
#                 ;;
#             --url | --url=*)
#                 parse_param "$@" || shift $?
#                 URL="$_param"
#                 ;;
#             --port | --port=*)
#                 parse_param "$@" || shift $?
#                 PORT="$_param"
#                 ;;
#             --buildir | --buildir=*)
#                 parse_param "$@" || shift $?
#                 BUILDIR_BASENAME="$_param"
#                 ;;
#             --distdir | --distdir=*)
#                 parse_param "$@" || shift $?
#                 DISTDIR_BASENAME="$_param"
#                 ;;
#             --prefix | --prefix=*)
#                 parse_param "$@" || shift $?
#                 prefix="$_param"
#                 ;;
#             -h | --help)
#                 usage
#                 exit 0
#                 ;;
#             -[a-zA-Z][a-zA-Z]*)
#                 local i="${1:-}"
#                 shift
#                 local rest="$@"
#                 set --
#                 for i in $(echo "$i" | grep -o '[a-zA-Z]'); do
#                     set -- "$@" "-$i"
#                 done
#                 set -- $@ $rest
#                 continue
#                 ;;
#             --)
#                 shift
#                 POSARGS+=("$@")
#                 ;;
#             -[a-zA-Z]* | --[a-zA-Z]*)
#                 fatal "Unrecognized argument ${1:-}"
#                 ;;
#             *)
#                 POSARGS+=("${1:-}")
#                 ;;
#         esac
#         shift
#     done
# }

simba_cli_define_arg() {
    local cli_name="$1"
    local name="$2"
    local required="$3"
    local default_value="$4"
    simba_define_envar "$name" "$default_value"
    simba_dict_set SIMBA_CLI_ARGS "$cli_name" "$name,$required"
}

