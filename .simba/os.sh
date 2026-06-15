# use envars.sh
# use versions.sh

simba_resolve_os() {
    case "$(uname -s)" in
        Linux*)
            BUILD_KERNEL="linux(unix)"
            ;;
        Darwin*)
            BUILD_KERNEL="darwin(apple)"
            ;;
        FreeBSD*)
            BUILD_KERNEL="freebsd(unix)"
            ;;
        OpenBSD*)
            BUILD_KERNEL="openbsd(unix)"
            ;;
        NetBSD*)
            BUILD_KERNEL="netbsd(unix)"
            ;;
        CYGWIN*)
            BUILD_KERNEL="cygwin(windows)"
            ;;
        MINGW*)
            BUILD_KERNEL="mingw(windows)"
            ;;
        *)
            fatal "Could not resolve system: '$(uname -s)'"
            ;;
    esac
    simba_define_btime_envar BUILD_KERNEL
}

simba_resolve_os_dependencies() {
  simba_is_command_installed bash 5.1.16 ">="
  simba_define_ctime_envar_respectfully BASH $command_path

  simba_is_command_installed make 4.3 ">="
  simba_define_ctime_envar_respectfully MAKE $command_path

  simba_is_command_installed m4 1.4.19 ">="
  simba_define_ctime_envar_respectfully M4 $command_path

  simba_is_command_installed rm 9
  simba_define_ctime_envar_respectfully RM $command_path

  simba_is_command_installed mv
  simba_define_ctime_envar_respectfully MV $command_path

  simba_is_command_installed mkdir
  simba_define_ctime_envar_respectfully MKDIR $command_path

  simba_is_command_installed touch
  simba_define_ctime_envar_respectfully TOUCH $command_path

  simba_is_command_installed cp
  simba_define_ctime_envar_respectfully CP $command_path

  simba_is_command_installed cat
  simba_define_ctime_envar_respectfully CAT $command_path

  simba_is_command_installed chmod
  simba_define_ctime_envar_respectfully CHMOD $command_path

  simba_is_command_installed chown
  simba_define_ctime_envar_respectfully CHOWN $command_path

  simba_is_command_installed uname
  simba_define_ctime_envar_respectfully UNAME $command_path

  simba_is_command_installed echo
  simba_define_ctime_envar_respectfully ECHO $command_path

  simba_is_command_installed tar
  simba_define_ctime_envar_respectfully TAR $command_path

  simba_is_command_installed gzip
  simba_define_ctime_envar_respectfully GZIP $command_path

  simba_is_command_installed pwd
  simba_define_ctime_envar_respectfully PWD $command_path

  simba_is_command_installed realpath
  simba_define_ctime_envar_respectfully REALPATH $command_path

  simba_is_command_installed tee
  simba_define_ctime_envar_respectfully TEE $command_path

  simba_is_command_installed printenv
  simba_define_ctime_envar_respectfully PRINTENV $command_path

  simba_is_command_installed mktemp
  simba_define_ctime_envar_respectfully MKTEMP $command_path

  simba_is_command_installed cat
  simba_define_ctime_envar_respectfully CAT $command_path

  simba_is_command_installed tr
  simba_define_ctime_envar_respectfully TR $command_path

  simba_is_command_installed cut
  simba_define_ctime_envar_respectfully CUT $command_path

  simba_is_command_installed head
  simba_define_ctime_envar_respectfully HEAD $command_path

  simba_is_command_installed tail
  simba_define_ctime_envar_respectfully TAIL $command_path

  simba_is_command_installed grep
  simba_define_ctime_envar_respectfully GREP $command_path

  simba_is_command_installed sed
  simba_define_ctime_envar_respectfully SED $command_path

  simba_is_command_installed sort
  simba_define_ctime_envar_respectfully SORT $command_path

  simba_is_command_installed git
  simba_define_ctime_envar_respectfully GIT $command_path
}
