<div align="center">

# PayPerCrawl

### Monetize Your Content. Protect Your Work. Risk‑Free.

The open platform that turns AI bot traffic into passive revenue — and shields your images from unauthorized AI training.

[![Production Ready](https://img.shields.io/badge/status-production-brightgreen?style=for-the-badge)](https://paypercrawl.tech)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![WordPress](https://img.shields.io/badge/WordPress-Plugin-21759B?style=for-the-badge&logo=wordpress&logoColor=white)](https://wordpress.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[**Live Demo**](https://paypercrawl.tech) · [**Documentation**](docs/) · [**Report Bug**](../../issues) · [**Request Feature**](../../issues)

</div>

---

## Why PayPerCrawl?

75 million+ WordPress sites are crawled daily by AI bots — **for free**. PayPerCrawl changes the equation.

| Problem | PayPerCrawl Solution |
| :--- | :--- |
| AI crawlers scrape your content without compensation | **Bot Monetization Engine** turns every crawl into revenue |
| Images get used to train AI models without consent | **Watermarkity** applies adversarial perturbation + invisible watermarks |
| No visibility into what bots access your site | **Bot Analyzer** audits your site's exposure in seconds |
| Complex integrations for non‑technical users | **One‑click WordPress plugin** with zero config |

---

## Features

### Bot Traffic Monetization

- **Intelligent Bot Detection** — classify 20+ AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google‑Extended, Meta, and more)
- **Revenue Estimation** — real‑time calculator for monthly bot requests and potential earnings
- **API Key Management** — generate, validate, and revoke access tokens from the dashboard
- **Rate Limiting & JS Challenges** — control bot access with configurable policies

### Watermarkity — AI Image Protection

- **8‑Stage Watermarking Pipeline** — adversarial pattern → patch perturbation → frequency layer → chromatic shift → visible attribution → invisible payload → integrity check
- **Trained UAP Engine** — universal adversarial perturbations generated with MI‑DI‑TI‑FGSM across 8 image categories
- **100% Browser‑Side** — all processing runs in the client via Web Workers; your images never leave the browser
- **Protection Profiles** — Robust, Balanced, Forensic, Text‑Heavy, Vivid, Structured, Soft
- **Resilient Verification** — survives JPEG recompression, resize, and crop attacks

### Bot Analyzer

- **robots.txt Audit** — checks permissions for 20+ AI crawlers
- **Sitemap Detection** — estimates total indexed pages with sub‑sitemap recursion
- **Tech Stack Fingerprinting** — identifies CMS, frameworks, and protection layers
- **Risk Scoring** — low / medium / high / critical severity ratings
- **Optional Deep Crawl** — Firecrawl integration for enhanced accuracy

### WordPress Plugin (CrawlGuard WP)

- **Drop‑In Installation** — activate and connect with a single API key
- **Bot Analytics Dashboard** — traffic logs and classification reports inside wp‑admin
- **WooCommerce Integration** — product‑level content protection
- **HTTP Signature Verification** — validates request authenticity
- **Live Sync API** — real‑time content streaming for RAG / LLM tool pipelines

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PayPerCrawl Platform                       │
├─────────────┬──────────────────────────────┬────────────────────┤
│  Next.js 15 │   Custom Server (server.ts)  │  WordPress Plugin  │
│  App Router │   ┌──────────────────────┐   │  (CrawlGuard WP)   │
│  + Turbopack│   │ HTTP + Socket.IO     │   │                    │
│             │   │ Admin Auth Gate      │   │  ┌──────────────┐  │
│  Dashboard  │   │ WebSocket at         │   │  │ Bot Detector │  │
│  Watermarkity   │ /api/socketio        │   │  │ API Client   │  │
│  Bot Analyzer   └──────────────────────┘   │  │ Rate Limiter │  │
│  Admin Panel│                              │  │ JS Challenge │  │
├─────────────┼──────────────────────────────┤  │ Analytics    │  │
│   Prisma    │      PostgreSQL (Neon)       │  │ WooCommerce  │  │
│   ORM       │      + Connection Pooling    │  └──────────────┘  │
├─────────────┼──────────────────────────────┤                    │
│   Resend    │      Transactional Email     │  Communicates via  │
│   API       │      + DKIM + Audit Log      │  REST API ←→ SaaS  │
└─────────────┴──────────────────────────────┴────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Turbopack, Standalone output) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4, shadcn/ui, Radix Primitives |
| **Database** | PostgreSQL via Neon — Prisma ORM |
| **Auth** | Dual system: invite tokens + Firebase (Google OAuth) |
| **Email** | Resend API with DKIM signing |
| **Realtime** | Socket.IO on custom Node server |
| **Payments** | Razorpay integration |
| **Plugin** | WordPress PHP + JS (CrawlGuard WP 2.0) |
| **Testing** | Playwright E2E, custom UAP regression suite |
| **CI / Deploy** | Vercel, Hostinger VPS, Docker‑ready |

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** (or a [Neon](https://neon.tech) database)
- **npm** ≥ 9

### 1. Clone & Install

```bash
git clone https://github.com/ImadDev5/paypercrawl-website.git
cd paypercrawl-website
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Required
DATABASE_URL="postgresql://user:pass@host/db"
RESEND_API_KEY="re_..."
ADMIN_API_KEY="your_secure_admin_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional
RAZORPAY_KEY_ID="rzp_..."
RAZORPAY_KEY_SECRET="..."
JWT_SECRET="..."
```

### 3. Set Up Database

```bash
npm run db:push        # Push schema to database
npm run db:generate    # Generate Prisma client (also runs on npm install)
```

### 4. Start Development

```bash
npm run dev            # Custom server with hot reload + Socket.IO
```

> **Important:** Always use `npm run dev` — not `next dev`. The custom server enables Socket.IO and admin auth gating.

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
paypercrawl-website/
├── server.ts                    # Custom Node server (Next.js + Socket.IO)
├── middleware.ts                 # Route protection & CORS
├── prisma/schema.prisma         # Database models
├── src/
│   ├── app/
│   │   ├── page.tsx             # Marketing landing page
│   │   ├── dashboard/           # Protected user dashboard
│   │   │   └── watermarkity/    # Image protection tool
│   │   ├── admin/               # Admin panel
│   │   └── api/                 # REST API routes
│   │       ├── apikeys/         # Key generation & validation
│   │       ├── bot-analyzer/    # Site audit engine
│   │       ├── plugin/          # Plugin download & sync
│   │       ├── waitlist/        # Beta access management
│   │       └── payment/         # Razorpay integration
│   ├── lib/
│   │   ├── watermarkity/        # Client‑side watermark engine
│   │   ├── db.ts                # Prisma singleton
│   │   ├── email.ts             # Resend email service
│   │   └── socket.ts            # Socket.IO client
│   └── components/              # React UI (shadcn/ui based)
├── public/uaps/                 # Trained UAP perturbation assets
├── scripts/
│   ├── test-client-engine.ts    # Watermarkity regression suite
│   └── generate_uaps/           # Python UAP training pipeline
├── crawlguard-wp-main/          # WordPress plugin source
│   ├── crawlguard-wp.php        # Plugin entry point
│   └── includes/                # PHP classes (bot detector, analytics, etc.)
└── tests/                       # Playwright E2E tests
```

---

## API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/apikeys/generate` | `POST` | Generate a new API key |
| `/api/apikeys/validate` | `POST` | Validate an existing API key |
| `/api/bot-analyzer/analyze` | `POST` | Audit a website for AI bot exposure |
| `/api/plugin/download` | `GET` | Download the CrawlGuard WP plugin (.zip) |
| `/api/plugin/live/ingest` | `POST` | Real‑time content ingest from plugin |
| `/api/waitlist/join` | `POST` | Join the beta waitlist |
| `/api/waitlist/invite` | `POST` | Send a dashboard invitation |
| `/api/contact` | `POST` | Submit a support ticket |
| `/api/health` | `GET` | Platform health check |

Full reference → [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

---

## WordPress Plugin

### Install

1. Download the plugin from the dashboard or build locally:
   ```bash
   cd crawlguard-wp-main
   node create-plugin-zip.js
   ```
2. Upload the `.zip` via **WordPress Admin → Plugins → Add New → Upload**
3. Activate and enter your PayPerCrawl API key

### Plugin Capabilities

| Feature | Description |
| :--- | :--- |
| Bot Detection | User‑Agent classification for 20+ AI crawlers |
| Access Policies | Allow / block / challenge / monetize per bot |
| JS Challenges | Browser verification to filter headless scrapers |
| Rate Limiting | Configurable request throttling |
| Analytics | Per‑bot traffic logging with wp‑admin dashboard |
| WooCommerce | Product‑level protection rules |
| HTTP Signatures | Request authenticity verification |
| Live Sync | Stream content to RAG/LLM tool APIs |

---

## Watermarkity Engine

Client‑side image protection powered by trained Universal Adversarial Perturbations (UAPs).

```
Input Image
    │
    ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Adversarial │──▶│  Frequency   │──▶│  Invisible   │
│  UAP Layer   │   │  Domain Mix  │   │  QIM Payload │
└──────────────┘   └──────────────┘   └──────────────┘
    │                                        │
    ▼                                        ▼
┌──────────────┐                    ┌──────────────┐
│  Visible     │                    │  Integrity   │
│  Attribution │                    │  Checksum    │
└──────────────┘                    └──────────────┘
    │                                        │
    └──────────────┬─────────────────────────┘
                   ▼
            Protected Image
```

**8 trained UAP categories:** general · landscape · face · text · product · art · urban · abstract

**Verification resilience:** JPEG recompression, resize, crop — 100% detection accuracy

Run the regression suite:
```bash
npx tsx scripts/test-client-engine.ts
```

---

## Deployment

### Vercel (Recommended)

1. Import the repo on [vercel.com](https://vercel.com)
2. Set environment variables
3. Deploy — zero config needed

### Hostinger / VPS

```bash
# Linux
./deploy-hostinger.sh

# Windows
deploy-hostinger.bat
```

### Production Build

```bash
npm run build          # Next.js standalone output
npm run start          # Custom server (Socket.IO enabled)
npm run start:next     # Next.js only (no WebSockets)
```

---

## Theme System

Three built‑in themes with seamless switching:

| | Light | Dark | GitHub Dark Dimmed |
| :---: | :---: | :---: | :---: |
| **Trigger** | System / manual | System / manual | `Ctrl+Shift+T` cycle |

- CSS variable‑driven via `next-themes`
- Glass morphism, glow effects, micro‑interactions
- Live preview at `/theme-test`

---

## Testing

```bash
# E2E tests (Playwright)
npx playwright test

# Watermarkity UAP regression
npx tsx scripts/test-client-engine.ts
```

---

## Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Development server (custom server + hot reload) |
| `npm run build` | Production build (standalone output) |
| `npm run start` | Production server (Socket.IO enabled) |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Create migration files |
| `npm run uaps:train` | Train UAP perturbation assets (requires Python) |

---

## Documentation

| Document | Description |
| :--- | :--- |
| [API Reference](docs/API_REFERENCE.md) | Full endpoint documentation |
| [Security Policy](docs/SECURITY.md) | Vulnerability reporting guidelines |
| [Watermarkity Release Runbook](WATERMARKITY_RELEASE_RUNBOOK.md) | Release checklist for Watermarkity |
| [Operations Checklist](WATERMARKITY_OPERATIONS_CHECKLIST.md) | Operational procedures |
| [Product Claims Policy](WATERMARKITY_PRODUCT_CLAIMS_POLICY.md) | Marketing claim guidelines |

---

## Contributing

Contributions are welcome! Please see our workflow:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## Contact

- **Website:** [paypercrawl.tech](https://paypercrawl.tech)
- **Issues:** [GitHub Issues](../../issues)
- **Email:** admin@paypercrawl.tech

---

<div align="center">

**Built with** Next.js · Tailwind CSS · Prisma · WordPress · Socket.IO

If PayPerCrawl helps you monetize your content, consider giving it a ⭐

</div>
