<?php
// Serve existing files (CSS, fonts, images) directly
$path = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (php_sapi_name() === 'cli-server' && is_file($path)) return false;
require __DIR__ . '/index.php';
