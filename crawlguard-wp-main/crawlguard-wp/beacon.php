<?php
if (!defined('WP_USE_THEMES')) { define('WP_USE_THEMES', false); }
require_once dirname(__FILE__) . '/../../../wp-load.php';
require_once __DIR__.'/includes/class-api-client.php';
$body=file_get_contents('php://input'); $data=json_decode($body,true); if(!is_array($data)){$data=[];}
$client=new CrawlGuard_API_Client();
$client->send_beacon(['ip'=>($_SERVER['REMOTE_ADDR']??''),'ua'=>($_SERVER['HTTP_USER_AGENT']??''),'payload'=>$data]);
header('Content-Type: application/json'); echo json_encode(['ok'=>true]); exit;
