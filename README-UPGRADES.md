# Safe Upgrade Instructions

- Backup database before activation.
- Activate plugin; it will add additive tables/columns via dbDelta. No destructive changes.
- All new features are disabled by default (feature flags). Enable toggles gradually and verify logs.
- If issues arise, disable flags to revert to previous behavior without deactivating the plugin.
