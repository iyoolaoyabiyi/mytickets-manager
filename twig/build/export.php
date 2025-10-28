<?php
declare(strict_types=1);

use Symfony\Component\Asset\Packages;
use Symfony\Component\Asset\VersionStrategy\EmptyVersionStrategy;
use Symfony\Component\Asset\PathPackage;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;
use Twig\TwigFunction;

require __DIR__ . '/../vendor/autoload.php';

// 1) Twig loader with sensible namespaces
$loader = new FilesystemLoader([
    __DIR__ . '/../templates', // root
]);
$loader->addPath(__DIR__ . '/../templates/pages', 'pages');
$loader->addPath(__DIR__ . '/../templates/partials', 'partials');

// 2) Twig env
$twig = new Environment($loader, [
    'cache' => __DIR__ . '/../var/cache/twig', // enable in dev too for speed; auto_reload takes care of freshness
    'auto_reload' => true,
    'strict_variables' => true,               // fail fast on typos
]);

// 3) Asset packages
// Base path for all public assets in the final build
$publicBasePath = '.../../packages/assets';

// Basic versioning strategy (query param). Swap for a hash strategy later if needed.
$versionStrategy = new EmptyVersionStrategy();
$packages = new Packages(new PathPackage($publicBasePath, $versionStrategy));

// 4) asset() function available in Twig
$twig->addFunction(new TwigFunction('asset', function (string $path, ?string $package = null) use ($packages) {
    // Normalize user input
    $path = ltrim($path, '/');
    // Build URL (e.g., /assets/styles/style.css)
    return $packages->getUrl($path, $package);
}));

// 5) Optional: cache-busted helper using file mtime in dist during runtime builds
$twig->addFunction(new TwigFunction('asset_versioned', function (string $path, string $distAssetsRoot) use ($packages) {
    $publicUrl = $packages->getUrl(ltrim($path, '/'));
    $fsPath = rtrim($distAssetsRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, ltrim($path, '/'));
    if (is_file($fsPath)) {
        $ver = filemtime($fsPath);
        return $publicUrl . '?v=' . $ver;
    }
    return $publicUrl;
}));

return $twig;
