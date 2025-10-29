<?php
require __DIR__ . '/vendor/autoload.php';

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

$loader = new FilesystemLoader(__DIR__ . '/templates');
$twig   = new Environment($loader, ['cache' => false]);

// Figure out the public path prefix where this script runs (supports subfolders)
$scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
$requestUri = str_replace('\\', '/', $_SERVER['REQUEST_URI'] ?? '/');

// Direct detection: if we're under /mytickets-manager/, use that as the base
if (strpos($scriptName, '/mytickets-manager/') === 0 || strpos($requestUri, '/mytickets-manager/') === 0) {
    $pathBase = '/mytickets-manager';
    $scriptDir = '/mytickets-manager';
    $assetBaseUrl = '/mytickets-manager/packages/assets/';
} else {
    // Fallback to computed paths (for different deployment layouts)
    $scriptDirRaw = $scriptName === '' ? '' : str_replace('\\', '/', dirname($scriptName));
    if ($scriptDirRaw === '.' || $scriptDirRaw === '/') {
        $scriptDirRaw = '';
    }
    $scriptDir = $scriptDirRaw === '' ? '' : rtrim($scriptDirRaw, '/');
    $pathBase = $scriptDir; // For this layout, pathBase is the same as scriptDir
    $assetBaseUrl = ($scriptDir === '' ? '' : $scriptDir) . '/packages/assets/';
}

$assetBaseUrl = ($scriptDir === '' ? '' : $scriptDir) . '/packages/assets/';
$stylesBaseUrl = ($scriptDir === '' ? '' : $scriptDir) . '/packages/styles/';

// helper to read copy json
$copy = function(string $name) {
  // Try a few candidate locations (supports slightly different deploys)
  $candidates = [
    dirname(__DIR__) . "/packages/assets/copy/{$name}.json",
    __DIR__ . "/../packages/assets/copy/{$name}.json",
    __DIR__ . "/packages/assets/copy/{$name}.json",
  ];

  foreach ($candidates as $candidate) {
    $path = realpath($candidate);
    if ($path && is_file($path)) {
      $contents = file_get_contents($path);
      $json = json_decode($contents, true);
      if (json_last_error() === JSON_ERROR_NONE) {
        return $json;
      }
      // Invalid JSON — log and return empty array to avoid fatal errors in templates
      error_log("Invalid JSON in copy file {$path}: " . json_last_error_msg());
      return [];
    }
  }

  // Not found — log and return empty array so templates can render without fatal errors
  error_log("Copy file not found: {$name}.json (looked in candidates)");
  return [];
};

// preload copy
$copyGlobal    = $copy('global');
$copyLanding   = $copy('landing');
$copyLogin     = $copy('login');
$copySignup    = $copy('signup');
$copyDashboard = $copy('dashboard');
$copyTickets   = $copy('tickets');
$copyTicketEdit= $copy('ticketEdit');

// mock auth + data (replace with real app logic later)
$session = null;
$isAuth = false;
$stats  = ['total' => 0, 'open' => 0, 'inProgress' => 0, 'closed' => 0];
$tickets = [];

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
if ($uri === '') {
  $uri = '/';
}
if ($pathBase !== '' && strncmp($uri, $pathBase, strlen($pathBase)) === 0) {
  $afterBase = substr($uri, strlen($pathBase));
  if ($afterBase === '' || $afterBase[0] === '/') {
    $uri = $afterBase === '' ? '/' : $afterBase;
  }
}
$theme = 'light'; // or 'dark'

$metaBase = function (string $title, string $description, string $path) use ($pathBase) {
  $canonicalPath = $path;
  if ($pathBase !== '') {
    $canonicalPath = rtrim($pathBase, '/') . $path;
  }
  return [
    'title' => $title . ' · myTickets Manager',
    'description' => $description,
    'canonical' => $canonicalPath === '' ? '/' : $canonicalPath,
  ];
};

switch ($uri) {
  case '/':
    echo $twig->render('pages/landing.twig', [
      'meta'        => $metaBase($copyLanding['hero']['title'], $copyLanding['hero']['subtitle'], '/'),
      'theme'       => $theme,
      'page_id'     => 'landing',
      'page_props'  => ['copy' => $copyLanding],
      'is_auth'     => $isAuth,
      'copyGlobal'  => $copyGlobal,
      'copyLanding' => $copyLanding,
      'asset_base_url' => $assetBaseUrl,
      'styles_base_url' => $stylesBaseUrl,
      'path_base'      => $pathBase,
    ]);
    break;

  case '/auth/login':
    echo $twig->render('pages/auth/login.twig', [
      'meta'       => $metaBase($copyLogin['title'], $copyLogin['tagline'], '/auth/login'),
      'theme'      => $theme,
      'page_id'    => 'login',
      'page_props' => ['copy' => $copyLogin],
      'redirect'   => $_GET['redirect'] ?? '',
      'is_auth'    => false,
      'copyGlobal' => $copyGlobal,
      'copyLogin'  => $copyLogin,
      'asset_base_url' => $assetBaseUrl,
      'styles_base_url' => $stylesBaseUrl,
      'path_base'      => $pathBase,
    ]);
    break;

  case '/auth/signup':
    echo $twig->render('pages/auth/signup.twig', [
      'meta'       => $metaBase($copySignup['title'], $copySignup['tagline'], '/auth/signup'),
      'theme'      => $theme,
      'page_id'    => 'signup',
      'page_props' => ['copy' => $copySignup],
      'is_auth'    => false,
      'copyGlobal' => $copyGlobal,
      'copySignup' => $copySignup,
      'asset_base_url' => $assetBaseUrl,
      'styles_base_url' => $stylesBaseUrl,
      'path_base'      => $pathBase,
    ]);
    break;

  case '/dashboard':
    echo $twig->render('pages/dashboard.twig', [
      'meta'         => $metaBase($copyDashboard['title'], $copyDashboard['subtitle'], '/dashboard'),
      'theme'        => $theme,
      'page_id'      => 'dashboard',
      'page_props'   => ['copy' => $copyDashboard],
      'is_auth'      => true,
      'copyGlobal'   => $copyGlobal,
      'copyDashboard'=> $copyDashboard,
      'copyTickets'  => $copyTickets,
      'stats'        => $stats,
      'asset_base_url' => $assetBaseUrl,
      'styles_base_url' => $stylesBaseUrl,
      'path_base'      => $pathBase,
    ]);
    break;

  case '/tickets':
    echo $twig->render('pages/tickets/index.twig', [
      'meta'        => $metaBase($copyTickets['title'], $copyTickets['title'], '/tickets'),
      'theme'       => $theme,
      'page_id'     => 'tickets',
      'page_props'  => ['copy' => $copyTickets],
      'is_auth'     => true,
      'copyGlobal'  => $copyGlobal,
      'copyTickets' => $copyTickets,
      'tickets'     => $tickets,
      'asset_base_url' => $assetBaseUrl,
      'styles_base_url' => $stylesBaseUrl,
      'path_base'      => $pathBase,
    ]);
    break;

  default:
    // /tickets/123/edit
    if (preg_match('#^/tickets/(\d+)/edit$#', $uri, $m)) {
      $ticket = [
        'id' => (int)$m[1],
        'title' => 'Example Ticket',
        'description' => 'Optional details…',
        'status' => 'open',
        'priority' => 'medium',
      ];
      echo $twig->render('pages/tickets/edit.twig', [
        'meta'           => $metaBase($copyTicketEdit['title'], 'Update ticket details', $uri),
        'theme'          => $theme,
        'page_id'        => 'ticket-edit',
        'page_props'     => ['copy' => $copyTicketEdit, 'ticket' => $ticket],
        'is_auth'        => true,
        'copyGlobal'     => $copyGlobal,
        'copyTicketEdit' => $copyTicketEdit,
        'ticket'         => $ticket,
        'asset_base_url' => $assetBaseUrl,
        'styles_base_url' => $stylesBaseUrl,
        'path_base'      => $pathBase,
      ]);
      break;
    }

    // Check if this might be a route without .php
    $tryWithPhp = $uri . '.php';
    if (is_file(__DIR__ . $tryWithPhp)) {
        header("Location: $pathBase$tryWithPhp");
        exit;
    }

    http_response_code(404);
    echo $twig->render('base.twig', [
      'meta'       => $metaBase('Not Found', 'The requested page could not be located.', $uri),
      'theme'      => $theme,
      'page_id'    => 'not-found',
      'page_props' => [],
      'copyGlobal' => $copyGlobal,
      'asset_base_url' => $assetBaseUrl,
      'styles_base_url' => $stylesBaseUrl,
      'path_base'      => $pathBase,
    ]);
}
