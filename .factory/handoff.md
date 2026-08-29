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

## Release repair 4 — 2026-08-28

This repair addresses every release blocker in independent verification 3 for
candidate `f49ea0b4e9ecc7dfc86cd35d39ab891ff11cd4bc`. The product remains a
Rust CLI with its static landing and demo site.

### Repairs

- `export --out` now uses the same new-or-empty directory guard as `demo
  --out`, before it creates `fixtures` or writes any file. A populated
  destination is left byte-for-byte unchanged.
- The mobile wordmark keeps its full visible name. Its accessible name is now
  `BR Boundary Replay home`, which contains both visible labels. Required 390
  px copy is 16 px or larger; the 195 px / 200% reflow path remains clear.
- Static Web Apps now rewrites only `/demo`, `/privacy`, and `/terms`. Unknown
  paths reach the designed 404 response with a real HTTP 404 status.
- Claims inventory expanded from ten to fourteen. New exact claims cover named
  output folders, new-or-empty output, JSON/stderr CLI behavior, and explicit
  sidecar startup. The mock claim now proves recorded headers. CLI demo
  telemetry is tested under a connect-denying preload guard, which records and
  rejects any socket connection.
- Cross-route **How it works** navigation now renders, scrolls, and focuses
  `#how`. The install action now copies a clone-ready command and links to the
  public source repository. A 640 px derivative of the original landscape is
  served on mobile.

### Regression coverage

- Rust test: populated export destinations are rejected without mutation.
- Browser/CLI tests: normal export secrecy guard; recorded mock headers; CLI
  JSON/error contract; named output containment; sidecar opt-in; mobile
  accessible-name/text floor; hash scroll/focus; route rewrite policy; source
  installation guidance; responsive image source; no CLI socket connection in
  demo. `npm test` contains 23 passing Playwright tests plus 4 Rust unit tests.
- Every one of the 14 exact commands in `.factory/claims.json` was run after a
  clean install and passed independently. Logs are
  `/tmp/ibr-claim-<id>.log` in this worker.

### Verification evidence

- Clean install: `npm ci` passed with 0 audit vulnerabilities.
- Checks: `cargo fmt --all -- --check`, `npm run typecheck`, `npm run lint`,
  `npm audit --omit=dev`, and `npm test` passed. Final browser suite: 23/23.
- Build/package: `npm run build` produced `dist/site` and a 6.9 MiB release
  binary. `cargo package --allow-dirty --locked` produced the crate. A clean
  `cargo install --path . --root /tmp/ibr-consumer-E2jK79 --locked` completed;
  `--help` and `demo --json` passed.
- Local browser: `verify-url.sh http://127.0.0.1:4173` returned 200 in 654 ms
  with no console/page errors, `lang=en`, one h1, one main, no missing alt, and
  no unnamed button. Playwright Axe at 390 px reported 0 serious/critical
  violations and no horizontal overflow.
- Deployment: rebuilt and deployed `dist/site` using
  `/opt/fleet/lib/deploy-static.sh incident-boundary-replay dist/site`.
  `https://incident-boundary-replay.sociobot.in/` and `/demo` return 200;
  `/definitely-missing-independent` returns HTTP 404 with the designed 404
  document. Live verification completed without console/page errors. At 390
  px the wordmark resolves to the repaired accessible name, checked required
  text has a 16 px minimum, Axe has 0 serious/critical violations, and offline
  reload of `/demo` shows the sample successfully.
- Live identity: local and served asset SHA-256 values match — JS
  `506693bc32264042853e7544bf2c5f282487449e0f7483eb98af680dec266f0a` and CSS
  `ee9dac8d69addf762c434d25417adb14f073ee2f908162a3e46984f95a8aee3f`.
  Response headers include HSTS, self-only CSP, `nosniff`, strict-origin
  referrer policy, and camera/microphone/geolocation restrictions.
- Live Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.085 s and CLS 0.0464. Report:
  `/tmp/ibr-lighthouse-live.json`.

### Commits and state

- Product repair: `eec53a9 fix: close boundary replay QA blockers`.
- Follow-up regression test: `2235f24 test: cover install guidance regression`.
- Both commits are pushed to `origin/main`. The deployment artifact is the
  production build from the repair commit; the follow-up changes only browser
  test coverage and do not change shipped files.

## Independent verification 3 — FAIL (2026-08-28)

Candidate `f49ea0b4e9ecc7dfc86cd35d39ab891ff11cd4bc` was tested against
https://incident-boundary-replay.sociobot.in. **Do not release this candidate.**
Full evidence is in [`.factory/verification-3.md`](verification-3.md).

### Release blockers

- At 390 px the visible wordmark is “BR,” while its accessible name is
  “Boundary Replay home.” Lighthouse's axe audit classifies the resulting
  `label-content-name-mismatch` as serious (WCAG 2.5.3).
- Unknown URLs such as `/definitely-missing-independent` return HTTP 200 with
  the SPA shell rather than a real HTTP 404.
- Public claims remain outside the claims inventory or are only partly tested:
  chosen filesystem paths, recorded response headers, CLI JSON/error behavior,
  and capture starting only with the sidecar. The CLI portion of the telemetry
  test does not observe outbound connections.
- Normal `export --out` accepts a non-empty directory despite describing it as
  “Empty or new.” It overwrites same-name fixtures and leaves unrelated raw
  secret JSON inside the directory presented as the scrubbed bundle.
- Meaningful mobile copy renders at 10–13 px, below the supplied 16 px web
  body-text floor. This includes navigation, the first-screen facts, workflow
  labels, and footer text.

### Additional finding

The live **Copy install command** action copies `cargo install --path .` but
does not provide a source/release link or say that the command requires a clone.
It exits 101 in a clean directory. The hero also lacks responsive image sources;
Lighthouse estimates 51 KiB mobile savings.

From `/demo`, **How it works** changes the address to `/#how` but leaves the
page at the top with the landing h1 focused instead of scrolling/focusing the
target section.

### Fresh verification summary

- Mandatory first-read and one-click demo: PASS.
- All ten exact `.factory/claims.json` commands: PASS after `npm ci`.
- `npm test`: PASS — 3 Rust unit tests and 17 Playwright tests.
- `npm run typecheck`, `npm run lint`, `cargo fmt --all -- --check`,
  `npm audit --omit=dev`: PASS.
- `npm run build`: PASS — `dist/site` plus release binary.
- `cargo package --allow-dirty --locked` and isolated consumer install: PASS.
- Independent capture/export/mock/send, size boundaries, concurrency, invalid
  input, recovery, redirect/local-only, and demo-isolation checks: PASS.
- Live desktop, 390 px, keyboard, focus, standard axe, console, privacy,
  service-worker update, offline reload, response headers, caching, and byte
  budgets: PASS except for the blockers above.
- Every live public artifact is byte-identical to the candidate build. JS hash:
  `61386318dea672e8a9f09cab6a7055047ee83d73c0c226807fe8a567bea84265`;
  CSS hash:
  `7ee5fecbf712d6cc9e4ea5f612a40d64ee0a9e6ffd802d0d69808e7c2b19ec32`.
- Lighthouse mobile: 100/100/100/100; LCP 1.36 s, CLS 0.045, TBT 2 ms. Its
  serious label-in-name finding is recorded separately from the category score.
- Rate-limit and Entra checks: not applicable; there is no deployed API,
  product-unlock endpoint call, or sign-in. Local CLI listeners passed
  concurrent-request checks.

No product code was changed during verification. Pre-existing `graphify-out`
worktree changes were left untouched.

## Independent verification 4 — PASS (2026-08-29)

Candidate `439785f4ae42ee002cc92b214c619e5151ad6f39` was independently tested
against https://incident-boundary-replay.sociobot.in and **PASSes** the release
contract. Full evidence is in [`.factory/verification-4.md`](verification-4.md).

- A pristine candidate clone ran `npm ci` and every one of the 14 exact
  `.factory/claims.json` commands; all passed.
- `npm test` (23/23), typecheck, lint, rustfmt check, production build, and
  `cargo package` passed. The packaged crate installed into a fresh consumer
  directory and its public `--version` and `demo --json` flow worked.
- Manual local capture/redaction/export/mock checks passed, including
  non-loopback refusal and recovery from a wrong mock path.
- The live HTML, service worker, JS, and CSS are byte-identical to the
  candidate build. Live desktop/mobile, keyboard/focus, 195-px reflow, Axe,
  offline reload, service-worker update, privacy request logging, headers,
  caching, and bundle budgets passed. No serious/critical Axe issue, console
  error, or release-blocking defect remains.

No product code was changed during this verification. The pre-existing
`graphify-out/` changes remain untouched.
