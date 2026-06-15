# use envars.sh
# use utils.sh

# Defines 2 important directories.
# The directory where the ./configure script is run from
# The directory where the ./configure script is located
# The 1st directory is where the build is to take place (BUILDROOTDIR)
# The 2nd directory is where the source code is located (SRCROOTDIR)
#
# @param {string} ${BASH_SOURCE[0]}
simba_resolve_buildir() {
    if simba_empty "${1}"; then
        simba_fatal 'simba_resolve_buildir: Missing argument "${BASH_SOURCE[0]}"'
    fi
    simba_define_btime_envar BUILDROOTDIR_ABS "$(pwd)"
    simba_define_btime_envar BUILDROOTDIR '.'
    simba_define_btime_envar SRCROOTDIR_ABS "$(cd -- "$(dirname -- "$1")" 2>/dev/null && pwd)"
    simba_define_btime_envar SRCROOTDIR "$(realpath -e --relative-to="$BUILDROOTDIR_ABS" "$SRCROOTDIR_ABS")"
    simba_define_btime_envar SRCDIR '$(SRCDIR)'
    simba_define_btime_envar SRCDIR_ABS '$(SRCDIR_ABS)'
    simba_define_btime_envar BUILDIR_ABS "$BUILDROOTDIR_ABS"
    simba_define_btime_envar BUILDIR "$BUILDROOTDIR"
    simba_define_btime_envar DISTDIR_ABS "${BUILDROOTDIR_ABS}/dist"
    simba_define_btime_envar DISTDIR "$(realpath -m --relative-to="$BUILDROOTDIR_ABS" "$DISTDIR_ABS")"
}
