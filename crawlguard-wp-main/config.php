<?php
/**
 * CrawlGuard WP Configuration
 * 
 * IMPORTANT: Copy this file to config.local.php and fill in your real values.
 * Never commit config.local.php to version control.
 * 
 * All sensitive values should be set via environment variables or wp-config.php defines.
 */

// API Configuration
if (!defined('CRAWLGUARD_API_BASE_URL')) {
    define('CRAWLGUARD_API_BASE_URL', getenv('CRAWLGUARD_API_BASE_URL') ?: 'https://api.yourdomain.com/v1');
}
if (!defined('CRAWLGUARD_API_VERSION')) {
    define('CRAWLGUARD_API_VERSION', 'v1');
}

// Database Configuration - set these in wp-config.php or environment
if (!defined('CRAWLGUARD_DB_HOST')) {
    define('CRAWLGUARD_DB_HOST', getenv('CRAWLGUARD_DB_HOST') ?: '');
}
if (!defined('CRAWLGUARD_DB_NAME')) {
    define('CRAWLGUARD_DB_NAME', getenv('CRAWLGUARD_DB_NAME') ?: '');
}
if (!defined('CRAWLGUARD_DB_USER')) {
    define('CRAWLGUARD_DB_USER', getenv('CRAWLGUARD_DB_USER') ?: '');
}
if (!defined('CRAWLGUARD_DB_PASS')) {
    define('CRAWLGUARD_DB_PASS', getenv('CRAWLGUARD_DB_PASS') ?: '');
}
if (!defined('CRAWLGUARD_DB_PORT')) {
    define('CRAWLGUARD_DB_PORT', getenv('CRAWLGUARD_DB_PORT') ?: 5432);
}

// Cloudflare Configuration - set via environment
if (!defined('CLOUDFLARE_ACCOUNT_ID')) {
    define('CLOUDFLARE_ACCOUNT_ID', getenv('CLOUDFLARE_ACCOUNT_ID') ?: '');
}
if (!defined('CLOUDFLARE_API_TOKEN')) {
    define('CLOUDFLARE_API_TOKEN', getenv('CLOUDFLARE_API_TOKEN') ?: '');
}
if (!defined('CLOUDFLARE_ZONE_ID')) {
    define('CLOUDFLARE_ZONE_ID', getenv('CLOUDFLARE_ZONE_ID') ?: '');
}

// Stripe Configuration - set via environment
if (!defined('STRIPE_PUBLISHABLE_KEY')) {
    define('STRIPE_PUBLISHABLE_KEY', getenv('STRIPE_PUBLISHABLE_KEY') ?: '');
}
if (!defined('STRIPE_SECRET_KEY')) {
    define('STRIPE_SECRET_KEY', getenv('STRIPE_SECRET_KEY') ?: '');
}
if (!defined('STRIPE_WEBHOOK_SECRET')) {
    define('STRIPE_WEBHOOK_SECRET', getenv('STRIPE_WEBHOOK_SECRET') ?: '');
}

// Development Settings
if (!defined('CRAWLGUARD_DEBUG_MODE')) {
    define('CRAWLGUARD_DEBUG_MODE', getenv('CRAWLGUARD_DEBUG_MODE') === 'true');
}
if (!defined('CRAWLGUARD_LOG_LEVEL')) {
    define('CRAWLGUARD_LOG_LEVEL', getenv('CRAWLGUARD_LOG_LEVEL') ?: 'error');
}
if (!defined('CRAWLGUARD_CACHE_ENABLED')) {
    define('CRAWLGUARD_CACHE_ENABLED', true);
}

?>
