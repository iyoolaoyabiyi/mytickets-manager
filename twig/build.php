<?php
require __DIR__ . '/vendor/autoload.php';

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

echo "Building Twig templates for production...\n";

// Setup Twig with caching enabled
$loader = new FilesystemLoader(__DIR__ . '/templates');
$twig = new Environment($loader, [
    'cache' => __DIR__ . '/var/cache/twig',
    'auto_reload' => false,
    'debug' => false,
    'optimizations' => -1
]);

// Ensure cache directory exists
if (!is_dir(__DIR__ . '/var/cache/twig')) {
    mkdir(__DIR__ . '/var/cache/twig', 0777, true);
}

// List of all templates to pre-compile
$templates = [
    'base.twig',
    'pages/landing.twig',
    'pages/auth/login.twig',
    'pages/auth/signup.twig',
    'pages/dashboard.twig',
    'pages/tickets/index.twig',
    'pages/tickets/edit.twig'
];

// Warm up the cache by loading each template
foreach ($templates as $template) {
    try {
        echo "Compiling {$template}... ";
        $twig->load($template);
        echo "done.\n";
    } catch (Exception $e) {
        echo "ERROR: {$e->getMessage()}\n";
        exit(1);
    }
}

// Build assets if webpack/postcss config exists
if (file_exists(__DIR__ . '/webpack.config.js')) {
    echo "\nBuilding assets...\n";
    passthru('npm run build', $result);
    if ($result !== 0) {
        echo "Error building assets\n";
        exit(1);
    }
}

echo "\nBuild completed successfully.\n";