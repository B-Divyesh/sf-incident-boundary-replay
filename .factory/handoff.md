# Boundary Replay — polish 2 handoff

## Delivered

- Closed all 16 review-1 findings and all 8 review-2 findings. The complete
  mapping is in `.factory/polish-2.md`.
- Rewrote the first screen and documentation around requests, responses,
  selected secret removal, localhost mocks, and one consistent loopback rule.
- Kept the one-click `/demo` and `?demo=1` workspace isolated under
  `demo:incident-boundary-replay:state`, with a persistent banner, reset, and
  exit that discards demo state without touching real-data sentinels.
- Expanded `.factory/claims.json` to 19 claims. New claim tests cover
  self-provisioned Rust 1.88, production build outputs, deployed route status,
  and equivalence with both shipped example files.
- Preserved the luminous glass boundary landscape, amber removal pane, offset
  grid, clipped controls, self-hosted type, and reduced-motion behavior.
- Deployed the static artifact to
  https://incident-boundary-replay.sociobot.in with deployment ID
  `e558c69f-62ee-4514-8095-04984c2bf802`.

## Clean-clone verification

Clean clone: `/tmp/ibr-polish2-clean.JLueOx/repo` from product evidence commit
`4a2c0f27fded635025b370e02fbf1f58ec039c77`.

- Uninstalled Rust 1.88 before verification. The exact
  `npm test -- --grep @claim:msrv-build` command provisioned it and passed its
  locked build on the first clean run.
- Ran all 19 commands from `.factory/claims.json` independently: 19 passed.
- `npm test`: 4 Rust unit tests and 30 Playwright integration/browser tests
  passed.
- `npm run typecheck`, `npm run lint`, `cargo fmt --all -- --check`, and
  `npm run build`: passed.
- `cargo package --allow-dirty --locked`: packaged 11 files and verified the
  crate build.
- Production output: JS 13.89 kB (5.05 kB gzip), CSS 13.01 kB (3.78 kB gzip),
  self-hosted fonts 75.79 kB total.

## Browser, accessibility, privacy, and offline evidence

- Browser suite covers `/`, `/demo`, `?demo=1`, `/privacy`, `/terms`, the SPA
  fallback, and standalone HTTP 404 at 390 px and 200% reflow.
- Every route has `lang="en"`, one h1, one main, route-specific title,
  description, canonical, Open Graph and Twitter text, focus restoration,
  visible focus, and no missing image alt.
- Playwright Axe found zero serious or critical issues across every live route.
- Live demo actions, export, reset, sticky banner, and exit made same-origin
  requests only. Real local/session sentinels remained `keep-me`; demo state
  was removed on exit.
- The installed service worker reloaded `/demo` offline with its sample and
  offline notice visible.
- Mobile first screen: action bottom y=571 and facts bottom y=804 in a 390×844
  viewport. Desktop facts bottom y=658 in a 1440×900 viewport. No horizontal
  overflow occurred.
- Worker URL verifier passed with no product-route console or page errors.
  Browsers emit the expected failed-resource message for the deliberate HTTP
  404 navigation; the 404 document itself has no script error.
- Live Lighthouse mobile: performance 100, accessibility 100, best practices
  100, SEO 100; LCP 1.1 s, CLS 0.003, TBT 0 ms.
- Local and live JS/CSS SHA-256 hashes match exactly. Raw live evidence is in
  `.factory/qa-evidence/polish-2-live-report.json` and
  `.factory/qa-evidence/polish-2-live-verify/`.

## Run and verify

```sh
rustup toolchain install 1.88.0 --profile minimal
npm ci
npm test
npm run typecheck
npm run lint
cargo fmt --all -- --check
npm run build
cargo package --allow-dirty --locked
```

The site deploy root is `dist/site`. The CLI release executable is
`target/release/boundary-replay`.

## Known gaps and next steps

No review finding or acceptance task remains. The earlier dead paid offer was
not reintroduced because this work order has no registered Sociobot billing
product. The complete CLI and exporter remain free. Registry publishing stays
with the factory; the verified crate archive is ready for that separate step.
