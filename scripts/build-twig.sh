#!/usr/bin/env bash
set -e

# Directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/.."  # Go to dist in project root

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
    apps/twig/index.php \
    apps/twig/router.php \
    apps/twig/.htaccess \
    apps/twig/vendor \
    apps/twig/templates \
    apps/twig/packages \
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
zip -r "../dist/$ZIP_NAME" "$APP_NAME"
cd ..

# Cleanup
echo "Cleaning up..."
rm -rf "$BUILD_DIR"

echo "Package created: $ZIP_NAME"
echo "Upload this file to cPanel and extract to your document root"uo pipefail

exit 0
