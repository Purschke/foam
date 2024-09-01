#!/bin/sh
echo $PROJ_DIR
shift # ignore the initial -c added by VS Code

# The condition may be wrong because I'm not sure if Nix (!= NixOS) users have this file
if [ -e /run/current-system/sw/bin/nix-shell ]; then
    # A nix-shell is a available
    if [ -e "$PROJ_DIR/.envrc" ]; then
        # Use direnv (usually faster than nix-shell)
        direnv exec $PROJ_DIR $@
    else # TODO you could add an elif for a flake.nix file and launch nix develop instead
        # Use nix-shell
        nix-shell --run "$@"
    fi
else
    # For people not using NixOS
    bash -c "$@"
fi