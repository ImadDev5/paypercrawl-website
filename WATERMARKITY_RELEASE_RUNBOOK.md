# Watermarkity Release Runbook

## Purpose
This runbook defines the production rollout and rollback procedure for Watermarkity's browser-side converter experience.

## Scope
- Dashboard page `/dashboard/watermarkity`
- Browser worker pipeline in `src/lib/watermarkity/client-engine.ts` and `src/lib/watermarkity/watermark.worker.ts`
- Public perturbation assets in `public/uaps`
- Plugin-side Watermarkityfier policy modes in `crawlguard-wp-main`

## Hard Requirements
- Never claim "absolute blocking" or "cannot be recreated".
- Product messaging must describe **deterrence + attribution + verification**.
- The dashboard experience must remain browser-only with no queue, job, or API-processing fallback.

---

## 1) Pre-Flight Checklist (T-24h)
- [x] Confirm `npm run build` succeeds on release SHA.
- [x] Confirm `ADMIN_API_KEY` is set and rotated if needed.
- [x] Confirm public UAP assets exist and load in the target build (`public/uaps/*`).
- [x] Run the client engine regression suite (`npx tsx scripts/test-client-engine.ts`).
- [x] Verify confidence, preview, download, and live stage output in `/dashboard/watermarkity`.
- [x] Test at least one oversized image to confirm browser downscaling and timeout behavior are acceptable.

## 2) Rollout Strategy
Use staged exposure. Do not enable all modes/site traffic at once.

### Stage A (internal only)
- Enable the browser-only page for internal QA.
- Test robust, balanced, and forensic modes on desktop and mobile browsers.
- Validate worker progress, result export, and large-image scaling behavior.

### Stage B (early customers)
- Enable for selected customers.
- Monitor support feedback for browser performance, confidence quality, and preview/download reliability.
- Keep UI copy aligned with browser-only behavior.

### Stage C (general availability)
- Keep balanced as the default mode.
- Keep plugin policy defaults moderate.
- Continue spot-checking browser behavior on large real-world images.

---

## 3) Runtime SLOs / Guardrails
- Browser processing completion success: >= 98%
- p95 local processing latency on supported desktop devices: < 20s for standard images
- No references to deleted queue or API flows in product UI
- Confidence output remains consistent across robust, balanced, and forensic test cases

If any threshold breaches for > 15 minutes, trigger rollback decision.

---

## 4) Rollback Procedure (Fast)
1. Roll back the Watermarkity page and client-engine changes to the previous known-good revision.
2. Redeploy the app.
3. Verify `/dashboard/watermarkity` no longer serves the regressed build.
4. Publish incident status update internally.

### Partial Rollback
- If the issue is isolated to an aggressive mode, temporarily default the UI to `balanced` and re-test.
- If the issue is isolated to UAP assets, ship the previous known-good `/public/uaps` set with the same browser UI.

---

## 5) Incident Triage

### Symptoms
- Browser worker timeouts or crashes
- Large-image failures or excessive downscaling complaints
- Low confidence scores across all modes
- UI showing stale queue or API-processing language

### Triage Steps
1. Re-run `npx tsx scripts/test-client-engine.ts`.
2. Test `/dashboard/watermarkity` manually with the failing image.
3. Check whether the regression is mode-specific, asset-specific, or browser-specific.
4. If confidence degradation is widespread, investigate client-engine ordering or perturbation changes.
5. If performance degradation is widespread, inspect image scaling caps and worker hot paths.

---

## 6) Operational Commands (Examples)

### Client engine regression suite
`npx tsx scripts/test-client-engine.ts`

### Train public UAP assets
`. .venv-uaps/bin/activate && npm run uaps:train -- --epochs 2 --max-images-per-category 12 --batch-size 2 --models clip_vit_b16`

### Development server
`npm run dev`

---

## 7) Post-Release Audit (T+24h)
- [x] Compare planned vs actual browser performance and confidence behavior.
- [x] Review top failure reasons from QA and support feedback.
- [x] Confirm no claims-policy violations in UI copy or support macros. (Dashboard wording reviewed — no absolute claims.)
- [x] Capture learnings and update this runbook.

---

## Code Review Audit Log (Feb 2026)

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | Visible overlay could corrupt the invisible verification payload when applied after QIM embed | CRITICAL | **Fixed** |
| 2 | DCT hot loop allocated scratch buffers repeatedly and slowed large browser runs | CRITICAL | **Fixed** |
| 3 | Large client-side images needed stricter scaling caps to avoid timeout risk | MEDIUM | **Fixed** |
| 4 | Watermarkity page mixed browser flow with stale queue and API concepts | MEDIUM | **Fixed** |
