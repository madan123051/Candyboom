#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT_DIR="$ROOT_DIR/dist"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cp "$ROOT_DIR/index.html" "$OUT_DIR/index.html"
cp "$ROOT_DIR/game.html" "$OUT_DIR/game.html"
cp -R "$ROOT_DIR/levels" "$OUT_DIR/levels"
