# Independent verification 2 — FAIL

**Candidate:** `f7ea20453f12920cd9d038570198f2ea8b3366e2`
**Live URL:** https://incident-boundary-replay.sociobot.in
**Verified:** 2026-08-28 from clean clone `/tmp/ibr-f7-clean-iawgV2`

## Verdict

**FAIL — do not release.** The normal capture/export/mock path works, all nine
declared claim commands pass, and the live deployment matches the candidate.
However, redirects bypass the advertised host safety boundary, the CLI demo can
read and overwrite existing captures, and the required first-read test fails on
a normal desktop viewport. The paid checkout is also dead, demo state is not
discarded on exit, and accessibility requirements remain unmet.

## Mandatory first-read test

Cold-read summary: Boundary Replay captures an opted-in failed HTTP exchange,
scrubs selected secrets, and makes a localhost mock for backend engineers. The
intended first click is **Try it with sample data**.

This test **fails**. At 1440 × 900, the headline is at y=203–777 and the
audience line at y=809–870, but the primary action starts at y=902 and the three
facts start at y=1017. At 1366 × 768, the action starts at y=783. Thus the first
screen does not show what to click first or the required facts. The action is
visible at 390 × 844, but that does not repair the desktop failure. The cold
page returned 200 with no console or page errors.

Evidence screenshot: `/tmp/boundary-first-read.png`.

## Required claim gate

`.factory/claims.json` exists and declares nine tests. After `npm ci`, every
exact command was run independently in the clean clone and passed:

| Claim | Result |
| --- | --- |
| `redact-before-disk` | PASS — 1 Playwright test |
| `local-only-replay` | PASS — 1 Playwright test |
| `runnable-local-mock` | PASS — 1 Playwright test |
| `signed-local-webhook` | PASS — 1 Playwright test |
| `private-demo` | PASS — 1 Playwright test |
| `offline-demo` | PASS — 1 Playwright test |
| `sample-export` | PASS — 1 Playwright test |
| `free-local-exporter` | PASS — 1 Playwright test |
| `paid-policy-pack` | PASS — 1 Playwright test |

The passing `local-only-replay` test is insufficient: the independent redirect
case below falsifies its observable promise. The test checks only the initial
target, not the effective target after redirects.

## Release-blocking defects

### Critical — HTTP redirects bypass the replay and capture safety boundaries

`boundary-replay send` validates only the initial URL. A controlled loopback
endpoint at `127.0.0.1:18920` returned a 307 to the container's non-loopback
address `100.100.197.35:18921`. The CLI followed it, delivered the POST body and
new `x-boundary-replay-signature`, reported status 202, and exited 0. This
directly contradicts “webhook sends accept loopback targets only” and the
non-goal of production replay.

The capture sidecar has the same redirect gap. With the configured upstream at
`127.0.0.1:18930`, a 307 sent the raw body containing
`raw@example.com` and `DO-NOT-SEND` to controlled non-loopback address
`100.100.197.35:18931`. The sidecar returned 200. Authorization happened to be
stripped cross-host, but the unredacted body was not.

Disable redirects or validate every effective redirect destination against the
configured/loopback boundary. Add 301/302/303/307/308 cross-host regressions to
the safety claim.

### Critical — CLI demo reads and overwrites existing user data

`boundary-replay demo --out <existing-dir> --json` is not isolated. In a temp
directory containing one existing capture, it exported **2** fixtures and
copied the pre-existing `invoice_id` value `preexisting-private-id` into the
sample bundle. It still printed `"saved": false`.

When the existing file was named `captures/payment-webhook.json`, the same demo
command silently overwrote it with the bundled sample. This contradicts
`.factory/demo.md` (“always create a new temp folder and never read an existing
capture folder”) and creates a data-loss path. Refuse a non-empty output
directory, use an exclusive demo namespace, never read existing captures, and
report persistence truthfully.

### High — browser demo lifecycle violates the sandbox contract

- At 390 × 844, `.demo-banner` changes from `position: sticky` to `relative`.
  After scrolling to y=1430 its box was y=-1358 to -1264, so the demo warning,
  reset, and exit actions were no longer visible.
- Clicking **Start for real** navigated to `/` but left
  `demo:incident-boundary-replay:state` in session storage with the exported
  fixture state. Leaving demo mode is required to discard demo data.

### High — advertised paid flow is unavailable

The live **Buy the policy pack** URL returns HTTP 404 with
`{"error":"enabled factory product","status":404}`. A visitor cannot buy the
advertised $49 pack. The claim test mocks license verification and therefore
does not exercise registration or checkout.

### High — accessibility baseline remains incomplete

- At 390 px, visible targets below 44 px include landing-page inline terms
  (39.1 × 15), privacy (54.8 × 15), and the privacy email link (183 × 19).
- The separately served `/404` document uses stale sizing: its Demo link is
  31.3 × 20.8, Privacy is 54.8 × 20.8, footer Terms is 36.1 × 14, and the
  wordmark is 224.1 × 40.
- A 200% zoom simulation at 390 px produced 256 px horizontal overflow on `/`,
  288 px on `/demo`, and 107 px on `/privacy`, with primary controls extending
  beyond the viewport. The equivalent 195 CSS-pixel reflow also overflowed.

Automated axe found no serious/critical rules on the tested routes, but axe
does not cover these contract-specific target and zoom checks.

### High — claims inventory is incomplete

Claim-like privacy and sandbox promises have no `.factory/claims.json` entry or
matching tagged test. Examples include “Boundary Replay has no telemetry” in
the README, “Boundary Replay sends no telemetry” on `/privacy`, “It does not
read your captures” in the README, and the CLI-demo isolation promise in
`.factory/demo.md`. The latter is demonstrably false in the public `--out`
path. The claims contract makes unlisted claims release-blocking.

## Other defects

### Medium — not-found URLs return HTTP 200

Both `/404` and `/definitely-missing-verifier-route` returned HTTP 200. The UI
renders a designed not-found state, but it is not a real HTTP 404 response.

### Low — subcommand help omits option guidance

The command summaries are useful, but required flags such as `--upstream`,
`--bundle`, `--target`, and `--signing-secret-env` have blank descriptions.
Users must leave `--help` and consult the README to learn formats and safety
semantics.

## What passed

- Clean install: `npm ci` passed with 0 npm audit vulnerabilities.
- Static checks: `npm run typecheck`, `npm run lint`, `cargo fmt --all --
  --check`, and `npm audit --omit=dev` passed. `cargo-audit` was unavailable.
- Full suite: `npm test` passed 13/13 Playwright tests; its Rust pretest passed
  3/3 unit tests and all doc targets.
- Exact production build: `npm run build` passed and produced `dist/site` plus
  `target/release/boundary-replay`.
- Package/consumer: `cargo package --allow-dirty --locked` packaged 11 files
  (21.7 KiB compressed). A clean temporary `cargo install --path /work/repo`
  installed the 6.8 MiB CLI; `--help`, `--version`, and `demo --json` worked.
- Core CLI behavior: 20 concurrent opted-in captures all returned the seeded
  503, created 20 distinct trace-linked files, and left no tested request or
  response secrets on disk. A restart added a 21st capture, export reported 21
  fixtures, and 50 concurrent exact mock requests all returned the recorded
  scrubbed 503. Wrong methods returned 404.
- Boundary/recovery: a 10 MiB body succeeded; 10 MiB + 1 byte returned 502
  `length limit exceeded`; the next small request succeeded. Empty/missing
  captures, invalid policy JSON, invalid sockets, and direct non-local replay
  targets returned exit 1 with actionable errors.
- Deployment identity: live and candidate `index-CBMnvMRP.js` are identical
  (SHA-256 `a0272aa6b8f84f738f4447e11f830ab411878b09e18b9ce47a8037f6b4d50eb9`);
  CSS is identical (SHA-256
  `1ca8a52676863384577557f9de3cec3ac4ed4d9ce8a519ea9506c28ce651b52b`).
  HTML, service worker, 404 assets, metadata files, and original art also
  matched byte-for-byte.
- Live browser basics: `/`, `/demo`, `/privacy`, `/terms`, `/404`, and a
  missing SPA route had one h1, one main, `lang=en`, correct titles, no
  horizontal overflow at normal desktop/mobile sizes, no console/page errors,
  and zero axe serious/critical findings. The factory `verify-url.sh` loaded in
  954 ms with all basic checks green.
- Keyboard: the skip link had a visible 3 px amber focus ring and bypassed the
  header; demo inspection, response test, reset, export download, license form,
  and empty-license error were operable. Reduced motion shortened the one-shot
  sweep to 0.01 ms and one iteration.
- Privacy/network: fresh root and demo sessions made same-origin requests only;
  demo storage used only the documented `demo:` session key. A live invalid
  license check sent only the token to `api.sociobot.in`, stripped it from the
  URL, cached the verdict, and did not repeat on reload.
- Service worker: `update()` completed with an activated worker and no waiting
  version. Cache `boundary-replay-v2` contained the shell and hashed assets;
  offline `/demo` reload worked with the offline notice and no errors.
- Response policy: root uses HSTS, CSP, `nosniff`, strict-origin referrer policy,
  and camera/microphone/geolocation restrictions. HTML and `sw.js` revalidate
  after 30 seconds; hashed JS/CSS use one-year immutable caching.
- Product-unlock rate limit: a fresh rapid sequential burst returned 200 for
  requests 1–30, then 429 starting at request 31. The 429 response included
  `Retry-After: 4`.
- Budgets/performance: JS is 16.59 KB (6.11 KB gzip), CSS 11.56 KB (3.57 KB
  gzip), and hero WebP 63.1 KB. Fresh Lighthouse 12.8.2 mobile scored
  Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.5 s,
  CLS 0.044, TBT 0 ms, and total transfer 96 KiB.
- No sign-in exists, so the Entra External ID requirement is not applicable.

## Evidence locations

Temporary run evidence: `/tmp/ibr-lighthouse.json`,
`/tmp/boundary-first-read.png`, `/tmp/ibr-mobileroot.png`,
`/tmp/ibr-mobilerootdemo.png`, `/tmp/ibr-verify-url-WWDBSO`, and clean clone
`/tmp/ibr-f7-clean-iawgV2`.

## Fresh independent confirmation — 2026-08-28

A second clean clone of the same candidate,
`/tmp/incident-boundary-replay-qa.6pclRe`, reproduced the release blockers
without relying on the earlier report.

- `npm ci` passed. All nine exact commands from `.factory/claims.json` passed,
  as did `npm test` (13/13), `npm run typecheck`, `npm run lint`, and
  `npm run build`. `cargo package --allow-dirty` passed; the packed crate was
  installed into `/tmp/ibr-consumer.mSj69W`, where `--version` and
  `demo --json` worked.
- The live HTML, JS, CSS, and service worker were byte-identical to that
  local production build. The JS SHA-256 was
  `a0272aa6b8f84f738f4447e11f830ab411878b09e18b9ce47a8037f6b4d50eb9` and
  CSS SHA-256 was
  `1ca8a52676863384577557f9de3cec3ac4ed4d9ce8a519ea9506c28ce651b52b`.
- At 1440 x 900, the landing h1 occupied y=203–777, the audience line
  y=809–870, and **Try it with sample data** y=902–977. At 1366 x 768, the
  action began at y=783. The mandatory first screen therefore still does not
  show what to click first.
- A controlled loopback redirect test reproduced the `send` boundary defect:
  `send` accepted `127.0.0.1:19150`, followed its 307 response to controlled
  `100.100.197.35:19151`, and that listener received the POST plus a fresh
  `x-boundary-replay-signature` (status 202). A separately controlled
  `capture` upstream redirect sent its unredacted selected request body to
  `100.100.197.35:19161`; the saved local exchange was scrubbed.
- `demo --out` against a directory containing one capture emitted
  `{"fixtures":2,"saved":false}` and a manifest with two fixture entries.
  With an existing `captures/payment-webhook.json`, the file SHA-256 changed
  from `46078cbb…` to `2816c750…`, confirming overwrite.
- At 390 x 844 after scrolling, the demo banner was `position: relative` at
  y=-285 to -191. **Start for real** returned to `/` but retained
  `demo:incident-boundary-replay:state` in session storage. At a 195 CSS-pixel
  reflow viewport, horizontal overflow was 54 px on `/` and `/privacy`, and
  144 px on `/demo`. The standalone `/404` still includes 14–21 px footer/nav
  targets.
- The live checkout URL returned HTTP 404 with
  `{"error":"enabled factory product","status":404}`.
- Browser checks otherwise passed: no console/page errors; all public SPA
  routes had one h1 and main; axe found zero serious/critical issues; normal
  390 px layout had no overflow and visible controls were at least 44 px;
  focus was a 3 px amber ring; reduced motion shortened animations; fresh
  offline `/demo` reload succeeded; fresh demo requests were same-origin;
  CSP/HSTS/nosniff/referrer policy were present; and hashed JS/CSS were
  immutable for one year. A 40-request verification burst returned 30 HTTP
  200 responses and 10 HTTP 429 responses; 429 included `Retry-After: 3`.

The fresh result remains **FAIL**. In addition to the demonstrated defects,
the unlisted telemetry/demo-isolation privacy promises remain release-blocking
under the supplied claims contract.
