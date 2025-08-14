# Manual Steps (Owner)

- Configure feature flags: in WordPress options `crawlguard_options.feature_flags` or via future settings UI.
  - enable_rate_limiting: false -> true to activate limiter.
  - enable_ip_intel: configure `ip_intel.provider` and token (IPinfo) before enabling.
  - enable_http_signatures: enable after registering client keys.
- IP Intelligence: Obtain IPinfo token and set under `crawlguard_options.ip_intel.ipinfo_token`.
- HTTP Message Signatures: Register client public keys in DB table `wp_crawlguard_signing_keys` (temporary manual insert) or via future UI.
  - client_id: unique identifier; public_key: PEM format; algo: rsa-v1_5-sha256.
- Payments (sandbox only):
  - Create Stripe account (UAE recommended for global payouts). Enable test mode.
  - Set API creds in environment or separate config (do not commit secrets). Add UI later.
- Privacy Pass / Private Access Tokens: plan provider integration; no code activation yet.
- Cloudflare limits: keep traffic per account under 100k/day (see PDF). Scale by adding accounts if needed.
