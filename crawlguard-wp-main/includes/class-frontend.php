<?php
/**
 * Frontend functionality for CrawlGuard WP
 */

if (!defined('ABSPATH')) {
    exit;
}

class CrawlGuard_Frontend {
    
    public function __construct() {
        add_action('wp_head', array($this, 'add_meta_tags'));
        add_action('wp_footer', array($this, 'add_tracking_beacon'));
        add_filter('the_content', array($this, 'inject_content_watermark'), 99);
    }
    
    public function add_meta_tags() {
        $options = get_option('crawlguard_options');
        if (!is_array($options)) {
            $options = array();
        }
        $watermark_id = $this->build_watermark_id();
        
        if (!empty($options['monetization_enabled'])) {
            echo '<meta name="crawlguard-protected" content="true">' . "\n";
            echo '<meta name="ai-content-license" content="paid">' . "\n";
            echo '<meta name="watermarkity-id" content="' . esc_attr($watermark_id) . '">' . "\n";
        }
    }
    
    public function add_tracking_beacon() {
        // Only add beacon if not admin and monetization is enabled
        if (is_admin() || wp_doing_ajax()) {
            return;
        }
        
        $options = get_option('crawlguard_options');
        if (!is_array($options) || empty($options['monetization_enabled'])) {
            return;
        }
        
        ?>
        <script>
        (function() {
            // Lightweight beacon for analytics
            var beacon = {
                url: '<?php echo esc_js(get_site_url()); ?>',
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                watermarkityId: '<?php echo esc_js($this->build_watermark_id()); ?>'
            };
            
            // Send beacon asynchronously
            if (navigator.sendBeacon) {
                navigator.sendBeacon('<?php echo esc_js(CRAWLGUARD_PLUGIN_URL); ?>beacon.php', JSON.stringify(beacon));
            }
        })();
        </script>
        <?php
    }

    public function inject_content_watermark($content) {
        if (is_admin() || wp_doing_ajax()) {
            return $content;
        }

        $options = get_option('crawlguard_options');
        if (!is_array($options) || empty($options['monetization_enabled'])) {
            return $content;
        }

        $enabled = !empty($options['watermarkity']['inject_content_markers']);
        if (!$enabled) {
            return $content;
        }

        $watermark_id = $this->build_watermark_id();
        $marker = '<span aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;pointer-events:none;">wm:' . esc_html($watermark_id) . '</span>';

        return $content . $marker;
    }

    private function build_watermark_id() {
        $request_path = sanitize_text_field($_SERVER['REQUEST_URI'] ?? '/');
        $ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
        $ua = sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? 'unknown');
        $time_bucket = gmdate('YmdH');

        return substr(wp_hash($request_path . '|' . $ip . '|' . $ua . '|' . $time_bucket), 0, 24);
    }
}
