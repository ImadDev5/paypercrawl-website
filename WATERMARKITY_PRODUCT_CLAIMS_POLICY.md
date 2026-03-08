# Watermarkity Product Claims Policy

## Approved Claims
Use wording equivalent to:
- "Helps deter unauthorized crawling and reuse."
- "Adds invisible watermark signals for attribution and verification."
- "Improves ability to detect transformed/republished assets."

## Disallowed Claims
Do not use wording equivalent to:
- "Absolutely blocks all crawlers/LLMs"
- "Cannot be recreated"
- "Impossible to remove"

## Required Qualifiers
- Results depend on attacker sophistication and transform type.
- Confidence scores are probabilistic indicators, not legal proof by themselves.
- Watermarking is one layer in a defense-in-depth approach.

## Support / Sales Guidance
If asked for guarantees:
- State that Watermarkity provides strong deterrence and forensic signals.
- Recommend combining with challenge/rate-limit/access controls for best outcomes.

---

## Compliance Checklist (Feb 2026 Review)

### Dashboard UI Copy
- [x] Page title uses "Watermarkity Browser Studio" — neutral, no absolute claim.
- [x] Description states the image is protected locally in the browser with real-time progress — factual.
- [x] Confidence displayed as percentage with "confidence" label, not "proof" or "guarantee".
- [x] Completed state shows confidence and watermark ID without claiming certainty or permanence.
- [x] No reference to "impossible", "absolute", "unbreakable", or "permanent" anywhere in client code.

### API Error Messages
- [x] Error responses use neutral technical language (e.g., "Rate limit exceeded", "Watermarkity is disabled").
- [x] No marketing language leaks into API error payloads.

### Documentation
- [x] `WATERMARKITY_RELEASE_RUNBOOK.md` — Hard Requirements section restates "never claim absolute blocking."
- [x] `WATERMARKITY_OPERATIONS_CHECKLIST.md` — Monthly review item for product wording.
- [x] `README.md` — Links to ops docs without marketing claims.

### External-Facing Surfaces
- [x] Dashboard CTA card on main dashboard uses browser-only wording with live stage tracking and verification language.
- [x] No blog posts, landing pages, or email templates reference Watermarkity with absolute claims (verify before each release).
