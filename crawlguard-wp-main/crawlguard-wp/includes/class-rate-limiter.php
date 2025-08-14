<?php
/**
 * Lightweight rate limiter (feature-flagged, non-blocking by default)
 */
if (!defined('ABSPATH')) { exit; }

class CrawlGuard_RateLimiter {
    public static function maybe_limit_current_request() {
        $opts = get_option('crawlguard_options');
        if (empty($opts['feature_flags']['enable_rate_limiting'])) return;
        $limits = $opts['rate_limits'];
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
        if (!$ip && !$ua) return;
        $bucket_ip = 'ip:' . $ip;
        $bucket_ua = 'ua:' . substr(md5($ua), 0, 16);
        $limited = false;
        $limited = self::touch_and_check($bucket_ip, '1m', (int)$limits['per_ip_per_min']) || $limited;
        $limited = self::touch_and_check($bucket_ip, '1h', (int)$limits['per_ip_per_hour']) || $limited;
        $limited = self::touch_and_check($bucket_ua, '1m', (int)$limits['per_ua_per_min']) || $limited;
        if ($limited) { header('X-CrawlGuard-Rate-Limited: 1'); }
    }
    private static function touch_and_check($bucket, $period, $cap) {
        global $wpdb; $table = $wpdb->prefix.'crawlguard_rate_limits';
        $window_start = self::current_window_start($period);
        $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE bucket=%s AND period=%s", $bucket, $period));
        if (!$row) { $wpdb->insert($table, ['bucket'=>$bucket,'period'=>$period,'window_start'=>$window_start,'count'=>1,'last_ip'=>($_SERVER['REMOTE_ADDR']??''),'last_ua'=>($_SERVER['HTTP_USER_AGENT']??'')], ['%s','%s','%s','%d','%s','%s']); return false; }
        if ($row->window_start < $window_start) { $wpdb->update($table, ['window_start'=>$window_start,'count'=>1,'last_ip'=>($_SERVER['REMOTE_ADDR']??''),'last_ua'=>($_SERVER['HTTP_USER_AGENT']??'')], ['id'=>$row->id], ['%s','%d','%s','%s'], ['%d']); return false; }
        $count = (int)$row->count + 1; $wpdb->update($table, ['count'=>$count,'last_ip'=>($_SERVER['REMOTE_ADDR']??''),'last_ua'=>($_SERVER['HTTP_USER_AGENT']??'')], ['id'=>$row->id], ['%d','%s','%s'], ['%d']); return $count > $cap;
    }
    private static function current_window_start($period) { $t = current_time('timestamp'); return $period==='1h' ? date('Y-m-d H:00:00',$t) : date('Y-m-d H:i:00',$t); }
}
