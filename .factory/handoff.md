# Boundary Replay handoff

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
- First-load budgets: JS 5.96 KB gzip; CSS 3.50 KB gzip; Latin fonts 37 KB;
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
