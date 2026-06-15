# XDG Base Directory specification
# https://specifications.freedesktop.org/basedir-spec/latest/
# use envars

simba_define_installdirs_xdg() {
    # Standard XDG file permission
    simba_define_ctime_envar_respectfully XDG_PERMISSIONS 0700

    # Standard XDG base directory variables
    simba_define_ctime_envar_respectfully XDG_DATA_HOME "${XDG_DATA_HOME:-${HOME}/.local/share}"
    simba_define_ctime_envar_respectfully XDG_CONFIG_HOME "${XDG_CONFIG_HOME:-${HOME}/.config}"
    simba_define_ctime_envar_respectfully XDG_STATE_HOME "${XDG_STATE_HOME:-${HOME}/.local/state}"
    simba_define_ctime_envar_respectfully XDG_CACHE_HOME "${XDG_CACHE_HOME:-${HOME}/.cache}"
    simba_define_ctime_envar_respectfully XDG_RUNTIME_DIR "${XDG_RUNTIME_DIR:-/run}"

    # Standard XDG lookup paths
    # A lookup is performed in decreasing order of precedence starting with:
    # XDG_DATA_HOME, XDG_DATA_DIRS[0], XDG_DATA_DIRS[1],...
    # XDG_CONFIG_HOME, XDG_CONFIG_DIRS[0], XDG_CONFIG_DIRS[1],...
    simba_define_ctime_envar_respectfully XDG_DATA_DIRS "${XDG_DATA_DIRS:-'/usr/local/share/:/usr/share/'}"
    simba_define_ctime_envar_respectfully XDG_CONFIG_DIRS "${XDG_CONFIG_DIRS:-/etc/xdg}"

    #	Root installation directory.
    simba_define_btime_envar_respectfully prefix	'${HOME}/.local'
    # Installation directory for binaries and libraries (architecture-dependent files).
    simba_define_btime_envar_respectfully exec_prefix	'${prefix}'
    # Location for user executables (e.g., /usr/local/bin).
    simba_define_btime_envar_respectfully bindir	'${exec_prefix}/bin'
    # Location for system admin executables.
    simba_define_btime_envar_respectfully sbindir	'${exec_prefix}/sbin'
    #	Executables not meant to be run directly by users.
    simba_define_btime_envar_respectfully libexecdir	'${exec_prefix}/libexec'
    # Root directory for architecture-independent files.
    simba_define_btime_envar_respectfully datarootdir	'${XDG_DATA_HOME}'
    # Data files (e.g., icons, documentation, templates).
    simba_define_btime_envar_respectfully datadir	'${datarootdir}'
    # Configuration files (e.g., /usr/local/etc).
    simba_define_btime_envar_respectfully sysconfdir	'${XDG_CONFIG_HOME}'
    #	Machine-independent, architecture-independent data.
    simba_define_btime_envar_respectfully sharedstatedir	'${{XDG_STATE_HOME}'
    # Machine-specific variable data (e.g., logs, caches).
    simba_define_btime_envar_respectfully localstatedir	'${XDG_STATE_HOME}'
    #	Runtime state data (e.g., PID files, sockets).
    simba_define_btime_envar_respectfully runstatedir	'${XDG_RUNTIME_DIR}'
    # Header files for development (e.g., /usr/local/include).
    simba_define_btime_envar_respectfully includedir	'${prefix}/include'
    #	System headers (rarely changed).
    simba_define_btime_envar_respectfully oldincludedir	'/usr/include'
    #	Documentation.
    simba_define_btime_envar_respectfully docdir	'${datarootdir}/doc'
    #	GNU Info pages.
    simba_define_btime_envar_respectfully infodir	'${datarootdir}/info'
    #	Man pages.
    simba_define_btime_envar_respectfully mandir	'${datarootdir}/man'
    #	HTML documentation.
    simba_define_btime_envar_respectfully htmldir	'${docdir}'
    #	PDF documentation.
    simba_define_btime_envar_respectfully pdfdir	'${docdir}'
    #	PostScript documentation.
    simba_define_btime_envar_respectfully psdir	'${docdir}'
    #	Libraries.
    simba_define_btime_envar_respectfully libdir	'${exec_prefix}/lib'
    #	Localization files.
    simba_define_btime_envar_respectfully localedir	'${datarootdir}/locale'

    # Derived installation directories
    simba_define_btime_envar_respectfully tmpdir '${HOME}/tmp'
    simba_define_btime_envar_respectfully tmpdir_persistent '${tmpdir}'
    simba_define_btime_envar_respectfully statedir '${localstatedir}/lib/${PROGRAM_NAME}'
    simba_define_btime_envar_respectfully cachedir '${XDG_CACHE_HOME}/${PROGRAM_NAME}'
    simba_define_btime_envar_respectfully logdir '${localstatedir}/log/${PROGRAM_NAME}'
    simba_define_btime_envar_respectfully spooldir '${localstatedir}/spool/${PROGRAM_NAME}'
    simba_define_btime_envar_respectfully lockdir '${runstatedir}'
    simba_define_btime_envar_respectfully desktopdir '${datarootdir}/applications'
    simba_define_btime_envar_respectfully icondir '${datarootdir}/icons'
    simba_define_btime_envar_respectfully metainfodir '${datarootdir}/metainfo'
}
