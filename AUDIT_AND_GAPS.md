# Audit and Gaps (PayPerCrawl / CrawlGuard WP)

Severity levels: High / Medium / Low

High
- Missing server-safe rate limiting: Added non-blocking, feature-flagged limiter (disabled by default). Needs UI toggle and optional block mode. Logs X-CrawlGuard-Rate-Limited header only.
- No HTTP Message Signatures verification: Added verifier class (log-only). Needs admin UI to register client keys and UX for failures.
- Beacon endpoint referenced but missing: Added beacon.php to safely handle frontend beacons.

Medium
- Limited observability: Extended logs with optional header fingerprint and IP intelligence fields (log-only). Needs dashboard views/filters.
- Admin dashboard AJAX endpoints missing: Implemented endpoints for chart data and realtime stats.
- Payment/payout onboarding UI: Not present in plugin. Documented manual steps (Stripe sandbox/Connect) and left out of code to avoid accidental live charges.

Low
- UA-based AI bot list is static: Consider updatable list from backend or a filter hook. Currently documented and can be extended.
- Proof-of-Work, Privacy Pass: Hooks are feature-flag placeholders only. Documented next steps.

Priorities
1) Ship observability: ensure logs populate and dashboard reads data (done: additive columns, AJAX). Add admin filters by IP/UA/route (next).
2) Harden controls: add safe block/allow actions, whitelist/unblock UI (next; non-destructive).
3) Payments UX: add Stripe Connect onboarding screens and sandbox test flow guarded by feature flag (next).
4) Updatable bot lists + IP intel providers config UI (next).

Compatibility and safety
- All new functionality is behind feature flags; defaults are off.
- DB changes are additive and reversible; no destructive migrations.
- No live payment activation; sandbox only documented.
