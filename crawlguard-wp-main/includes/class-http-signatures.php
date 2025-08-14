<?php
/**
 * HTTP Message Signatures verification (log-only)
 * - When enabled, verify incoming requests if signature headers present and log failures.
 */
if (!defined('ABSPATH')) { exit; }

class CrawlGuard_HTTP_Signatures {
    public static function verify_current_request() {
        $opts = get_option('crawlguard_options');
        if (empty($opts['feature_flags']['enable_http_signatures'])) {
            return true; // feature disabled
        }
        $sig = $_SERVER['HTTP_SIGNATURE'] ?? '';
        $sigInput = $_SERVER['HTTP_SIGNATURE_INPUT'] ?? '';
        if (!$sig || !$sigInput) return true; // nothing to verify

        // Extract keyId (very simplified parser)
        if (!preg_match('/keyid="([^"]+)"/', $sig, $m)) return false;
        $client_id = $m[1];

        global $wpdb;
        $table = $wpdb->prefix . 'crawlguard_signing_keys';
        $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE client_id=%s", $client_id));
        if (!$row) return false;

        // Build the signing string (simplified; placeholder for RFC 9421)
        $target = $_SERVER['REQUEST_METHOD'] . ' ' . ($_SERVER['REQUEST_URI'] ?? '/');
        $signing_string = strtolower($target);

        // Extract signature value
        if (!preg_match('/signature="([a-zA-Z0-9+\/=]+)"/', $sig, $sm)) return false;
        $sig_bin = base64_decode($sm[1]);

        // Verify using OpenSSL public key
        $ok = openssl_verify($signing_string, $sig_bin, $row->public_key, OPENSSL_ALGO_SHA256);
        return $ok === 1;
    }
}
