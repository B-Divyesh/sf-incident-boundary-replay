# Independent verification 3 — FAIL

**Candidate:** `f49ea0b4e9ecc7dfc86cd35d39ab891ff11cd4bc`

**Live URL:** https://incident-boundary-replay.sociobot.in

**Verified:** 2026-08-28 from `/work/repo` at the candidate commit

## Verdict

**FAIL — do not release.** The core CLI, all ten declared claim commands, the
production build, package installation, browser demo, privacy boundary, and
offline flow work. The candidate still violates the mandatory accessibility,
real-404, and claims-inventory contracts. The live install action also does not
give a cold visitor a usable installation path.

## Mandatory first-read gate

**PASS.** On a cold 1440 × 900 visit, the page says:

- What: “Capture failures. Replay them safely on localhost.”
- For whom: “For backend engineers who need the failed boundary, not another
  trace.”
- First click: **Try it with sample data**, followed by “See a scrubbed failed
  webhook and its local response.”

The action ends at y=655 and the three facts end at y=719, so both are visible
without scrolling. One click opens `/demo`, already populated with a scrubbed
`payment.failed` webhook and recorded 503 response. The sticky banner says
“Demo — sample data, nothing is saved” and includes **Reset demo** and **Start
for real**. Evidence:
[`live-cold-desktop.png`](qa-evidence/live-cold-desktop.png) and
[`live-demo-desktop.png`](qa-evidence/live-demo-desktop.png).

## Required claim gate

`.factory/claims.json` exists. After the clean `npm ci`, every exact command was
run independently and passed one matching test. Logs are in
`/tmp/ibr-claim-<id>.log` in the verification container.

| Claim | Result |
| --- | --- |
| `redact-before-disk` | PASS — 1 test |
| `local-only-replay` | PASS — 1 test |
| `runnable-local-mock` | PASS — 1 test |
| `signed-local-webhook` | PASS — 1 test |
| `private-demo` | PASS — 1 test |
| `cli-demo-isolation` | PASS — 1 test |
| `telemetry-free` | PASS — 1 test |
| `offline-demo` | PASS — 1 test |
| `sample-export` | PASS — 1 test |
| `free-local-exporter` | PASS — 1 test |

Each claim ID occurs in exactly one tagged test. A probe before dependency
installation could not load local `@playwright/test`; this was a missing
prerequisite, not a product test result. The post-install acceptance runs above
are the recorded claim results.

## Release-blocking defects

### High — the mobile wordmark fails visible-label/name consistency

At 390 px, CSS hides the words “Boundary Replay,” leaving the visible label
**BR**. The link retains `aria-label="Boundary Replay home"`, which does not
contain the visible text “BR.” Lighthouse's axe audit reports
`label-content-name-mismatch` with **serious** impact, WCAG 2.1 A criterion
2.5.3. Voice-control users cannot address the control by its visible label.

The otherwise standard axe scan reports zero serious/critical findings, and
the link has a 44 × 44 px box. That does not negate this explicitly identified
serious rule. Include the visible label in the accessible name or avoid the
mobile-only abbreviation.

### High — missing URLs return HTTP 200 instead of a real 404

Both a fresh browser navigation and `curl -I
https://incident-boundary-replay.sociobot.in/definitely-missing-independent`
returned **200** with the SPA shell. The client renders a designed not-found
screen, but the HTTP response remains successful. This violates the supplied
site-structure requirement for a real 404 and misleads crawlers and clients.
The navigation fallback currently wins before `responseOverrides.404` can
apply.

### Medium — claim-like promises remain unlisted or incompletely proved

The claims contract makes this release-blocking. Examples:

- README and `/privacy`: captures and bundles are written “only to paths you
  choose.” No claim entry asserts filesystem scope.
- README: the mock returns recorded response **headers** as well as status and
  body. `@claim:runnable-local-mock` asserts status and body, not headers.
- README: `demo`, `export`, and `send` provide machine-readable JSON; errors
  use non-zero status and stderr. These public CLI guarantees have no claim
  entries.
- Landing page: “Capture starts only when you run the sidecar” has no matching
  claim entry.

Add observable sandbox tests and inventory entries, or narrow/remove these
promises. Also strengthen `@claim:telemetry-free`: its browser requests are
intercepted, but the CLI half only proves that `demo` succeeds without network
configuration, not that the binary makes no outbound connection.

## Other defects

### Medium — live install action lacks a usable acquisition step

**Copy install command** copies `cargo install --path .`. On a clean directory
this exits 101 because no `Cargo.toml` exists, and the live page gives no clone
URL or prerequisite. The README command works from this repository, and the
packaged crate installs correctly, but a cold site visitor cannot get from the
live page to a working CLI. Link the source/release and copy a complete command,
or state that the command must run inside a clone.

### Low — hero image is not responsive

The 1152 × 768 hero has no `srcset`/`sizes`. Lighthouse estimates 51 KiB image
savings at mobile dimensions. The 63.1 KiB file remains below the 300 KiB
budget and does not prevent a 100 performance score.

## What passed

- Install/checks: `npm ci` passed with 0 vulnerabilities;
  `npm run typecheck`, `npm run lint`, `cargo fmt --all -- --check`, and
  `npm audit --omit=dev` passed.
- Tests/build: `npm test` passed 3 Rust unit tests and 17 Playwright tests.
  `npm run build` passed and produced `dist/site` and the 7,147,776-byte release
  binary.
- Package consumer: `cargo package --allow-dirty --locked` verified 11 files
  (22.3 KiB compressed). Installing the packaged source into
  `/tmp/ibr-consumer.cvwC6f` succeeded; `--version`, `--help`, and `demo --json`
  worked.
- Independent CLI flow: 20 concurrent captures returned the seeded 503. An
  exact 10 MiB request passed; 10 MiB + 1 byte returned 502; the next small
  request passed. The 22 files retained the trace ID and contained redaction
  markers but none of the tested request/response secrets. Export returned 22
  fixtures. Fifty concurrent exact mock requests returned the recorded 503 and
  body; a wrong method returned 404.
- Safety/recovery: non-loopback bind/send, malformed policy, empty capture
  export, missing bundle, missing signing secret, and non-empty demo output all
  exited 1 with actionable errors. The isolated demo did not change its seeded
  private file. A signed local send returned 202 with a valid fresh HMAC,
  scrubbed body, and no captured authorization/signature headers.
- Live identity: every publicly served file in `dist/site` is byte-identical to
  the candidate build. JS SHA-256 is
  `61386318dea672e8a9f09cab6a7055047ee83d73c0c226807fe8a567bea84265`;
  CSS is
  `7ee5fecbf712d6cc9e4ea5f612a40d64ee0a9e6ffd802d0d69808e7c2b19ec32`.
- Browser: `/`, `/demo`, `/privacy`, `/terms`, `/404`, and a missing route each
  render one h1, one main, `lang=en`, expected titles, no missing image alt,
  no horizontal overflow, and no console/page errors. All runtime requests
  were same-origin. Internal assets/routes and the Sociobot footer link resolve.
- Mobile/keyboard: at 390 × 844, all measured links/buttons are at least 44 px,
  the banner remains sticky after scrolling, leaving demo clears its session
  key, and the full page has no horizontal overflow. The 195 CSS-pixel 200%
  reflow check passes on landing, demo, privacy, terms, and standalone 404.
  Skip, demo inspection, local-response test, and export work by keyboard. The
  skip link has a visible 3 px amber outline and focuses the h1.
- Privacy/PWA: fresh demo traffic is same-origin and storage is limited to the
  documented `demo:` session key. Service-worker `update()` leaves one active
  worker and no waiting worker; cache `boundary-replay-v2` contains the shell
  and emitted assets. Offline `/demo` reload shows the sample, 503 response,
  and offline notice without errors. Reduced motion shortens transitions and
  removes animation.
- Response policy: HTTPS includes HSTS, self-only CSP, `nosniff`, strict-origin
  referrer policy, and camera/microphone/geolocation restrictions. HTML and
  `sw.js` revalidate after 30 seconds; hashed assets use one-year immutable
  caching.
- Budgets: JS 12,279 bytes; CSS 12,476 bytes; fonts 75,792 bytes; hero WebP
  63,102 bytes. All stated byte budgets pass.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.06 s, LCP 1.36 s, CLS 0.045, TBT 2 ms, total transfer
  97,211 bytes. The separate serious label-in-name audit above still applies.

The deployed product has no public backend API, product-unlock call, or sign-in,
so burst rate limiting and Entra-tenant checks are not applicable. The CLI's
user-launched loopback capture/mock listeners are intentionally local fixture
endpoints; 20/50-request concurrency was tested instead.

## Evidence

- Repository screenshots:
  [`qa-evidence/`](qa-evidence/)
- Claim logs: `/tmp/ibr-claim-*.log`
- Lighthouse report: `/tmp/ibr-lighthouse-live.json`
- Live hash downloads: `/tmp/ibr-live-hash.sRnG61`
