#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIPELINE_DIR="$(dirname "$SCRIPT_DIR")"

echo "Checking system dependencies..."

for cmd in tippecanoe ogr2ogr osmium; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: $cmd is not installed."
    echo "Install with: brew install ${cmd/ogr2ogr/gdal}"
    exit 1
  fi
done

echo "All dependencies found."
echo ""

cd "$PIPELINE_DIR"
npx tsx src/index.ts "$@"
