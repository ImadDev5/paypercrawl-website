# PayPerCrawl AI Monetization Platform - Development Guide

## Architecture Overview

**PayPerCrawl** is a dual-component SaaS platform for monetizing AI bot traffic. The architecture consists of:

1. **Next.js 15 SaaS Platform** (`/src`) - Main web application with dashboard, API, and marketing pages
2. **WordPress Plugin** (`/crawlguard-wp-main`) - PHP plugin that integrates with the SaaS platform
3. **Custom Next.js Server** (`server.ts`) - Hybrid server combining Next.js + Socket.IO for real-time features

### Key Architectural Decisions

- **Standalone Output Mode**: Configured for Hostinger/VPS deployment (`next.config.ts` uses `output: 'standalone'`)
- **Custom Server Pattern**: HTTP server wraps Next.js to enable Socket.IO at `/api/socketio` path
- **Invite-Only Access**: Dashboard protected by token-based middleware + Firebase Auth as fallback
- **Dual Database Strategy**: Prisma for Next.js (PostgreSQL), WordPress plugin uses WP database tables

## Development Workflows

### Starting the Dev Server

```bash
npm run dev  # Uses nodemon + tsx to run server.ts with hot reload
# Server runs on http://0.0.0.0:3000 with Socket.IO enabled
```

**Note**: Always use `npm run dev`, NOT `next dev` - the custom server pattern requires `server.ts` entry point.

### Database Management

```bash
npm run db:push      # Push Prisma schema changes to database
npm run db:generate  # Regenerate Prisma client (runs post-install automatically)
npm run db:migrate   # Create migration files
npm run db:reset     # Reset database (WARNING: deletes all data)
```

**Important**: Prisma client lives in `src/lib/db.ts` with singleton pattern for hot reload safety.

### Building & Deployment

```bash
npm run build                 # Production build for all platforms
npm run start                 # Production start (uses tsx server.ts)
npm run start:next            # Next.js only (no Socket.IO) - for basic hosting
npm run start:hostinger       # Build + start for Hostinger VPS
```

**Deployment Scripts**:
- `deploy-hostinger.sh` - Bash script for Linux VPS deployment
- `deploy-hostinger.bat` - Windows equivalent

## Project-Specific Conventions

### API Route Pattern

All API routes in `src/app/api/*/route.ts` follow this structure:

```typescript
export async function POST(request: NextRequest) {
  // 1. Parse and validate input
  const body = await request.json();
  
  // 2. Business logic with try/catch
  try {
    const result = await db.model.create({ data: body });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: "Message" }, { status: 500 });
  }
}
```

**Critical**: Always return proper HTTP status codes. Use `status: 400` for validation errors, `500` for server errors.

### Authentication Flow

Dashboard uses **dual authentication**:

1. **Invite Token System** - Primary mechanism via `middleware.ts`
   - Cookie: `invite_token` (30-day expiry)
   - URL param: `?token=xxx` (stored to cookie on first visit)
   - Database: `WaitlistEntry.inviteToken` (UUID)

2. **Firebase Auth** - Secondary/fallback mechanism
   - Cookies: `__session`, `firebase:host`, `g_state`
   - Client-side: `src/lib/firebase.ts` with Google OAuth

**Protected Route Logic** (in `middleware.ts`):
- `/dashboard` route checks for token OR Firebase session
- Missing both → redirect to `/waitlist`
- Token in URL → store in cookie, then continue

### Email Service Integration

All emails use **Resend API** via `src/lib/email.ts`:

```typescript
import { sendWaitlistWelcome, sendInvitation } from '@/lib/email';

// Every email is logged to EmailLog table for audit trail
await sendInvitation({ to, name, inviteToken });
```

**Templates Available**:
- `sendWaitlistWelcome()` - Welcome email after waitlist signup
- `sendInvitation()` - Dashboard access invitation
- `sendContactFormEmail()` - Contact form submissions

**Lazy Initialization Pattern**: Resend client is constructed on first use to avoid build-time errors if `RESEND_API_KEY` is missing.

### Theme System

Three-theme support (Light, Dark, GitHub Dark Dimmed) via `next-themes`:

- **CSS Variables**: Defined in `src/app/globals.css` with `.dim` class
- **Components**: Use semantic tokens like `bg-background`, `text-foreground`
- **No Hardcoded Colors**: Always use Tailwind utilities with theme variables
- **Keyboard Shortcut**: `Ctrl+Shift+T` cycles themes (see `src/components/theme-keyboard-shortcuts.tsx`)

**Testing Themes**: Visit `/theme-test` page for comprehensive component showcase.

### WordPress Plugin Integration

Plugin communicates via REST API (`/api/plugin/*` and `/api/apikeys/*`):

1. **Plugin Download**: `GET /api/plugin/download` - Serves zipped plugin from `/crawlguard-wp-main/`
2. **API Key Generation**: `POST /api/apikeys/generate` - Creates key in database
3. **API Key Validation**: `POST /api/apikeys/validate` - Used by WordPress plugin to verify access

**Plugin Architecture** (`crawlguard-wp-main/crawlguard-wp.php`):
- Singleton pattern: `CrawlGuardWP::get_instance()`
- Bot detection: `includes/class-bot-detector.php`
- Analytics: `includes/class-analytics.php`
- Feature flags for rate limiting and advanced features

## Critical File Locations

### Database & State
- `prisma/schema.prisma` - Database schema (models: WaitlistEntry, EmailLog, BetaApplication)
- `src/lib/db.ts` - Prisma singleton client

### Configuration
- `.env.example` - Template for required environment variables
- `middleware.ts` - Route protection and CORS headers
- `next.config.ts` - Standalone mode, image optimization, Hostinger compatibility

### Core Services
- `src/lib/email.ts` - Email service (Resend API)
- `src/lib/firebase.ts` - Firebase Auth configuration
- `src/lib/socket.ts` - Socket.IO setup for real-time features
- `server.ts` - Custom server entry point (Next.js + Socket.IO)

### Key Features
- `src/app/api/bot-analyzer/analyze/route.ts` - Bot traffic analysis engine (robots.txt, sitemap, tech detection)
- `src/app/api/waitlist/` - Waitlist management endpoints
- `src/app/dashboard/` - Protected dashboard pages
- `src/app/admin/` - Admin interface for managing invitations

## Testing Strategy

- **Playwright Tests**: Located in `/tests` directory
- **WordPress Plugin Tests**: PHPUnit tests in `crawlguard-wp-main/tests/`
- **Manual Testing Guides**: See `PRODUCTION_TESTING_GUIDE.md` and `DASHBOARD_PROTECTION_TEST.md`

**No automated test runner configured** - Tests are run manually using Playwright CLI.

## Common Gotchas

1. **Socket.IO Routing**: Socket.IO path is `/api/socketio`, not `/socket.io` - configured in `server.ts`
2. **TypeScript/ESLint in Production**: Both set to `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` for faster iterations
3. **React Strict Mode**: Disabled (`reactStrictMode: false`) to prevent double-mounting issues with third-party libraries
4. **Image Optimization**: Set to `unoptimized: false` for Hostinger compatibility
5. **Prisma Generate**: Runs automatically on `npm install` via `postinstall` script
6. **Environment Variables**: Client-side vars must be prefixed with `NEXT_PUBLIC_`

## WordPress Plugin Development

**Location**: `/crawlguard-wp-main/`

### Building the Plugin

```bash
cd crawlguard-wp-main
node create-plugin-zip.js  # Creates production-ready ZIP file
```

### Testing Locally

1. Copy plugin folder to WordPress `wp-content/plugins/`
2. Activate via WordPress admin
3. Configure API key from PayPerCrawl dashboard
4. Test bot detection on any page

**Key Classes**:
- `CrawlGuard_Bot_Detector` - Main bot detection logic
- `CrawlGuard_API_Client` - Communicates with SaaS platform
- `CrawlGuard_Admin` - WordPress admin interface
- `CrawlGuard_Analytics` - Bot traffic logging

## External Dependencies

- **Database**: Neon PostgreSQL (DATABASE_URL)
- **Email**: Resend API (RESEND_API_KEY)
- **Auth**: Firebase (Google OAuth)
- **Optional**: Firecrawl API for enhanced website analysis (FIRECRAWL_API_KEY)

## When Editing Components

- **UI Components**: Located in `src/components/ui/` (shadcn/ui based)
- **Theme Components**: Use `src/components/theme-aware/` wrappers for theme-responsive styling
- **Forms**: Use `react-hook-form` + `zod` for validation (see `src/components/waitlist-form.tsx`)
- **Async State**: Prefer `@tanstack/react-query` for server state management

## Documentation References

- **Full Setup**: `README.md`
- **Deployment**: `HOSTINGER_DEPLOYMENT_GUIDE.md`, `DEPLOYMENT_READY_SUMMARY.md`
- **Features**: `BOT_ANALYZER_QUICK_START.md`, `INVITE_ONLY_DASHBOARD_GUIDE.md`
- **Theme System**: `THEME_SYSTEM.md`, `DIM_THEME_ENHANCEMENTS.md`
