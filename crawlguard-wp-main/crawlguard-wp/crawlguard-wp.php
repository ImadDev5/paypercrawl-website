<?php
/**
 * Plugin Name: PayPerCrawl - AI Bot Monetization
 * Plugin URI: https://paypercrawl.tech
 * Description: AI content monetization and bot detection for WordPress. Turn AI bot traffic into revenue with intelligent content protection and real-time analytics.
 * Version: 2.0.0
 * Author: PayPerCrawl Team
 * Author URI: https://paypercrawl.tech
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: crawlguard-wp
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
 */

if (!defined('ABSPATH')) {
    exit('Direct access denied.');
}

if (version_compare(PHP_VERSION, '7.4', '<')) {
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p><strong>CrawlGuard WP:</strong> This plugin requires PHP 7.4 or higher. You are running PHP ' . PHP_VERSION . '</p></div>';
    });
    return;
}

global $wp_version;
if (version_compare($wp_version, '5.0', '<')) {
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p><strong>CrawlGuard WP:</strong> This plugin requires WordPress 5.0 or higher.</p></div>';
    });
    return;
}

if (!defined('CRAWLGUARD_VERSION')) {
    define('CRAWLGUARD_VERSION', '1.0.0');
}

if (!defined('CRAWLGUARD_PLUGIN_URL')) {
    define('CRAWLGUARD_PLUGIN_URL', plugin_dir_url(__FILE__));
}

if (!defined('CRAWLGUARD_PLUGIN_PATH')) {
    define('CRAWLGUARD_PLUGIN_PATH', plugin_dir_path(__FILE__));
}

if (!defined('CRAWLGUARD_PLUGIN_FILE')) {
    define('CRAWLGUARD_PLUGIN_FILE', __FILE__);
}

if (!class_exists('CrawlGuardWP')) {
    class CrawlGuardWP {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('init', array($this, 'init'));
        register_activation_hook(CRAWLGUARD_PLUGIN_FILE, array($this, 'activate'));
        register_deactivation_hook(CRAWLGUARD_PLUGIN_FILE, array($this, 'deactivate'));
        register_uninstall_hook(CRAWLGUARD_PLUGIN_FILE, array('CrawlGuardWP', 'uninstall'));
    }
    
    public function init() {
        load_plugin_textdomain('crawlguard-wp', false, dirname(plugin_basename(__FILE__)) . '/languages');

        if (!$this->load_dependencies()) {
            return;
        }

        $this->init_hooks();
    }
    
    private function load_dependencies() {
        $required_files = array(
            'includes/class-database.php',
            'includes/class-bot-detector.php',
            'includes/class-api-client.php',
            'includes/class-admin.php',
            'includes/class-frontend.php'
        );

        foreach ($required_files as $file) {
            $file_path = CRAWLGUARD_PLUGIN_PATH . $file;
            if (file_exists($file_path)) {
                require_once $file_path;
            } else {
                add_action('admin_notices', function() use ($file) {
                    echo '<div class="notice notice-error"><p><strong>CrawlGuard WP:</strong> Required file missing: ' . esc_html($file) . '</p></div>';
                });
                return false;
            }
        }
        return true;
    }
    
    private function init_hooks() {
        // Initialize bot detection on every request
        add_action('wp', array($this, 'detect_and_handle_bots'));
        
        // Admin interface
        if (is_admin()) {
            new CrawlGuard_Admin();
        } else {
            new CrawlGuard_Frontend();
        }
    }
    
    public function detect_and_handle_bots() {
        $bot_detector = new CrawlGuard_Bot_Detector();
        $bot_detector->process_request();
    }
    
    public function activate() {
        if (!current_user_can('activate_plugins')) {
            return;
        }

        $this->create_tables();
        $this->set_default_options();

        flush_rewrite_rules();

        add_option('crawlguard_activation_time', time());
        add_option('crawlguard_version', CRAWLGUARD_VERSION);
    }
    
    public function deactivate() {
        // Clean up if needed
        flush_rewrite_rules();
    }
    
    private function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Table for storing bot detection logs
        $table_name = $wpdb->prefix . 'crawlguard_logs';
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            ip_address varchar(45) NOT NULL,
            user_agent text NOT NULL,
            bot_detected tinyint(1) DEFAULT 0 NOT NULL,
            bot_type varchar(50),
            action_taken varchar(20) DEFAULT 'allowed' NOT NULL,
            revenue_generated decimal(10,4) DEFAULT 0.00,
            PRIMARY KEY (id),
            KEY ip_address (ip_address),
            KEY timestamp (timestamp)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function set_default_options() {
        $default_options = array(
            'api_url' => 'https://api.creativeinteriorsstudio.com/v1',
            'api_key' => '',
            'monetization_enabled' => false,
            'detection_sensitivity' => 'medium',
            'allowed_bots' => array('googlebot', 'bingbot'),
            'pricing_per_request' => 0.001
        );

        add_option('crawlguard_options', $default_options);
    }

    public static function uninstall() {
        if (!current_user_can('delete_plugins')) {
            return;
        }

        global $wpdb;

        $table_name = $wpdb->prefix . 'crawlguard_logs';
        $wpdb->query("DROP TABLE IF EXISTS $table_name");

        delete_option('crawlguard_options');
        delete_option('crawlguard_activation_time');
        delete_option('crawlguard_version');

        wp_clear_scheduled_hook('crawlguard_cleanup_logs');
    }

}
}

if (class_exists('CrawlGuardWP')) {
    CrawlGuardWP::get_instance();
}
