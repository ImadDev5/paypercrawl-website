<?php
/**
 * Optional IP Intelligence lookup (log-only)
 */
if (!defined('ABSPATH')) { exit; }

class CrawlGuard_IP_Intel {
    public static function lookup($ip) {
        $opts = get_option('crawlguard_options');
        if (empty($opts['feature_flags']['enable_ip_intel'])) return null;
        $provider = $opts['ip_intel']['provider'] ?? 'none';
        if ($provider === 'ipinfo') {
            $token = $opts['ip_intel']['ipinfo_token'] ?? '';
            if (!$token || !$ip) return null;
            $url = 'https://ipinfo.io/' . rawurlencode($ip) . '/json?token=' . rawurlencode($token);
            $resp = wp_remote_get($url, [ 'timeout' => 2 ]);
            if (is_wp_error($resp)) return null;
            $code = wp_remote_retrieve_response_code($resp);
            if ($code >= 200 && $code < 300) {
                $body = wp_remote_retrieve_body($resp);
                return $body;
            }
        }
        // MaxMind or others can be integrated here later
        return null;
    }
}
