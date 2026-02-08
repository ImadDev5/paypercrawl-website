<?php
/**
 * Configuration class for CrawlGuard WP
 * 
 * Manages all plugin configuration including Cloudflare settings
 */

if (!defined('ABSPATH')) {
    exit;
}

class CrawlGuard_Config {
    
    /**
     * Get Cloudflare API configuration
     */
    public static function get_cloudflare_config() {
        // Configuration should be set via environment variables or WordPress options
        return array(
            'worker_url' => defined('CLOUDFLARE_WORKER_URL') ? CLOUDFLARE_WORKER_URL : '',
            'custom_domain' => defined('CRAWLGUARD_API_BASE_URL') ? CRAWLGUARD_API_BASE_URL : 'https://paypercrawl.tech/api',
            'api_base_url' => defined('CRAWLGUARD_API_BASE_URL') ? CRAWLGUARD_API_BASE_URL : 'https://paypercrawl.tech/api',
            'account_id' => defined('CLOUDFLARE_ACCOUNT_ID') ? CLOUDFLARE_ACCOUNT_ID : '',
            'zone_id' => defined('CLOUDFLARE_ZONE_ID') ? CLOUDFLARE_ZONE_ID : ''
        );
    }
    
    /**
     * Get API endpoints
     */
    public static function get_api_endpoints() {
        $base_url = self::get_cloudflare_config()['api_base_url'];
        
        return array(
            'validate' => $base_url . '/auth/validate',
            'monetize' => $base_url . '/monetize',
            'analytics' => $base_url . '/analytics',
            'register' => $base_url . '/sites/register',
            'settings' => $base_url . '/sites/settings',
            'payments' => $base_url . '/payments',
            'beacon' => $base_url . '/beacon',
            'status' => $base_url . '/status',
            'emergency' => $base_url . '/emergency-status'
        );
    }
    
    /**
     * Get WordPress site configuration
     */
    public static function get_site_config() {
        return array(
            'site_url' => get_site_url(),
            'site_name' => get_bloginfo('name'),
            'admin_email' => get_option('admin_email'),
            'wordpress_version' => get_bloginfo('version'),
            'php_version' => phpversion(),
            'plugin_version' => CRAWLGUARD_VERSION
        );
    }
    
    /**
     * Get debug configuration
     */
    public static function get_debug_config() {
        return array(
            'debug_mode' => defined('WP_DEBUG') && WP_DEBUG,
            'debug_log' => defined('WP_DEBUG_LOG') && WP_DEBUG_LOG,
            'debug_display' => defined('WP_DEBUG_DISPLAY') && WP_DEBUG_DISPLAY,
            'environment' => defined('WP_ENVIRONMENT') ? WP_ENVIRONMENT : 'production'
        );
    }
    
    /**
     * Check if plugin is in development mode
     */
    public static function is_development() {
        $debug = self::get_debug_config();
        return $debug['environment'] === 'development' || $debug['debug_mode'];
    }
    
    /**
     * Get timeout settings for API calls
     */
    public static function get_timeout_settings() {
        return array(
            'default' => 5,
            'analytics' => 10,
            'beacon' => 1,
            'validation' => 3
        );
    }
    
    /**
     * Get rate limiting settings
     */
    public static function get_rate_limits() {
        return array(
            'api_calls_per_minute' => 60,
            'api_calls_per_hour' => 1000,
            'beacon_calls_per_minute' => 120
        );
    }
}
