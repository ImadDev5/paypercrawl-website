# Changelog

## Version 2.0.1 (October 1, 2025)

### 🎯 Key Improvements

#### API Configuration & Flexibility
- **Added configurable API Base URL**: New setting field allows users to specify custom API endpoints
- **Smart URL normalization**: Automatically ensures `/v1` appears exactly once in API URLs
- **Cloudflare compatibility**: Full support for custom domains and Cloudflare Workers deployments
- **Default API endpoint**: `https://paypercrawl.tech/api` (versioning handled automatically)

#### Enhanced User Experience
- **Improved dashboard header**: Added icon and better visual styling
- **Connection status notice**: Clear warning when API key is missing with helpful guidance
- **Local analytics fallback**: Dashboard shows local stats when API is unavailable or unconfigured
- **Modern UI styling**: Complete CSS overhaul with gradient headers and professional card designs

#### Bug Fixes & Stability
- **Fixed database activation**: Moved `dbDelta` require statement before table creation
- **Complete table setup**: Now properly creates all tables (logs, rate_limits, signing_keys, fingerprints)
- **Version consistency**: Aligned version numbers across all plugin files (2.0.1)
- **Menu structure fix**: Corrected submenu parent references for proper WordPress admin navigation

#### Developer Improvements
- **Enhanced error handling**: Better fallback mechanisms for API failures
- **Code organization**: Added billing dashboard placeholder for future features
- **Documentation**: Improved inline comments and parameter descriptions

### 📝 Changed Files
- `crawlguard-wp.php` - Version update, database setup fix, new default options
- `includes/class-admin.php` - UI enhancements, new settings field, robust analytics fallback
- `includes/class-api-client.php` - Dynamic URL configuration, endpoint normalization
- `includes/class-billing-dashboard.php` - New placeholder file for future billing features
- `assets/css/admin.css` - Complete UI redesign with modern styling
- `readme.txt` - Version update to 2.0.1

### 🔄 Migration Notes
- Existing installations will automatically receive the new `api_base_url` option with default value
- No breaking changes - all existing functionality preserved
- Database tables will be created/updated on plugin reactivation if needed

### 🚀 Upgrade Benefits
- More flexible deployment options (works with any API endpoint)
- Better user experience with clearer messaging
- Improved reliability with local fallbacks
- Professional, modern admin interface
- Production-ready with enhanced error handling

---

## Version 2.0.0 (Initial Release)

### Features
- AI bot detection and monetization
- Real-time analytics dashboard
- Rate limiting capabilities
- HTTP signature verification
- IP intelligence integration
- Proof-of-work challenges
- Privacy Pass support
- Comprehensive WordPress integration
