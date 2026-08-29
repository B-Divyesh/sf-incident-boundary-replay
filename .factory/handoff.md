# Boundary Replay — polish 3 handoff

## Outcome

The repair is complete and deployed. Product code is commit
`8f8de77cbcae771f6e348242f951da15e9f4802d` (`fix: verify CLI proof and load
product font`), pushed to `main`. Static deployment
`3fd729f6-4105-43dc-b7cc-197b97ae6951` completed through the work-order
configuration and is live at
https://incident-boundary-replay.sociobot.in.

The remaining review-3 defects are closed:

- F-3-1: the HTML terminal and recorded SVG now show a captured transcript of
  the real `boundary-replay demo` command. The claim compares fresh release
  stdout to both after normalizing only the generated temporary-folder ID.
- F-3-2: the page uses the bundled `IBM Plex Mono` family. The real HTTP 404 is
  now a Vite entry point, so it loads the same self-hosted font and product
  chrome rather than a fallback face.

`.factory/polish-3.md` maps every F-1, F-2, and F-3 finding to its change and
evidence. No finding is intentionally deferred.

## How to run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
cargo fmt --all -- --check
npm run build
cargo package --allow-dirty --locked
```

Run a one-click browser demo at `/demo` or `/?demo=1`. Run the isolated CLI
sample with `target/release/boundary-replay demo` after `npm run build`.

## Exact verification evidence

- Clean clone: `/tmp/incident-boundary-replay-polish3-clean.pw7SjP/repo` at
  `8f8de77cbcae771f6e348242f951da15e9f4802d`; `npm ci` passed.
- Every one of the 19 exact commands in `.factory/claims.json` passed
  independently. Logs are `/tmp/incident-boundary-replay-polish3-clean.pw7SjP/claim-*.log`.
  `@claim:msrv-build` passed after Rust 1.88 was first uninstalled, proving
  its own provisioning path.
- Local suite: `npm test` passed 31 Playwright tests plus 4 Rust unit tests and
  doc tests. `npm run typecheck`, `npm run lint`, `cargo fmt --all -- --check`,
  `npm run build`, and `cargo package --allow-dirty --locked` all passed.
- Product build: `dist/site` contains `index.html`, `404.html`, and the release
  executable. Initial JS is 13.98 kB (5.07 kB gzip); CSS is 13.00 kB (3.79 kB
  gzip). The self-hosted IBM Plex Mono WOFF2 is 14.71 kB.
- Live cold checks: `/`, `/demo`, `/privacy`, and `/terms` returned 200;
  `/missing-route` returned the designed 404. Every route had `lang=en`, one
  `h1`, one `main`, no missing `img` alt, route-correct title/canonical/Open
  Graph/Twitter metadata, and zero serious or critical Axe findings. The one
  console message on `/missing-route` is Chromium's expected failed-resource
  notice for the intentional HTTP 404; all successful routes had none.
- Live isolated demo: `?demo=1` showed the banner, Reset demo, and Start for
  real; it used only same-origin requests, preserved real local/session
  sentinels, and discarded only `demo:incident-boundary-replay:state` when
  leaving. A service-worker-controlled offline `/demo` reload retained the
  sample, 503 response, and offline notice.
- Live transcript/font: the deployed terminal transcript matched fresh release
  CLI stdout after temporary-ID normalization. Computed body font was
  `"IBM Plex Mono", ui-monospace, monospace`; the IBM WOFF2 was requested and
  loaded on landing and 404.
- Live evidence: `.factory/qa-evidence/polish-3-live-report.json`,
  `polish-3-live-desktop.png`, `polish-3-live-demo-mobile.png`, and
  `polish-3-live-404-mobile.png`.
- Lighthouse mobile against the live URL: performance 100, accessibility 100,
  best practices 100, SEO 100; LCP 1.23 s, CLS 0.0032, TBT 9 ms. Raw report:
  `.factory/qa-evidence/polish-3-live-lighthouse.json`.

## Known gaps and next steps

None. The product has no runtime API, sign-in, tracking, paid unlock, or AI
feature; the local CLI and isolated browser demo are intentionally self-hosted
and telemetry-free. To publish the crate later, run `cargo publish` from a
factory environment with registry credentials; this work order does not publish
packages.
