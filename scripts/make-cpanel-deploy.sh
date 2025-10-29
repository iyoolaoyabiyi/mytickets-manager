#!/usr/bin/env bash
set -e

# Directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/.."  # Go to project root

# Configuration
APP_NAME="mytickets-manager"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ZIP_NAME="${APP_NAME}_${TIMESTAMP}.zip"
BUILD_DIR="build_tmp"

echo "Creating deployment package for cPanel..."

# Clean and create build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/$APP_NAME"

# Copy required files and directories
echo "Copying application files..."
cp -r \
    twig/index.php \
    twig/router.php \
    twig/.htaccess \
    twig/vendor \
    twig/templates \
    twig/assets \
    packages \
    "$BUILD_DIR/$APP_NAME/"

# Remove any existing development files
echo "Removing development files..."
rm -f "$BUILD_DIR/$APP_NAME/dump.php"
rm -rf "$BUILD_DIR/$APP_NAME/var/cache/"*

# Create required directories
mkdir -p "$BUILD_DIR/$APP_NAME/var/cache/twig"
chmod -R 777 "$BUILD_DIR/$APP_NAME/var/cache"

# Ensure .htaccess exists with correct settings
echo "Creating production .htaccess..."
cat > "$BUILD_DIR/$APP_NAME/.htaccess" << 'EOF'
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /mytickets-manager/
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [L,QSA]
</IfModule>

# Enable output compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json
</IfModule>

# Set security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/x-javascript "access plus 1 month"
    ExpiresByType application/json "access plus 0 seconds"
</IfModule>
EOF

# Create zip archive
echo "Creating zip archive..."
cd "$BUILD_DIR"
zip -r "../$ZIP_NAME" "$APP_NAME"
cd ..

# Cleanup
echo "Cleaning up..."
rm -rf "$BUILD_DIR"

echo "Package created: $ZIP_NAME"
echo "Upload this file to cPanel and extract to your document root"uo pipefail

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

# If REWRITE_BASE is set (or provided as first arg), patch the .htaccess in the bundle to include RewriteBase
REWRITE_BASE="${1:-${REWRITE_BASE:-}}"
if [ -n "$REWRITE_BASE" ]; then
  echo "Applying RewriteBase: $REWRITE_BASE to .htaccess"
  HT="${OUT_DIR}/.htaccess"
  if [ -f "$HT" ]; then
    # Insert RewriteBase after RewriteEngine On if not already present
    if ! grep -q "RewriteBase" "$HT"; then
      awk -v rb="$REWRITE_BASE" 'BEGIN{ins=0} /RewriteEngine On/{print; print "    RewriteBase " rb; ins=1; next} {print}' "$HT" > "$HT.tmp" && mv "$HT.tmp" "$HT"
    else
      # replace existing RewriteBase
      sed -i "s#RewriteBase .*#RewriteBase $REWRITE_BASE#" "$HT"
    fi
  fi
fi

echo "Creating zip: $ZIP_OUT"
cd "$ROOT_DIR/dist/cpanel"
zip -r "$ZIP_OUT" mytickets-manager > /dev/null

echo "Bundle created: $ZIP_OUT"
echo "Contents (top-level):"
unzip -l "$ZIP_OUT" | sed -n '1,20p'

echo "Done. Upload and extract $ZIP_OUT into your site's public folder (e.g. public_html)."

exit 0
