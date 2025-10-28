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
$isAuth = false;
$stats  = ['total' => 0, 'open' => 0, 'resolved' => 0];
$tickets = [
  // example: ['id'=>123,'title'=>'Example Ticket','status'=>'open','relativeTime'=>'2h ago']
];

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$theme = 'light'; // or 'dark'

switch ($uri) {
  case '/':
    echo $twig->render('pages/landing.twig', [
      'title'       => 'myTickets Manager',
      'theme'       => $theme,
      'is_auth'     => $isAuth,
      'copyGlobal'  => $copyGlobal,
      'copyLanding' => $copyLanding,
    ]);
    break;

  case '/auth/login':
    echo $twig->render('pages/auth/login.twig', [
      'title'      => $copyLogin['title'],
      'theme'      => $theme,
      'is_auth'    => $isAuth,
      'copyGlobal' => $copyGlobal,
      'copyLogin'  => $copyLogin,
    ]);
    break;

  case '/auth/signup':
    echo $twig->render('pages/auth/signup.twig', [
      'title'      => $copySignup['title'],
      'theme'      => $theme,
      'is_auth'    => $isAuth,
      'copyGlobal' => $copyGlobal,
      'copySignup' => $copySignup,
    ]);
    break;

  case '/dashboard':
    echo $twig->render('pages/dashboard.twig', [
      'title'        => $copyDashboard['title'],
      'theme'        => $theme,
      'is_auth'      => true,
      'copyGlobal'   => $copyGlobal,
      'copyDashboard'=> $copyDashboard,
      'stats'        => $stats,
    ]);
    break;

  case '/tickets':
    echo $twig->render('pages/tickets/index.twig', [
      'title'       => $copyTickets['title'],
      'theme'       => $theme,
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
      ];
      echo $twig->render('pages/tickets/edit.twig', [
        'title'          => 'Edit Ticket',
        'theme'          => $theme,
        'is_auth'        => true,
        'copyGlobal'     => $copyGlobal,
        'copyTicketEdit' => $copyTicketEdit,
        'ticket'         => $ticket,
      ]);
      break;
    }

    http_response_code(404);
    echo $twig->render('base.twig', [
      'title'      => 'Not Found',
      'theme'      => $theme,
      'copyGlobal' => $copyGlobal,
    ]);
}
