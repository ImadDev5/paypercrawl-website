# Test Report

Checklist (Pass/Fail)
- Plugin activation creates tables (logs, rate_limits, signing_keys, fingerprints): [ ]
- Admin dashboard loads and shows cards: [ ]
- AJAX analytics endpoints respond with data (empty allowed): [ ]
- Bot detection logs entries on page view: [ ]
- Feature flag: enable_fingerprinting_log -> headers and fingerprint_hash stored: [ ]
- Rate limiting header set when caps exceeded (non-blocking): [ ]
- IP Intelligence logged when enabled and token configured: [ ]
- HTTP Message Signature: invalid signature present -> verification returns false and failure logged: [ ]
- Beacon: frontend sends request and endpoint returns {ok:true}: [ ]
- Backward compatibility: site functions normally with all flags off: [ ]

Steps
1) Activate plugin, visit a few pages as normal browser; verify wp_crawlguard_logs received rows.
2) Toggle feature flags via wp option edit or phpMyAdmin; re-test requests.
3) Simulate high request rate from same IP/UA (e.g., curl loop) and observe X-CrawlGuard-Rate-Limited header.
4) Configure IPinfo token and verify `ip_reputation` column stores JSON.
5) Send a request with fake Signature headers; observe verification false (no block) and entry recorded.
6) Load admin dashboard; check charts (may be zero if no revenue yet). Ensure AJAX success.

Results summary
- Activation: []
- Logs: []
- Rate limiting: []
- IP intel: []
- Signatures: []
- Beacon: []
- Dashboard AJAX: []
