# Boundary Replay handoff

## Repair 2026-08-28 — SWA 404 configuration

- Reproduced the rejected schema from candidate `25e18b3339022f42e9dca5ff7c7b09af0bf5f1d8`:
  the `/404` route combined `statusCode: 404` with `rewrite: /index.html`.
  Azure Static Web Apps rejects that combination.
- Moved the status response handling to
  `responseOverrides: {"404": {"rewrite": "/404.html"}}`, retained the
  SPA `navigationFallback`, and removed the invalid route rule.
- Added a real, CSP-compatible `404.html` and `404.css` in the product's
  luminous-instrument visual system. The SPA still renders its client-side
  404 for unknown navigation routes; SWA now has a designed document for
  server 404 responses.
- Added Playwright regression coverage that parses the source config, rejects
  any route which combines `rewrite` and `statusCode`, asserts the 404
  override, and checks the static 404 document's title, main landmark, h1,
  and return-home link.
- Repaired the offline shell exposed by the fresh verification run. The build
  now writes the emitted JS, CSS, fonts, and product assets into the service
  worker's precache list. Its offline fallback ignores Vite's `Vary: Origin`
  response variation, so the precached entry CSS and JS are usable after an
  offline reload. The offline claim asserts both entry assets are cached
  before it reloads offline.
- Repair commit: `0156247a810285e0c1e805b83bae70fe849b4b74`, pushed to
  `origin/main` before deployment.
- Follow-up offline repair commit:
  `0cc2fb6882d145a0ad58a2f8a829d6d9dfcc70fc`, also pushed to `origin/main`
  and deployed through the same static SWA configuration.

### Repair verification

- Clean dependency install: `npm ci` — passed (0 vulnerabilities).
- `npm test` / Playwright: 11 passed. This covers Rust units, capture and
  replay integration, every listed claim, offline reload, private demo
  requests/storage, keyboard/mobile structure, accessibility, real route
  history/focus, and the new SWA schema regression.
- Exact product build command: `npm run build` — passed; Vite emitted
  `dist/site` and Cargo emitted `target/release/boundary-replay`.
- Release package: `cargo package` — passed. Dependency audit:
  `npm audit --omit=dev` — 0 vulnerabilities.
- Built-artifact assertion: `dist/site/staticwebapp.config.json` has no
  route with both `rewrite` and `statusCode`, has the `/404.html` response
  override, and contains both `404.html` and `404.css`.
- Static deploy: factory `deploy-static.sh incident-boundary-replay dist/site`
  accepted the repaired config and uploaded deployment
  `9570b7b4-f399-46b7-ad4b-66b39180e461` to
  `https://purple-meadow-07881ae10.7.azurestaticapps.net`.
- Live default-host check: factory `verify-url.sh` returned HTTP 200 in
  668 ms, with no console errors; title, `lang=en`, one h1, main landmark,
  and image alts passed. The deployed `/404.html` returned HTTP 200 with the
  configured CSP and security headers.
- Final custom-domain identity check: Azure reports `Ready` for
  `incident-boundary-replay.sociobot.in`; `https://incident-boundary-replay.sociobot.in/`
  returned HTTP 200. Factory `verify-url.sh` loaded it in 884 ms with no
  console errors; its title, `lang=en`, h1, main landmark, labels, and image
  alt checks all passed. The deployed `sw.js` exposes cache v2, its emitted
  JS/CSS precache entries, and the `ignoreVary` offline fallback. The deployed
  `404.html` returns HTTP 200 with the configured CSP and security headers.

## Built

- Rust 0.1.0 single-binary CLI with `capture`, `export`, `serve`, `send`, and
  `demo` commands.
- Explicit loopback capture sidecar with JSON/header redaction before disk.
- Portable fixture bundles, exact method/path mock matching, and recorded
  response playback.
- Loopback-only webhook sending with a new HMAC-SHA256 signature from an
  environment secret.
- One-command temporary demo using the shipped failed-payment fixture.
- Vite site at `dist/site` with `/`, `/demo`, `/privacy`, `/terms`, and `/404`.
- Isolated browser demo, offline shell, responsive 390 px layout, keyboard
  focus handling, history navigation, and empty/error feedback.
- $49 one-time Team Policy Pack flow through Sociobot checkout and license
  verification. Valid licenses reveal a generated JSON policy download.
- Original generated boundary landscape, original terminal recording, Open
  Graph art, favicon, metadata, sitemap, robots, security headers, and PWA
  caching.

## Run

```sh
cargo run -- demo
cargo run -- --help
npm install
npm run dev
```

The browser demo URL is `/demo`. CLI demo data is created in a new temporary
folder. It never reads an existing capture folder.

## Verification

- `cargo test`: 3 passed.
- `npm test`: 10 passed, including all eight claim tests.
- `npm run build`: passed; site output is `dist/site/index.html`; release CLI
  is `target/release/boundary-replay`.
- `cargo package`: passed; package archive is ready for the
  factory registry workflow.
- `npm audit`: 0 vulnerabilities.
- Factory `verify-url.sh`: load 624 ms, no console errors, one h1, `lang=en`,
  main landmark present, and no missing image alt text.
- Playwright axe scan: 0 serious or critical violations.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100. LCP 1.6 s and CLS 0.044. Lab INP was unavailable because the
  audit performs no user interaction.
- First-load budgets: JS 6.13 KB gzip; CSS 3.54 KB gzip; Latin fonts 37 KB;
  hero WebP 62 KB. All are below the product budgets.
- Desktop and 390×844 screenshots were inspected. Reduced motion removes the
  one-shot signal sweep and terminal cursor movement.

## Claim evidence

`.factory/claims.json` maps every product claim to one Playwright test. Tests
use a fresh temporary folder or browser context. The capture claim proxies a
real local HTTP request and confirms that request and response secrets never
reach the saved exchange.

## Known gaps

- Capture buffers request and response bodies up to 10 MiB. Streaming and
  WebSocket traffic are outside v1 scope.
- Mock selection uses exact method and path matching. It returns the first
  match when a bundle contains duplicates.
- The factory must register the Sociobot paid product before live checkout can
  issue licenses. No product ID or payment-provider credential is stored here.
- The paid policy download is a client-side gate because deployment is static.
  License verification is real, but the JSON is not a server-protected asset.

## Next steps

- Factory: register the paid product, publish signed CLI binaries, and deploy
  `dist/site`.
- Later: add streaming body capture and deterministic request match rules when
  real bundle feedback shows they are needed.
