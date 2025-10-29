#!/usr/bin/env bash
set -euo pipefail

NODE_VERSION="22.12.0"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CACHE_DIR="$SCRIPT_DIR/../.cache/node-v$NODE_VERSION"
NODE_BIN="$CACHE_DIR/bin/node"

if [ ! -x "$NODE_BIN" ]; then
  mkdir -p "$CACHE_DIR"
  ARCHIVE="node-v$NODE_VERSION-linux-x64.tar.xz"
  URL="https://nodejs.org/dist/v$NODE_VERSION/$ARCHIVE"
  TMP_DIR="$(mktemp -d)"
  echo "Downloading Node.js v$NODE_VERSION..." >&2
  curl -fsSL "$URL" -o "$TMP_DIR/$ARCHIVE"
  tar -xJf "$TMP_DIR/$ARCHIVE" -C "$TMP_DIR"
  mv "$TMP_DIR/node-v$NODE_VERSION-linux-x64"/* "$CACHE_DIR"/
  rm -rf "$TMP_DIR"
fi

export PATH="$CACHE_DIR/bin:$PATH"
exec "$@"
