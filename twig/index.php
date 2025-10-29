<?php
require __DIR__ . '/vendor/autoload.php';

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

$loader = new FilesystemLoader(__DIR__ . '/templates');
$twig   = new Environment($loader, ['cache' => false]);

// helper to read copy json
$copy = function(string $name) {
  $path = realpath(dirname(__DIR__) . "/packages/assets/copy/{$name}.json");
  if (!$path || !is_file($path)) {
    return null; // or [] or throw an exception
  }
  return json_decode(file_get_contents($path), true);
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

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$theme = 'light'; // or 'dark'

$metaBase = function (string $title, string $description, string $path) {
  return [
    'title' => $title . ' · myTickets Manager',
    'description' => $description,
    'canonical' => $path
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
      ]);
      break;
    }

    http_response_code(404);
    echo $twig->render('base.twig', [
      'meta'       => $metaBase('Not Found', 'The requested page could not be located.', $uri),
      'theme'      => $theme,
      'page_id'    => 'not-found',
      'page_props' => [],
      'copyGlobal' => $copyGlobal,
    ]);
}
