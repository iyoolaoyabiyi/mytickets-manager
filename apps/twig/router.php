<?php
// Development server router - handles static files and forwards other requests
if (php_sapi_name() === 'cli-server') {
    $path = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (is_file($path)) {
        return false; // serve the requested file as-is
    }
}

// Save original script values before requiring index.php
$originalScript = $_SERVER['SCRIPT_NAME'] ?? '';
$originalUri = $_SERVER['REQUEST_URI'] ?? '';

// Ensure consistent script name for path detection
$_SERVER['SCRIPT_NAME'] = '/index.php';
if (isset($_SERVER['REQUEST_URI']) && $_SERVER['REQUEST_URI'] !== '/') {
    // Preserve the subfolder part of the URI if present
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (strpos($uri, '/mytickets-manager/') === 0) {
        $_SERVER['SCRIPT_NAME'] = '/mytickets-manager/index.php';
    }
}

require __DIR__ . '/index.php';
