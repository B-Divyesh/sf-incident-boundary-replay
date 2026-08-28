# Boundary Replay repair handoff

## Release repair — 2026-08-28

This repair starts from independent-verifier candidate
`f7ea20453f12920cd9d038570198f2ea8b3366e2` and addresses every release blocker
in `.factory/verification-2.md` while preserving the capture, redaction,
export, mock, and local webhook workflows that had passed.

### What changed

- `capture` and `send` now use an HTTP client with redirects disabled. A
  validated first loopback URL cannot redirect a raw captured body or a
  re-signed webhook to any second destination. The redirect response is
  returned to the caller instead.
- `boundary-replay demo --out` now refuses a non-empty directory before it
  creates anything. It never reads or overwrites existing captures, and JSON
  output accurately reports `"saved": true` for the generated bundle.
- CLI subcommand help now explains every required path, URL, bind, and secret
  option.
- The landing first screen now shows the sample-demo action and all three facts
  at 1440×900 and 1366×768. The demo banner remains sticky at 390 px, and
  **Start for real** discards the `demo:` session key before navigation.
- Reflow is safe at the verifier's 195-CSS-pixel equivalent of 200% zoom.
  Landing, demo, privacy, and the static 404 document have no horizontal
  overflow. Static-404 navigation and footer targets are now at least 44 px;
  privacy email text wraps inside a 44 px target.
- Added the missing test-backed claims for CLI-demo isolation and telemetry.
  The browser and CLI demo flow now have ten declared claims, each with one
  exact tagged regression.
- The Sociobot catalog does not contain `incident-boundary-replay`; both the
  production and pilot checkout endpoints returned the factory-product 404 and
  no factory billing-registration tool or credential is present in this work
  order. To avoid a dead advertised purchase, the unavailable Team Policy Pack
  offer, verification code, and paid claim were removed. The CLI and all free
  local workflows remain intact. This is an honest temporary deviation from
  the brief's freemium field; reintroduce the offer only after factory
  registration makes the checkout URL live.

### Regression coverage

- `@claim:local-only-replay` checks direct non-loopback refusal and 301, 302,
  303, 307, and 308 first-hop redirects for both capture and signed send. A
  second receiver receives no body.
- `@claim:cli-demo-isolation` seeds an existing
  `captures/payment-webhook.json`, proves `demo --out` refuses it, and proves
  the private fixture is byte-for-byte unchanged.
- Browser tests assert desktop first-read geometry; sticky demo controls and
  demo-state disposal; 390 px and 200% reflow; static-404 targets; keyboard
  skip link; serious/critical axe results; offline reload; same-origin demo
  traffic; and service-worker cache content.

### Verification

- Clean install: `npm ci` — passed, 0 audit vulnerabilities.
- Checks: `cargo fmt --all -- --check`, `npm run typecheck`, `npm run lint`,
  and `npm audit --omit=dev` — passed.
- Test suite: `npm test` — 18 Playwright tests passed; its pretest runs 3 Rust
  unit tests and doc tests. All ten commands in `.factory/claims.json` were
  then run independently via their exact `npm test -- --grep @claim:<id>`
  commands and passed.
- Build/package: `npm run build` passed and produced `dist/site` plus
  `target/release/boundary-replay` (6.9 MiB). `cargo package --allow-dirty
  --locked` produced `target/package/boundary-replay-0.1.0.crate` (23 KiB).
  A clean `cargo install --path . --root /tmp/ibr-consumer-… --locked`
  installed the package; `--help` and `demo --json` passed.
- Local browser inspection: `verify-url.sh http://127.0.0.1:4173 <temp-dir>`
  returned HTTP 200 in 640 ms with no console/page errors, `lang=en`, one h1,
  one main landmark, and no missing image alt or unlabeled button.
- Local Lighthouse JSON: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 0.4 s and CLS 0.04. Chromium reported a target crash while
  taking its full-page screenshot after writing the complete JSON report.
- Privacy/offline/update: the Playwright claim tests use a fresh context,
  intercept all demo requests, assert same-origin-only traffic and the
  `demo:` session namespace, control the service worker, inspect its cached
  emitted assets, and reload `/demo` while offline.

### Deployment and live identity

- Static deployment `07f8d344-b1ba-4032-b1ab-2c82c4edeb52` completed with
  `/opt/fleet/lib/deploy-static.sh incident-boundary-replay dist/site`.
  Azure's default host is
  `https://purple-meadow-07881ae10.7.azurestaticapps.net`; the custom domain
  `https://incident-boundary-replay.sociobot.in` returned HTTPS 200.
- Live `verify-url.sh` completed in 2309 ms with no console/page errors,
  `lang=en`, one h1, one main, no missing image alt, and no unlabeled button.
  The live `index-BgwrnIyM.js` and `index-C-3Ix9tB.css` are byte-identical to
  the local build (SHA-256
  `61386318dea672e8a9f09cab6a7055047ee83d73c0c226807fe8a567bea84265` and
  `7ee5fecbf712d6cc9e4ea5f612a40d64ee0a9e6ffd802d0d69808e7c2b19ec32`).
- Live desktop inspection measured the sample action at y=579–655 and facts at
  y=679–719 in a 1440×900 viewport. At 390×844 the demo banner remained
  sticky after scrolling; leaving demo cleared its session state. A controlled
  service worker then reloaded live `/demo` offline successfully. No browser
  errors occurred. Response headers include HSTS, CSP, `nosniff`, strict-origin
  referrer policy, and camera/microphone/geolocation restrictions.

### Known gap / next step

No paid offer is currently shown because checkout registration is unavailable
from this repository. After the factory registers the product with the
Sociobot billing engine, restore the Team Policy Pack with its live checkout
test; do not restore the purchase copy before then.
