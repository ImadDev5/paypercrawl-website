<?php
/**
 * Beacon endpoint (non-blocking). Logs lightweight visit analytics via backend async call.
 */
if (!defined('WP_USE_THEMES')) { define('WP_USE_THEMES', false); }
require_once dirname(__FILE__) . '/../../wp-load.php';

// Read JSON body
$body = file_get_contents('php://input');
$data = json_decode($body, true);
if (!is_array($data)) { $data = array(); }

// Fire-and-forget to backend using API client
require_once __DIR__ . '/includes/class-api-client.php';
$client = new CrawlGuard_API_Client();
$client->send_beacon(array(
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
    'ua' => $_SERVER['HTTP_USER_AGENT'] ?? '',
    'payload' => $data,
));

header('Content-Type: application/json');
echo json_encode(array('ok' => true));
exit;
