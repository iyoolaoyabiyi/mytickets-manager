#!/usr/bin/env bash
set -euo pipefail

# Creates a self-contained zip suitable for uploading to cPanel and extracting into
# a subfolder (e.g. public_html/mytickets-manager). The resulting zip will contain
# a folder named `mytickets-manager` with all PHP, templates, assets and vendor files.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT_DIR/dist/cpanel/mytickets-manager"
ZIP_OUT="$ROOT_DIR/dist/mytickets-manager.zip"

echo "Preparing cPanel deploy bundle..."
rm -rf "$ROOT_DIR/dist/cpanel" "$ZIP_OUT"
mkdir -p "$OUT_DIR"

echo "Copying twig app files..."
rsync -a "$ROOT_DIR/twig/index.php" "$ROOT_DIR/twig/router.php" "$ROOT_DIR/twig/.htaccess" "$OUT_DIR/"
rsync -a "$ROOT_DIR/twig/assets" "$OUT_DIR/"
rsync -a "$ROOT_DIR/twig/templates" "$OUT_DIR/"
rsync -a "$ROOT_DIR/twig/vendor" "$OUT_DIR/"

echo "Including packages (copy JSON, media, fonts)..."
rsync -a "$ROOT_DIR/packages" "$OUT_DIR/"

echo "Adding deploy README..."
mkdir -p "$OUT_DIR/.deploy_info"
cp -v "$ROOT_DIR/deploy/cpanel/README.txt" "$OUT_DIR/.deploy_info/README.txt" || true

echo "Patching index.php to support being placed inside a subfolder with bundled packages..."
# Use our deploy-friendly index.php located in deploy/cpanel if available; fallback to the original
if [ -f "$ROOT_DIR/deploy/cpanel/index.php" ]; then
  cp -v "$ROOT_DIR/deploy/cpanel/index.php" "$OUT_DIR/index.php"
fi

echo "Creating zip: $ZIP_OUT"
cd "$ROOT_DIR/dist/cpanel"
zip -r "$ZIP_OUT" mytickets-manager > /dev/null

echo "Bundle created: $ZIP_OUT"
echo "Contents (top-level):"
unzip -l "$ZIP_OUT" | sed -n '1,20p'

echo "Done. Upload and extract $ZIP_OUT into your site's public folder (e.g. public_html)."

exit 0
