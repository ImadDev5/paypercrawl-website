<?php
/**
 * Bot Detection Engine
 * 
 * This class handles the core bot detection logic and monetization decisions
 */

if (!defined('ABSPATH')) {
    exit;
}

class CrawlGuard_Bot_Detector {
    
    private $known_ai_bots = array(
        // OpenAI bots
        'gptbot' => array('company' => 'OpenAI', 'rate' => 0.002, 'confidence' => 95),
        'chatgpt-user' => array('company' => 'OpenAI', 'rate' => 0.002, 'confidence' => 95),
        
        // Anthropic bots
        'anthropic-ai' => array('company' => 'Anthropic', 'rate' => 0.0015, 'confidence' => 95),
        'claude-web' => array('company' => 'Anthropic', 'rate' => 0.0015, 'confidence' => 95),
        
        // Google bots
        'bard' => array('company' => 'Google', 'rate' => 0.001, 'confidence' => 90),
        'palm' => array('company' => 'Google', 'rate' => 0.001, 'confidence' => 90),
        'google-extended' => array('company' => 'Google', 'rate' => 0.001, 'confidence' => 90),
        
        // Common Crawl
        'ccbot' => array('company' => 'Common Crawl', 'rate' => 0.001, 'confidence' => 90),
        
        // Other major AI companies
        'cohere-ai' => array('company' => 'Cohere', 'rate' => 0.0012, 'confidence' => 85),
        'ai2bot' => array('company' => 'Allen Institute', 'rate' => 0.001, 'confidence' => 80),
        'facebookexternalhit' => array('company' => 'Meta', 'rate' => 0.001, 'confidence' => 85),
        'meta-externalagent' => array('company' => 'Meta', 'rate' => 0.001, 'confidence' => 85),
        'bytespider' => array('company' => 'ByteDance', 'rate' => 0.001, 'confidence' => 85),
        'perplexitybot' => array('company' => 'Perplexity', 'rate' => 0.0015, 'confidence' => 90),
        'youbot' => array('company' => 'You.com', 'rate' => 0.001, 'confidence' => 85),
        'phindbot' => array('company' => 'Phind', 'rate' => 0.001, 'confidence' => 80),
        
        // Search engines with AI features
        'bingbot' => array('company' => 'Microsoft', 'rate' => 0.0012, 'confidence' => 85),
        'slurp' => array('company' => 'Yahoo', 'rate' => 0.001, 'confidence' => 80),
        'duckduckbot' => array('company' => 'DuckDuckGo', 'rate' => 0.001, 'confidence' => 75),
        'applebot' => array('company' => 'Apple', 'rate' => 0.001, 'confidence' => 80),
        'amazonbot' => array('company' => 'Amazon', 'rate' => 0.001, 'confidence' => 80),
        
        // Scraping APIs and Services (HIGH PRIORITY - Often bypass detection)
        'firecrawl' => array('company' => 'Firecrawl', 'rate' => 0.005, 'confidence' => 95),
        'scrapingbee' => array('company' => 'ScrapingBee', 'rate' => 0.004, 'confidence' => 90),
        'scraperapi' => array('company' => 'ScraperAPI', 'rate' => 0.004, 'confidence' => 90),
        'brightdata' => array('company' => 'Bright Data', 'rate' => 0.004, 'confidence' => 85),
        'oxylabs' => array('company' => 'Oxylabs', 'rate' => 0.004, 'confidence' => 85),
        'smartproxy' => array('company' => 'Smartproxy', 'rate' => 0.004, 'confidence' => 85),
        'zyte' => array('company' => 'Zyte', 'rate' => 0.004, 'confidence' => 85),
        'apify' => array('company' => 'Apify', 'rate' => 0.003, 'confidence' => 80),
        'diffbot' => array('company' => 'Diffbot', 'rate' => 0.003, 'confidence' => 85),
        'import.io' => array('company' => 'Import.io', 'rate' => 0.003, 'confidence' => 80)
    );
    
    private $suspicious_patterns = array(
        '/python-requests/',
        '/scrapy/',
        '/selenium/',
        '/headless/',
        '/crawler/',
        '/scraper/',
        '/bot.*ai/i',
        '/ai.*bot/i',
        '/gpt/i',
        '/llm/i',
        '/language.*model/i',
        '/puppeteer/i',
        '/playwright/i',
        '/chrome-headless/i',
        '/phantomjs/i',
        '/wget/i',
        '/curl/i',
        '/http.*client/i'
    );
    
    public function process_request() {
        // Skip admin and AJAX requests
        if (is_admin() || wp_doing_ajax()) {
            return;
        }
        
        // DEBUG: Log that plugin is actively processing
        error_log('=== CrawlGuard Plugin Active ===');
        error_log('CrawlGuard: Processing request at ' . date('Y-m-d H:i:s'));
        
        $user_agent = $this->get_user_agent();
        $ip_address = $this->get_client_ip();
        
        // DEBUG: Log request details
        error_log('CrawlGuard: IP Address = ' . $ip_address);
        error_log('CrawlGuard: User-Agent = ' . $user_agent);
        error_log('CrawlGuard: Request URI = ' . ($_SERVER['REQUEST_URI'] ?? 'unknown'));
        
        // DEBUG: Log configuration
        $options = get_option('crawlguard_options');
        error_log('CrawlGuard: Monetization Enabled = ' . ($options['monetization_enabled'] ? 'YES' : 'NO'));
        error_log('CrawlGuard: Allowed Bots = ' . json_encode($options['allowed_bots'] ?? []));

        // Optional: verify HTTP Message Signatures (log-only)
        if (class_exists('CrawlGuard_HTTP_Signatures')) {
            $verified = CrawlGuard_HTTP_Signatures::verify_current_request();
            if (!$verified && !empty($_SERVER['HTTP_SIGNATURE'])) {
                // Signature present but invalid; continue request but mark in logs below
                error_log('CrawlGuard: HTTP Signature present but invalid');
            }
        }
        
        // Detect if this is a bot
        error_log('CrawlGuard: Starting bot detection...');
        $bot_info = $this->detect_bot($user_agent, $ip_address);
        
        // DEBUG: Log detection results
        error_log('CrawlGuard: Bot Detected = ' . ($bot_info['is_bot'] ? 'YES' : 'NO'));
        if ($bot_info['is_bot']) {
            error_log('CrawlGuard: Bot Type = ' . ($bot_info['bot_type'] ?? 'unknown'));
            error_log('CrawlGuard: Bot Name = ' . ($bot_info['bot_name'] ?? 'unknown'));
            error_log('CrawlGuard: Confidence = ' . ($bot_info['confidence'] ?? 0) . '%');
            error_log('CrawlGuard: Is AI Bot = ' . ($bot_info['is_ai_bot'] ? 'YES' : 'NO'));
        }
        
        if ($bot_info['is_bot']) {
            error_log('CrawlGuard: Calling handle_bot_request...');
            $this->handle_bot_request($bot_info, $user_agent, $ip_address);
        }
        
        // Log the request for analytics
        $this->log_request($user_agent, $ip_address, $bot_info);
        error_log('=== CrawlGuard Processing Complete ===');
    }
    
    private function detect_bot($user_agent, $ip_address) {
        $bot_info = array(
            'is_bot' => false,
            'bot_type' => null,
            'bot_name' => null,
            'confidence' => 0,
            'is_ai_bot' => false
        );
        
        error_log('CrawlGuard: detect_bot() - Checking ' . count($this->known_ai_bots) . ' known bots');
        
        // Check against known AI bots
        foreach ($this->known_ai_bots as $bot_signature => $bot_data) {
            if (stripos($user_agent, $bot_signature) !== false) {
                error_log('CrawlGuard: MATCHED known bot signature: ' . $bot_signature);
                $bot_info['is_bot'] = true;
                $bot_info['is_ai_bot'] = true;
                $bot_info['bot_type'] = $bot_signature;
                $bot_info['bot_name'] = $bot_data['company'];
                $bot_info['confidence'] = $bot_data['confidence'];
                $bot_info['suggested_rate'] = $bot_data['rate'];
                break;
            }
        }
        
        if (!$bot_info['is_bot']) {
            error_log('CrawlGuard: No known bot signature matched in User-Agent');
        }
        
        // Check suspicious patterns if not already detected
        if (!$bot_info['is_bot']) {
            error_log('CrawlGuard: Checking ' . count($this->suspicious_patterns) . ' suspicious patterns');
            foreach ($this->suspicious_patterns as $pattern) {
                if (preg_match($pattern, $user_agent)) {
                    error_log('CrawlGuard: MATCHED suspicious pattern: ' . $pattern);
                    $bot_info['is_bot'] = true;
                    $bot_info['is_ai_bot'] = true;
                    $bot_info['bot_type'] = 'suspicious_pattern';
                    $bot_info['bot_name'] = 'Unknown AI Bot';
                    $bot_info['confidence'] = 70;
                    break;
                }
            }
        }
        
        // Additional heuristics
        if (!$bot_info['is_bot']) {
            error_log('CrawlGuard: Running heuristic analysis...');
            $bot_info = $this->apply_heuristics($user_agent, $ip_address, $bot_info);
        }
        
        error_log('CrawlGuard: Final detection result - is_bot=' . ($bot_info['is_bot'] ? 'true' : 'false'));
        return $bot_info;
    }
    
    private function apply_heuristics($user_agent, $ip_address, $bot_info) {
        $suspicious_score = 0;
        $score_breakdown = array();
        
        error_log('CrawlGuard: apply_heuristics() starting...');
        
        // PRIORITY CHECK: Scraping service API headers (instant detection)
        $scraper_headers = array(
            'HTTP_X_SCRAPERAPI_KEY',
            'HTTP_X_SCRAPINGBEE_KEY',
            'HTTP_X_BRIGHTDATA_ID',
            'HTTP_X_OXYLABS_USER',
            'HTTP_X_FIRECRAWL_API_KEY',
            'HTTP_X_ZYTE_KEY',
            'HTTP_X_APIFY_KEY',
            'HTTP_X_SCRAPING_SERVICE'
        );
        
        foreach ($scraper_headers as $header) {
            if (!empty($_SERVER[$header])) {
                error_log('CrawlGuard: DETECTED scraping service header: ' . $header);
                $bot_info['is_bot'] = true;
                $bot_info['is_ai_bot'] = true;
                $bot_info['bot_type'] = 'scraping_service_header';
                $bot_info['bot_name'] = 'Scraping Service (Header Detected)';
                $bot_info['confidence'] = 98;
                $bot_info['suggested_rate'] = 0.005;
                return $bot_info; // Immediate return - no need for further checks
            }
        }
        
        error_log('CrawlGuard: No scraper headers found, continuing heuristics...');
        
        // Check for missing common browser headers
        if (empty($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
            $suspicious_score += 20;
            $score_breakdown[] = 'Missing Accept-Language (+20)';
            error_log('CrawlGuard: Missing Accept-Language header (+20 points)');
        }
        
        if (empty($_SERVER['HTTP_ACCEPT_ENCODING'])) {
            $suspicious_score += 15;
            $score_breakdown[] = 'Missing Accept-Encoding (+15)';
            error_log('CrawlGuard: Missing Accept-Encoding header (+15 points)');
        }
        
        if (empty($_SERVER['HTTP_ACCEPT'])) {
            $suspicious_score += 15;
            $score_breakdown[] = 'Missing Accept (+15)';
            error_log('CrawlGuard: Missing Accept header (+15 points)');
        }
        
        // Check for missing Referer on deep pages (scrapers often access directly)
        if (!is_front_page() && empty($_SERVER['HTTP_REFERER'])) {
            $suspicious_score += 25;
            $score_breakdown[] = 'No Referer on deep page (+25)';
            error_log('CrawlGuard: No Referer on deep page (+25 points)');
        }
        
        // Check for missing cookies (real browsers almost always have cookies after first visit)
        if (empty($_COOKIE) && !empty($_SERVER['HTTP_USER_AGENT'])) {
            $suspicious_score += 20;
            $score_breakdown[] = 'No cookies (+20)';
            error_log('CrawlGuard: No cookies present (+20 points)');
        }
        
        // Check user agent length and structure
        if (strlen($user_agent) < 20 || strlen($user_agent) > 500) {
            $suspicious_score += 25;
            $score_breakdown[] = 'Unusual UA length (+25)';
            error_log('CrawlGuard: Unusual User-Agent length (+25 points)');
        }
        
        // Check for common bot indicators
        $bot_keywords = array('bot', 'crawler', 'spider', 'scraper', 'fetch', 'http', 'client', 'agent');
        foreach ($bot_keywords as $keyword) {
            if (stripos($user_agent, $keyword) !== false) {
                $suspicious_score += 10;
                $score_breakdown[] = 'Bot keyword: ' . $keyword . ' (+10)';
                error_log('CrawlGuard: Bot keyword found: ' . $keyword . ' (+10 points)');
            }
        }
        
        // Check for datacenter IP ranges (common for scraping services)
        if ($this->is_datacenter_ip($ip_address)) {
            $suspicious_score += 30;
            $score_breakdown[] = 'Datacenter IP (+30)';
            error_log('CrawlGuard: Datacenter IP detected (+30 points)');
        }
        
        // If suspicious score is high enough, flag as potential AI bot
        error_log('CrawlGuard: Total suspicious score = ' . $suspicious_score . ' (threshold: 40)');
        error_log('CrawlGuard: Score breakdown: ' . implode(', ', $score_breakdown));
        
        if ($suspicious_score >= 40) {
            error_log('CrawlGuard: DETECTED by heuristics! Score ' . $suspicious_score . ' >= 40');
            $bot_info['is_bot'] = true;
            $bot_info['is_ai_bot'] = true;
            $bot_info['bot_type'] = 'heuristic_detection';
            $bot_info['bot_name'] = 'Potential AI Bot';
            $bot_info['confidence'] = min($suspicious_score, 85);
        } else {
            error_log('CrawlGuard: Score below threshold, not flagged as bot');
        }
        
        return $bot_info;
    }
    
    /**
     * Check if IP belongs to known datacenter/cloud provider ranges
     * Firecrawl and scraping services often use these
     */
    private function is_datacenter_ip($ip) {
        // Common datacenter/cloud CIDR ranges
        $datacenter_ranges = array(
            // AWS
            '54.0.0.0/8', '52.0.0.0/8', '13.0.0.0/8', '18.0.0.0/8',
            // Google Cloud
            '34.0.0.0/8', '35.0.0.0/8',
            // Azure
            '20.0.0.0/8', '40.0.0.0/8', '104.0.0.0/8',
            // DigitalOcean
            '165.227.0.0/16', '159.65.0.0/16', '167.99.0.0/16',
            // Linode
            '173.255.0.0/16', '45.79.0.0/16',
            // Vultr
            '45.76.0.0/16', '108.61.0.0/16'
        );
        
        foreach ($datacenter_ranges as $range) {
            if ($this->ip_in_range($ip, $range)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if IP is within CIDR range
     */
    private function ip_in_range($ip, $range) {
        if (strpos($range, '/') === false) {
            return false;
        }
        
        list($subnet, $mask) = explode('/', $range);
        $ip_long = ip2long($ip);
        $subnet_long = ip2long($subnet);
        
        if ($ip_long === false || $subnet_long === false) {
            return false;
        }
        
        $mask_long = -1 << (32 - (int)$mask);
        return ($ip_long & $mask_long) === ($subnet_long & $mask_long);
    }
    
    private function handle_bot_request($bot_info, $user_agent, $ip_address) {
        $options = get_option('crawlguard_options');
        
        error_log('CrawlGuard: handle_bot_request() called');
        error_log('CrawlGuard: Monetization enabled = ' . ($options['monetization_enabled'] ? 'YES' : 'NO'));
        
        // STEP 1: JavaScript Challenge (happens BEFORE monetization check)
        // This slows down bots significantly and blocks headless browsers
        if (class_exists('CrawlGuard_JS_Challenge')) {
            error_log('CrawlGuard: Checking if JS Challenge should be shown...');
            if (CrawlGuard_JS_Challenge::maybe_challenge_request($bot_info, $user_agent, $ip_address)) {
                error_log('CrawlGuard: SHOWING JAVASCRIPT CHALLENGE PAGE');
                CrawlGuard_JS_Challenge::show_challenge($bot_info);
                // show_challenge() exits execution - code below won't run
            }
        }
        
        // If monetization is not enabled, just log and continue
        if (!$options['monetization_enabled']) {
            error_log('CrawlGuard: MONETIZATION DISABLED - Not blocking, just logging');
            return;
        }
        
        error_log('CrawlGuard: Checking allowed bots list...');
        error_log('CrawlGuard: Bot type = ' . $bot_info['bot_type']);
        error_log('CrawlGuard: Allowed bots = ' . json_encode($options['allowed_bots']));
        
        // Check if this bot is in the allowed list
        if (in_array(strtolower($bot_info['bot_type']), $options['allowed_bots'])) {
            error_log('CrawlGuard: Bot is in ALLOWED list - not blocking');
            return;
        }
        
        error_log('CrawlGuard: Bot NOT in allowed list - proceeding to monetization...');
        
        // For AI bots, implement monetization logic
        if ($bot_info['is_ai_bot']) {
            $this->monetize_request($bot_info, $user_agent, $ip_address);
        }
    }
    
    private function monetize_request($bot_info, $user_agent, $ip_address) {
        // Send beacon to our backend API
        $api_client = new CrawlGuard_API_Client();
        
        $request_data = array(
            'site_url' => get_site_url(),
            'page_url' => $this->get_current_url(),
            'user_agent' => $user_agent,
            'ip_address' => $ip_address,
            'bot_info' => $bot_info,
            'timestamp' => current_time('mysql'),
            'content_type' => $this->get_content_type(),
            'content_length' => $this->estimate_content_value()
        );
        
        // Send to backend for processing
        $response = $api_client->send_monetization_request($request_data);
        
        // Handle the response
        if ($response && isset($response['action'])) {
            switch ($response['action']) {
                case 'block':
                    $this->block_request($response['message'] ?? 'Access denied');
                    break;
                case 'paywall':
                    $this->show_paywall($response);
                    break;
                case 'allow':
                    // Continue normally but log the revenue
                    $this->log_revenue($response['revenue'] ?? 0);
                    break;
            }
        }
    }
    
    private function block_request($message = 'Access denied') {
        error_log('CrawlGuard: BLOCKING REQUEST with HTTP 402');
        error_log('CrawlGuard: Block message: ' . $message);
        status_header(402); // Payment Required
        wp_die($message, 'Payment Required', array('response' => 402));
    }
    
    private function show_paywall($response) {
        // Implement paywall logic
        $payment_url = $response['payment_url'] ?? '';
        $amount = $response['amount'] ?? 0;
        
        $paywall_html = $this->generate_paywall_html($payment_url, $amount);
        
        status_header(402);
        echo $paywall_html;
        exit;
    }
    
    private function generate_paywall_html($payment_url, $amount) {
        ob_start();
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <title>Content Access - CrawlGuard</title>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .paywall { max-width: 500px; margin: 0 auto; }
                .amount { font-size: 24px; color: #2271b1; font-weight: bold; }
                .pay-button { background: #2271b1; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="paywall">
                <h1>Content Access Required</h1>
                <p>This content requires payment for AI/bot access.</p>
                <div class="amount">$<?php echo number_format($amount, 4); ?></div>
                <p>Click below to pay and access this content:</p>
                <a href="<?php echo esc_url($payment_url); ?>" class="pay-button">Pay & Access Content</a>
            </div>
        </body>
        </html>
        <?php
        return ob_get_clean();
    }
    
    private function log_request($user_agent, $ip_address, $bot_info) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crawlguard_logs';

        // Optional: IP Intelligence (log-only)
        $ip_reputation = null;
        if (class_exists('CrawlGuard_IP_Intel')) {
            $ip_reputation = CrawlGuard_IP_Intel::lookup($ip_address);
        }
        
        // Optional: fingerprint headers (log-only)
        $opts = get_option('crawlguard_options');
        $headers = '';
        $fp_hash = '';
        if (!empty($opts['feature_flags']['enable_fingerprinting_log'])) {
            $interesting = array('HTTP_ACCEPT','HTTP_ACCEPT_LANGUAGE','HTTP_ACCEPT_ENCODING','HTTP_DNT','HTTP_SEC_CH_UA','HTTP_SEC_CH_UA_PLATFORM');
            $data = array();
            foreach ($interesting as $h) { if (!empty($_SERVER[$h])) { $data[$h] = $_SERVER[$h]; } }
            $headers = !empty($data) ? wp_json_encode($data) : '';
            $fp_hash = $headers ? hash('sha256', strtolower($headers)) : '';
        }
        
        $wpdb->insert(
            $table_name,
            array(
                'ip_address' => $ip_address,
                'user_agent' => $user_agent,
                'bot_detected' => $bot_info['is_bot'] ? 1 : 0,
                'bot_type' => $bot_info['bot_type'],
                'action_taken' => 'logged',
                'http_headers' => $headers,
                'fingerprint_hash' => $fp_hash,
                'rate_limited' => (isset($_SERVER['X_CRAWLGUARD_RATE_LIMITED']) && $_SERVER['X_CRAWLGUARD_RATE_LIMITED']) ? 1 : 0,
                'ip_reputation' => $ip_reputation,
            ),
            array('%s','%s','%d','%s','%s','%s','%d','%s')
        );
    }
    
    private function log_revenue($amount) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crawlguard_logs';
        
        // Update the last log entry with revenue
        $wpdb->query($wpdb->prepare(
            "UPDATE $table_name SET revenue_generated = %f WHERE id = (SELECT MAX(id) FROM $table_name)",
            $amount
        ));
    }
    
    private function get_user_agent() {
        return $_SERVER['HTTP_USER_AGENT'] ?? '';
    }
    
    private function get_client_ip() {
        $ip_keys = array('HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR');
        
        foreach ($ip_keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '';
    }
    
    private function get_current_url() {
        return (is_ssl() ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    }
    
    private function get_content_type() {
        if (is_single()) return 'post';
        if (is_page()) return 'page';
        if (is_category()) return 'category';
        if (is_tag()) return 'tag';
        if (is_home()) return 'home';
        return 'other';
    }
    
    private function estimate_content_value() {
        // Simple content value estimation based on word count
        $content = get_the_content();
        $word_count = str_word_count(strip_tags($content));
        
        // Base value: $0.001 per 100 words
        return max(0.001, ($word_count / 100) * 0.001);
    }
}
