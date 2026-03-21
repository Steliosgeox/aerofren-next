#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="${ROOT_DIR:-$(pwd)}"
LIB_ROOT="$ROOT_DIR/.playwright-libs/root"
DEB_ROOT="$ROOT_DIR/.playwright-libs/debs"
LIB_DIR="$LIB_ROOT/usr/lib/x86_64-linux-gnu"

mkdir -p "$LIB_ROOT" "$DEB_ROOT"

if [[ -f "$LIB_DIR/libnspr4.so" && -f "$LIB_DIR/libnss3.so" && -f "$LIB_DIR/libasound.so.2" ]]; then
  exit 0
fi

download_package() {
  local package="$1"

  if apt download "$package" >/dev/null 2>&1; then
    return 0
  fi

  if [[ "$package" == "libasound2t64" ]]; then
    apt download "libasound2t64=1.2.11-1build2" >/dev/null 2>&1
    return 0
  fi

  return 1
}

pushd "$DEB_ROOT" >/dev/null
download_package "libnspr4"
download_package "libnss3"
download_package "libasound2t64"
popd >/dev/null

for deb in "$DEB_ROOT"/*.deb; do
  dpkg-deb -x "$deb" "$LIB_ROOT"
done
