<?php
/**
 * JavaScript Challenge System
 * 
 * Forces bots to execute JavaScript before accessing content.
 * This significantly increases the cost and complexity for scrapers.
 */

if (!defined('ABSPATH')) {
    exit;
}

class CrawlGuard_JS_Challenge {
    
    const COOKIE_NAME = 'crawlguard_verified';
    const COOKIE_DURATION = 3600; // 1 hour
    
    /**
     * Check if request should be challenged
     */
    public static function maybe_challenge_request($bot_info, $user_agent, $ip_address) {
        // JavaScript Challenge is always-on when plugin is activated
        
        // Skip challenge for admin and AJAX
        if (is_admin() || wp_doing_ajax()) {
            return false;
        }
        
        // Check if already verified
        if (self::has_valid_verification()) {
            error_log('CrawlGuard JS Challenge: Already verified, allowing through');
            return false;
        }
        
        // If it's a detected bot, challenge it
        if ($bot_info['is_bot']) {
            error_log('CrawlGuard JS Challenge: Bot detected, requiring challenge');
            error_log('CrawlGuard JS Challenge: Bot type = ' . $bot_info['bot_type']);
            error_log('CrawlGuard JS Challenge: Confidence = ' . $bot_info['confidence'] . '%');
            return true;
        }
        
        return false;
    }
    
    /**
     * Show JavaScript challenge page
     */
    public static function show_challenge($bot_info) {
        error_log('CrawlGuard JS Challenge: Showing challenge page');
        
        // Generate challenge data
        $challenge_nonce = wp_create_nonce('crawlguard_js_challenge');
        $challenge_number = rand(10, 20);
        $expected_answer = pow(2, $challenge_number);
        
        // Store expected answer in transient (expires in 5 minutes)
        $challenge_id = md5($challenge_nonce . time());
        set_transient('crawlguard_challenge_' . $challenge_id, $expected_answer, 300);
        
        error_log('CrawlGuard JS Challenge: Challenge ID = ' . $challenge_id);
        error_log('CrawlGuard JS Challenge: Expected answer = ' . $expected_answer);
        
        // Set proper headers
        status_header(200);
        header('Content-Type: text/html; charset=UTF-8');
        
        // Render challenge page
        echo self::render_challenge_html($challenge_id, $challenge_number, $bot_info);
        exit;
    }
    
    /**
     * Render the challenge HTML page
     */
    private static function render_challenge_html($challenge_id, $challenge_number, $bot_info) {
        $ajax_url = admin_url('admin-ajax.php');
        $site_name = get_bloginfo('name');
        
        ob_start();
        ?>
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verifying Your Browser - <?php echo esc_html($site_name); ?></title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #333;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                }
                .logo {
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                }
                h1 {
                    font-size: 24px;
                    margin-bottom: 10px;
                    color: #1a202c;
                }
                p {
                    color: #718096;
                    margin-bottom: 30px;
                    line-height: 1.6;
                }
                .loader {
                    width: 50px;
                    height: 50px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    margin: 20px auto;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .status {
                    color: #667eea;
                    font-weight: 600;
                    margin-top: 15px;
                }
                .error {
                    background: #fee;
                    color: #c33;
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 20px;
                    display: none;
                }
                .debug {
                    margin-top: 20px;
                    padding: 15px;
                    background: #f7fafc;
                    border-radius: 8px;
                    font-size: 12px;
                    color: #718096;
                    display: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">🛡️</div>
                <h1>Verifying Your Browser</h1>
                <p>This helps us protect the site from automated access. This will only take a moment...</p>
                <div class="loader"></div>
                <div class="status" id="status">Checking your browser...</div>
                <div class="error" id="error"></div>
                <div class="debug" id="debug">
                    <strong>Debug Info:</strong><br>
                    Bot Type: <?php echo esc_html($bot_info['bot_type'] ?? 'unknown'); ?><br>
                    Confidence: <?php echo esc_html($bot_info['confidence'] ?? 0); ?>%<br>
                    Challenge ID: <?php echo esc_html($challenge_id); ?>
                </div>
            </div>
            
            <script>
                (function() {
                    var challengeId = '<?php echo esc_js($challenge_id); ?>';
                    var challengeNumber = <?php echo intval($challenge_number); ?>;
                    var ajaxUrl = '<?php echo esc_js($ajax_url); ?>';
                    var statusEl = document.getElementById('status');
                    var errorEl = document.getElementById('error');
                    var debugEl = document.getElementById('debug');
                    
                    // Enable debug mode if URL has ?debug=1
                    if (window.location.search.indexOf('debug=1') !== -1) {
                        debugEl.style.display = 'block';
                    }
                    
                    function log(message) {
                        console.log('[CrawlGuard] ' + message);
                        if (debugEl.style.display === 'block') {
                            debugEl.innerHTML += '<br>' + message;
                        }
                    }
                    
                    function showError(message) {
                        errorEl.textContent = message;
                        errorEl.style.display = 'block';
                        statusEl.textContent = 'Verification failed';
                    }
                    
                    // Step 1: Verify JavaScript is enabled
                    log('JavaScript is enabled');
                    statusEl.textContent = 'Computing proof of work...';
                    
                    // Step 2: Compute proof of work (simple but forces computation)
                    setTimeout(function() {
                        try {
                            log('Computing 2^' + challengeNumber);
                            var answer = Math.pow(2, challengeNumber);
                            log('Answer computed: ' + answer);
                            
                            // Step 3: Add small delay to slow down bots
                            statusEl.textContent = 'Verifying browser capabilities...';
                            
                            setTimeout(function() {
                                // Step 4: Submit verification
                                log('Submitting verification...');
                                statusEl.textContent = 'Submitting verification...';
                                
                                var formData = new FormData();
                                formData.append('action', 'crawlguard_verify_challenge');
                                formData.append('challenge_id', challengeId);
                                formData.append('answer', answer);
                                formData.append('timestamp', Date.now());
                                
                                fetch(ajaxUrl, {
                                    method: 'POST',
                                    body: formData,
                                    credentials: 'same-origin'
                                })
                                .then(function(response) {
                                    log('Response status: ' + response.status);
                                    return response.json();
                                })
                                .then(function(data) {
                                    log('Response data: ' + JSON.stringify(data));
                                    
                                    if (data.success) {
                                        statusEl.textContent = 'Verification complete! Redirecting...';
                                        log('Verification successful, reloading...');
                                        
                                        // Reload the page to access content
                                        setTimeout(function() {
                                            window.location.reload();
                                        }, 500);
                                    } else {
                                        log('Verification failed: ' + data.data);
                                        showError(data.data || 'Verification failed. Please try again.');
                                    }
                                })
                                .catch(function(error) {
                                    log('Fetch error: ' + error.message);
                                    showError('Network error. Please check your connection and try again.');
                                });
                            }, 1000); // 1 second delay to slow down bots
                            
                        } catch (e) {
                            log('Computation error: ' + e.message);
                            showError('Browser verification failed. Please enable JavaScript.');
                        }
                    }, 500); // Initial 0.5 second delay
                    
                })();
            </script>
        </body>
        </html>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Check if user has valid verification cookie
     */
    private static function has_valid_verification() {
        if (empty($_COOKIE[self::COOKIE_NAME])) {
            return false;
        }
        
        $cookie_value = $_COOKIE[self::COOKIE_NAME];
        $ip_address = self::get_client_ip();
        
        // Verify cookie is valid for this IP
        $expected_value = self::generate_verification_token($ip_address);
        
        return hash_equals($expected_value, $cookie_value);
    }
    
    /**
     * Generate verification token for IP
     */
    private static function generate_verification_token($ip_address) {
        return hash('sha256', $ip_address . SECURE_AUTH_SALT . date('Ymd'));
    }
    
    /**
     * Get client IP address
     */
    private static function get_client_ip() {
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
    
    /**
     * Handle AJAX challenge verification
     */
    public static function ajax_verify_challenge() {
        error_log('CrawlGuard JS Challenge: AJAX verification received');
        
        $challenge_id = sanitize_text_field($_POST['challenge_id'] ?? '');
        $answer = intval($_POST['answer'] ?? 0);
        
        error_log('CrawlGuard JS Challenge: Challenge ID = ' . $challenge_id);
        error_log('CrawlGuard JS Challenge: Submitted answer = ' . $answer);
        
        // Get expected answer from transient
        $expected_answer = get_transient('crawlguard_challenge_' . $challenge_id);
        
        if ($expected_answer === false) {
            error_log('CrawlGuard JS Challenge: Challenge expired or invalid');
            wp_send_json_error('Challenge expired. Please refresh the page.');
            return;
        }
        
        error_log('CrawlGuard JS Challenge: Expected answer = ' . $expected_answer);
        
        // Verify the answer
        if ($answer != $expected_answer) {
            error_log('CrawlGuard JS Challenge: WRONG ANSWER');
            wp_send_json_error('Incorrect answer. Please try again.');
            return;
        }
        
        error_log('CrawlGuard JS Challenge: CORRECT ANSWER - Setting verification cookie');
        
        // Set verification cookie
        $ip_address = self::get_client_ip();
        $token = self::generate_verification_token($ip_address);
        
        setcookie(
            self::COOKIE_NAME,
            $token,
            time() + self::COOKIE_DURATION,
            '/',
            '',
            is_ssl(),
            true // httponly
        );
        
        // Delete the challenge transient
        delete_transient('crawlguard_challenge_' . $challenge_id);
        
        error_log('CrawlGuard JS Challenge: Verification complete!');
        wp_send_json_success('Verification successful');
    }
}
