# Independent verification — FAIL

**Candidate:** `785c7738670b535a9d50ba5bde7c2834be29bcef`  
**Live URL:** https://incident-boundary-replay.sociobot.in  
**Verified:** 2026-08-28 from a fresh clone at that commit

## Verdict

**FAIL — do not release.** The live product and candidate build work for the core job, but the live 390 px interface exposes several touch controls below the mandatory 44 × 44 CSS-pixel minimum. The site also contains claim-like copy that is not represented in `.factory/claims.json`. These violate the acceptance contract even though the functional claim suite passes.

## First-read test (cold live visit)

Passed. The first screen says “Capture failures. Replay them safely on localhost.” It identifies “backend engineers who need the failed boundary, not another trace,” and offers a visible one-click **Try it with sample data** action with the result stated beside it: “See a scrubbed failed webhook and its local response.” No console or page errors occurred and only same-origin assets loaded.

## Required claim gate

`.factory/claims.json` is present and declares eight tests. Each exact command was run independently from the fresh clone and passed:

| Claim | Command result |
| --- | --- |
| `redact-before-disk` | PASS — 1 Playwright test |
| `local-only-replay` | PASS — 1 Playwright test |
| `runnable-local-mock` | PASS — 1 Playwright test |
| `signed-local-webhook` | PASS — 1 Playwright test |
| `private-demo` | PASS — 1 Playwright test |
| `offline-demo` | PASS — 1 Playwright test |
| `sample-export` | PASS — 1 Playwright test |
| `paid-policy-pack` | PASS — 1 Playwright test |

## What passed

- Clean install: `npm ci` completed with no npm audit vulnerabilities.
- Full suite: `npm test` passed, **11/11**. Rust unit tests, all eight claim tests, routes, accessibility scan, mobile structure, and SWA configuration are included.
- Production build: `npm run build` passed. Vite generated `dist/site` and Cargo generated `target/release/boundary-replay` (6.8 MiB).
- Package readiness: `cargo package --allow-dirty` passed; a clean consumer `cargo install --path . --root <temp>` installed the binary successfully; its `--help` and `demo --json` worked.
- Manual CLI flow: `boundary-replay demo --json` exported one temporary fixture; `serve` returned the recorded `503` JSON and `retry-after: 30` for `POST /webhooks/payment`. A non-matching path returned an actionable 404. Non-loopback `serve` and `send` targets were refused with exit status 1. A missing redaction-policy file produced an actionable error with exit 1.
- Live deployment identity: candidate-built JS and CSS are byte-identical to the live hashed files. SHA-256: JS `182ce198e1a4053e538ce14600ab8a3cbd33ccb9f6a07e1d8531108f7bfbbbe5`; CSS `6e746709c620decd402bf57ec53161876fcd9a8ee9cf354a4587225b47504f37`.
- Live desktop and 390 px demo: no horizontal overflow, no console/page errors, no third-party requests in demo, correct demo-prefixed session key, demo banner and Reset action present. Live offline reload worked after the service worker took control.
- Accessibility: live axe scan found **0 serious or critical violations**. Keyboard focus is visible (3 px amber outline), the skip link moves focus to the h1, and reduced motion reports no signal-sweep animation.
- Headers: HTTPS root has HSTS, CSP, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`. Hashed JS/CSS use `public, max-age=31536000, immutable`; HTML and service worker use short revalidation caching. CSP permits only self assets and the Sociobot API.
- Bundle budgets: emitted JS 16.63 KB (6.13 KB gzip), CSS 11.31 KB (3.54 KB gzip), and hero WebP 63.1 KB; all are within stated budgets. A fresh Lighthouse run could not be completed in this container because Lighthouse crashed the supplied Playwright Chromium; this is an environment limitation, not a pass assertion.
- Product-unlock API rate limit: first burst of 30 invalid-license verification requests returned 200. The immediately following 100-request parallel burst returned 2 × 200 and 98 × 429; the first accepted capacity observed was 32 requests in the combined burst sequence. A 429 included `retry-after: 0`.

## Defects

### High — touch targets fail at 390 px (release-blocking)

The deployed mobile UI has interactive targets far below the required 44 px height: header **Demo** 31 × 21, **How it works** 94 × 21, **Privacy** 55 × 21, footer links 19 px high, and the persistent-demo **Start for real** action 110 × 21. The wordmark is only 40 × 40. This fails the stated mobile/touch accessibility acceptance criterion. Increase hit areas (not merely visible text) to at least 44 × 44 px and retain spacing between adjacent targets.

### Medium — unlisted claims (release-blocking under the claims contract)

Live copy makes observable claims that do not have a matching entry and sandbox test in `.factory/claims.json`: “Other traffic stays untouched” and “The free exporter stays complete” / “Free local exporter.” Add independent, observable demo tests for each assertion or remove/rephrase the claims.

### Medium — standalone TypeScript check fails

There is no declared `typecheck` script, but the available TypeScript checker fails with `npx tsc --noEmit`: `tests/product.spec.ts:139` accesses `.src` and `.href` on an `HTMLScriptElement | HTMLLinkElement` union. Add a configured typecheck and correct the narrowing before treating type safety as green.

## Evidence locations

Temporary independent evidence includes `/tmp/live-cold-desktop.png`, `/tmp/live-mobile-demo.png`, `/tmp/claim-*.log`, and the fresh verification clone at `/tmp/incident-boundary-replay-verify` during this run. `/tmp/lighthouse-live.json` was not produced because the supplied browser crashed.
