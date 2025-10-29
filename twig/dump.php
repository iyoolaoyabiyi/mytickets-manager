<?php
// Temporary debug endpoint to inspect server variables used for routing
// Access: https://host.iyoolaoyabiyi.com/mytickets-manager/dump.php
header('Content-Type: text/plain; charset=utf-8');

$server = $_SERVER;
echo "Collected \\$_SERVER variables:\n\n";
$keys = [
  'REQUEST_URI','SCRIPT_NAME','PHP_SELF','SCRIPT_FILENAME','DOCUMENT_ROOT','REQUEST_FILENAME','HTTP_HOST', 'HTTP_X_REWRITE_URL'
];
foreach ($keys as $k) {
  echo sprintf("%s: %s\n", $k, isset($server[$k]) ? $server[$k] : "(not set)");
}

echo "\nDerived values:\n";
$scriptName = str_replace('\\', '/', $server['SCRIPT_NAME'] ?? '');
$scriptDirRaw = $scriptName === '' ? '' : str_replace('\\', '/', dirname($scriptName));
if ($scriptDirRaw === '.' || $scriptDirRaw === '/') {
  $scriptDirRaw = '';
}
$scriptDir = $scriptDirRaw === '' ? '' : rtrim($scriptDirRaw, '/');
$mountBaseRaw = $scriptDir === '' ? '' : str_replace('\\', '/', dirname($scriptDir));
if ($mountBaseRaw === '.' || $mountBaseRaw === '/') {
  $mountBaseRaw = '';
}
$pathBase = $mountBaseRaw === '' ? '' : rtrim($mountBaseRaw, '/');

echo "scriptName: " . ($scriptName === '' ? '(empty)' : $scriptName) . "\n";
echo "scriptDir: " . ($scriptDir === '' ? '(empty)' : $scriptDir) . "\n";
echo "mountBaseRaw: " . ($mountBaseRaw === '' ? '(empty)' : $mountBaseRaw) . "\n";
echo "pathBase (derived): " . ($pathBase === '' ? '(empty)' : $pathBase) . "\n";

echo "\nparse_url(REQUEST_URI, PHP_URL_PATH): " . (parse_url($server['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/') . "\n";

exit(0);
