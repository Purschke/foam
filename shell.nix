let
  pkgs = import <nixpkgs> { config = {}; overlays = []; };
in

pkgs.mkShellNoCC {
  packages = with pkgs; [
    nodejs_21
    typescript
    yarn
    nodePackages_latest.lerna
  ];
}