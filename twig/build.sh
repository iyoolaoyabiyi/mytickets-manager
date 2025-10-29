#!/usr/bin/env bash
set -e

# Directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Building production assets..."

# Install dependencies if needed
if [ ! -d "vendor" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-dev --optimize-autoloader
fi

if [ ! -d "node_modules" ]; then
    echo "Installing NPM dependencies..."
    npm install
fi

# Build steps
echo "Clearing old cache..."
rm -rf var/cache/*

echo "Compiling Twig templates..."
php build.php

echo "Optimizing autoloader..."
composer dump-autoload --optimize --no-dev

# Create production .htaccess if it doesn't exist
if [ ! -f ".htaccess" ]; then
    echo "Creating production .htaccess..."
    cat > .htaccess << 'EOF'
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
fi

# Create dist directory
echo "Creating distribution package..."
mkdir -p dist
rm -rf dist/*

# Copy required files
cp -r \
    index.php \
    router.php \
    .htaccess \
    vendor \
    templates \
    assets \
    var/cache \
    dist/

# Copy only required JSON files
mkdir -p dist/packages/assets/copy
cp packages/assets/copy/*.json dist/packages/assets/copy/

# Remove development files from dist
rm -f dist/dump.php

echo "Build complete! Production files are in the dist/ directory"
echo "Deploy the contents of the dist/ directory to your web server"