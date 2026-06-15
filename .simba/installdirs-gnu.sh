# use envars.sh

simba_define_installdirs_gnu() {
    ## GNU standard installation directory variables
    ## https://www.gnu.org/prep/standards/html_node/Directory-Variables.html

    #	Root installation directory.
    simba_define_btime_envar_respectfully prefix	'/usr/local'
    # Installation directory for binaries and libraries (architecture-dependent files).
    simba_define_btime_envar_respectfully exec_prefix	'${prefix}'
    # Location for user executables (e.g., /usr/local/bin).
    simba_define_btime_envar_respectfully bindir	'${exec_prefix}/bin'
    # Location for system admin executables.
    simba_define_btime_envar_respectfully sbindir	'${exec_prefix}/sbin'
    #	Executables not meant to be run directly by users.
    simba_define_btime_envar_respectfully libexecdir	'${exec_prefix}/libexec'
    # Root directory for architecture-independent files.
    simba_define_btime_envar_respectfully datarootdir	'${prefix}/share'
    # Data files (e.g., icons, documentation, templates).
    simba_define_btime_envar_respectfully datadir	'${datarootdir}'
    # Configuration files (e.g., /usr/local/etc).
    simba_define_btime_envar_respectfully sysconfdir	'${prefix}/etc'
    #	Machine-independent, architecture-independent data.
    simba_define_btime_envar_respectfully sharedstatedir	'${prefix}/com'
    # Machine-specific variable data (e.g., logs, caches).
    simba_define_btime_envar_respectfully localstatedir	'${prefix}/var'
    #	Runtime state data (e.g., PID files, sockets).
    simba_define_btime_envar_respectfully runstatedir	'${localstatedir}/run'
    # Header files for development (e.g., /usr/local/include).
    simba_define_btime_envar_respectfully includedir	'${prefix}/include'
    #	System headers (rarely changed).
    simba_define_btime_envar_respectfully oldincludedir	'/usr/include'
    #	Documentation.
    simba_define_btime_envar_respectfully docdir	'${datarootdir}/doc/${PROGRAM_NAME}'
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
    simba_define_btime_envar_respectfully tmpdir '/tmp'
    simba_define_btime_envar_respectfully tmpdir_persistent '/var/tmp'
    simba_define_btime_envar_respectfully statedir '${localstatedir}/lib/${PROGRAM_NAME}'
    simba_define_btime_envar_respectfully cachedir '${localstatedir}/cache/${PROGRAM_NAME}'
    simba_define_btime_envar_respectfully logdir '${localstatedir}/log/${PROGRAM_NAME}'
    simba_define_btime_envar_respectfully spooldir '${localstatedir}/spool/${PROGRAM_NAME}'
    simba_define_btime_envar_respectfully lockdir '${runstatedir}'
    simba_define_btime_envar_respectfully desktopdir '${datarootdir}/applications'
    simba_define_btime_envar_respectfully icondir '${datarootdir}/icons'
    simba_define_btime_envar_respectfully metainfodir '${datarootdir}/metainfo'
}
