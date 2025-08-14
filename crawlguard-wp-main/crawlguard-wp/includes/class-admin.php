<?php
/**
 * Admin Interface for CrawlGuard WP
 */

if (!defined('ABSPATH')) {
    exit;
}

class CrawlGuard_Admin {

    private $database;

    public function __construct() {
        $this->database = new CrawlGuard_Database();
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'init_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('wp_ajax_crawlguard_get_analytics', array($this, 'ajax_get_analytics'));
        add_action('wp_ajax_crawlguard_get_chart_data', array($this, 'ajax_get_chart_data'));
        add_action('wp_ajax_crawlguard_get_realtime_stats', array($this, 'ajax_get_realtime_stats'));
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'PayPerCrawl Dashboard',
            'PayPerCrawl',
            'manage_options',
            'paypercrawl',
            array($this, 'admin_page'),
            'dashicons-chart-line',
            30
        );
        
        add_submenu_page(
            'crawlguard',
            'Dashboard',
            'Dashboard',
            'manage_options',
            'crawlguard',
            array($this, 'admin_page')
        );
        
        add_submenu_page(
            'crawlguard',
            'Settings',
            'Settings',
            'manage_options',
            'crawlguard-settings',
            array($this, 'settings_page')
        );
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>CrawlGuard WP Dashboard</h1>
            <div id="crawlguard-dashboard">
                <div class="crawlguard-loading">Loading dashboard...</div>
            </div>
        </div>
        <?php
    }
    
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1>CrawlGuard Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('crawlguard_settings');
                do_settings_sections('crawlguard_settings');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
    
    public function init_settings() {
        register_setting('crawlguard_settings', 'crawlguard_options');
        
        add_settings_section(
            'crawlguard_main_section',
            'Main Settings',
            array($this, 'main_section_callback'),
            'crawlguard_settings'
        );
        
        add_settings_field(
            'api_key',
            'API Key',
            array($this, 'api_key_callback'),
            'crawlguard_settings',
            'crawlguard_main_section'
        );
        
        add_settings_field(
            'monetization_enabled',
            'Enable Monetization',
            array($this, 'monetization_enabled_callback'),
            'crawlguard_settings',
            'crawlguard_main_section'
        );

        // Feature flags
        add_settings_field(
            'feature_flags',
            'Feature Flags',
            array($this, 'feature_flags_callback'),
            'crawlguard_settings',
            'crawlguard_main_section'
        );
        // Rate limits
        add_settings_field(
            'rate_limits',
            'Rate Limits',
            array($this, 'rate_limits_callback'),
            'crawlguard_settings',
            'crawlguard_main_section'
        );
        // IP Intelligence
        add_settings_field(
            'ip_intel',
            'IP Intelligence',
            array($this, 'ip_intel_callback'),
            'crawlguard_settings',
            'crawlguard_main_section'
        );
    }
    
    public function main_section_callback() {
        echo '<p>Configure your CrawlGuard settings below.</p>';
    }
    
    public function api_key_callback() {
        $options = get_option('crawlguard_options');
        $api_key = $options['api_key'] ?? '';
        echo '<input type="text" name="crawlguard_options[api_key]" value="' . esc_attr($api_key) . '" class="regular-text" />';
    }
    
    public function monetization_enabled_callback() {
        $options = get_option('crawlguard_options');
        $enabled = $options['monetization_enabled'] ?? false;
        echo '<input type="checkbox" name="crawlguard_options[monetization_enabled]" value="1" ' . checked(1, $enabled, false) . ' />';
    }

    // Feature flags UI
    public function feature_flags_callback() {
        $opts = get_option('crawlguard_options');
        $ff = $opts['feature_flags'] ?? array();
        $fields = array(
            'enable_rate_limiting' => 'Enable Rate Limiting (soft header only)',
            'enable_fingerprinting_log' => 'Enable Header Fingerprinting (log-only)',
            'enable_ip_intel' => 'Enable IP Intelligence (log-only)',
            'enable_http_signatures' => 'Enable HTTP Message Signatures (verify-only)',
            'enable_pow' => 'Enable Proof-of-Work (placeholder)',
            'enable_privacy_pass' => 'Enable Privacy Pass (placeholder)'
        );
        echo '<div class="crawlguard-flags">';
        foreach ($fields as $key => $label) {
            $checked = !empty($ff[$key]) ? 'checked' : '';
            echo '<label style="display:block;margin:4px 0;"><input type="checkbox" name="crawlguard_options[feature_flags]['.$key.']" value="1" '.$checked.' /> '.$label.'</label>';
        }
        echo '<p class="description">All new features are off by default.</p>';
        echo '</div>';
    }

    public function rate_limits_callback() {
        $opts = get_option('crawlguard_options');
        $rl = $opts['rate_limits'] ?? array('per_ip_per_min'=>120,'per_ip_per_hour'=>2000,'per_ua_per_min'=>240);
        echo 'Per-IP/min: <input type="number" min="1" name="crawlguard_options[rate_limits][per_ip_per_min]" value="'.esc_attr($rl['per_ip_per_min']).'" style="width:100px;" /> ';
        echo 'Per-IP/hour: <input type="number" min="1" name="crawlguard_options[rate_limits][per_ip_per_hour]" value="'.esc_attr($rl['per_ip_per_hour']).'" style="width:100px;margin-left:12px;" /> ';
        echo 'Per-UA/min: <input type="number" min="1" name="crawlguard_options[rate_limits][per_ua_per_min]" value="'.esc_attr($rl['per_ua_per_min']).'" style="width:100px;margin-left:12px;" /> ';
    }

    public function ip_intel_callback() {
        $opts = get_option('crawlguard_options');
        $cfg = $opts['ip_intel'] ?? array('provider'=>'none','ipinfo_token'=>'');
        echo 'Provider: <select name="crawlguard_options[ip_intel][provider]"><option value="none"'.selected($cfg['provider'],'none',false).'>None</option><option value="ipinfo"'.selected($cfg['provider'],'ipinfo',false).'>IPinfo</option></select> ';
        echo 'IPinfo Token: <input type="text" name="crawlguard_options[ip_intel][ipinfo_token]" value="'.esc_attr($cfg['ipinfo_token']).'" style="width:280px;margin-left:12px;" placeholder="token" />';
    }
    
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'crawlguard') === false && strpos($hook, 'paypercrawl') === false) {
            return;
        }
        
        wp_enqueue_style('crawlguard-admin-style', CRAWLGUARD_PLUGIN_URL . 'assets/css/admin.css', array(), CRAWLGUARD_VERSION);
        wp_enqueue_script(
            'crawlguard-admin',
            CRAWLGUARD_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            CRAWLGUARD_VERSION,
            true
        );
        
        wp_localize_script('crawlguard-admin', 'crawlguard_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('crawlguard_nonce')
        ));
    }

    public function ajax_get_analytics() {
        check_ajax_referer('crawlguard_nonce', 'nonce');
        $api_client = new CrawlGuard_API_Client();
        $analytics = $api_client->get_analytics();
        wp_send_json_success($analytics);
    }

    // Added endpoints used in admin.js
    public function ajax_get_chart_data() {
        check_ajax_referer('crawlguard_nonce', 'nonce');
        global $wpdb; $period = sanitize_text_field($_POST['period'] ?? '30d'); $days = $period==='7d'?7:($period==='90d'?90:30);
        $table = $wpdb->prefix.'crawlguard_logs'; $rows=$wpdb->get_results($wpdb->prepare("SELECT DATE(timestamp) d, SUM(revenue_generated) r FROM $table WHERE timestamp >= DATE_SUB(NOW(), INTERVAL %d DAY) GROUP BY d ORDER BY d ASC", $days));
        $data=[]; foreach($rows as $row){ $data[]=['date'=>$row->d,'revenue'=>(float)$row->r]; }
        wp_send_json_success($data);
    }
    public function ajax_get_realtime_stats() {
        check_ajax_referer('crawlguard_nonce', 'nonce'); global $wpdb; $table=$wpdb->prefix.'crawlguard_logs';
        $hour=(int)$wpdb->get_var("SELECT COUNT(*) FROM $table WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)");
        $day=(int)$wpdb->get_var("SELECT COUNT(*) FROM $table WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)");
        $rev=(float)$wpdb->get_var("SELECT SUM(revenue_generated) FROM $table WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)");
        wp_send_json_success(['stats'=>[$hour,$day,'$'.number_format($rev,2)]]);
    }
}
