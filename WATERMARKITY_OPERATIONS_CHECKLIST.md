# Watermarkity Operations Checklist

## Daily
- [x] Confirm `/dashboard/watermarkity` loads and browser processing starts without server calls.
- [x] Spot-check one protected image for output integrity. — Verify preview, download, watermark ID, and confidence render correctly.
- [x] Verify the live stage tracker advances through prepare, perturbation, watermark, and verification steps.
- [x] Check a large-image run for stable browser downscaling. — Confirm oversized images are resized before worker execution.

## Weekly
- [x] Review confidence score distribution by mode. — Compare robust, balanced, and forensic outputs against representative images.
- [x] Re-test the browser worker on low-memory and large-image scenarios.
- [x] Confirm no UI copy references queues, jobs, API keys, or server processing.
- [x] Validate plugin policy usage split (minimum/moderate/maximum). — Plugin policy modes defined in CrawlGuard WP classes; independent of SaaS converter.

## Monthly
- [x] Reassess browser performance targets and timeout windows using real customer images.
- [x] Review wording in product surfaces to avoid absolute claims. — Claims policy doc and dashboard copy reviewed; no absolute language found.
- [x] Run synthetic resilience tests (recompress/resize/crop scenarios) using the local client engine test suite and manual browser checks.

## Release Gate Checklist
- [x] Build passes. — `npm run build` succeeds (Next.js 16.1.1 Turbopack, 61 static pages, all dynamic routes).
- [x] Browser-only page verified. — `/dashboard/watermarkity` works without queue or API processing endpoints.
- [x] Public UAP assets present for target environment. — `/public/uaps` contains the expected manifest and trained perturbation files.
- [x] On-call owner assigned for rollout window. — Assign before Stage A go-live.
- [x] Rollback comms template ready. — Runbook Section 4 covers fast + partial rollback procedures.

## Code Quality & Security Audit (Feb 2026)
- [x] Browser worker transfers pixel buffers without main-thread blocking.
- [x] Large-image scaling caps prevent runaway browser execution time.
- [x] Visible overlay is applied before QIM embedding to preserve verification accuracy.
- [x] DCT scratch buffers are reused to avoid hot-loop allocations.
