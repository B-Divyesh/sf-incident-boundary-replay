# Polish 2 — cumulative acceptance map

Candidate `1469113ec5fd449cbca58bc3ea8da78c6878651b` was repaired against
every finding in reviews 1 and 2. Product changes are in `b7651a0` and the
expanded evidence suite is in `4a2c0f2`.

Evidence paths used below:

- `L-mobile`: `.factory/qa-evidence/polish-2-live-mobile.png`
- `L-desktop`: `.factory/qa-evidence/polish-2-live-desktop.png`
- `L-demo`: `.factory/qa-evidence/polish-2-live-demo-mobile.png`
- `L-report`: `.factory/qa-evidence/polish-2-live-report.json`
- `URL-check`: `.factory/qa-evidence/polish-2-live-verify/verify.json`

## Review 1

| Finding | Change made | Test evidence | Screenshot | Live URL check |
|---|---|---|---|---|
| F-1-1 | Kept `rust-version = "1.88"`; the claim now installs the missing minimal toolchain before its locked build. | `@claim:msrv-build`; passed first in a clean worker with only Rust 1.98. | L-desktop | `/` shows the install path; GitHub README returns 200. |
| F-1-2 | Kept the unbounded “safe” wording out of the headline, art alt, and README. | Copy audit plus `site structure, keyboard path, mobile layout, and accessibility`. | L-mobile | `/` has “Capture HTTP failures. Replay them on localhost.” |
| F-1-3 | Kept the default demo isolated and verified its printed mock command end to end. | `@claim:default-cli-demo`. | L-desktop | `/` terminal preview matches the command flow. |
| F-1-4 | Route renders set description, canonical, Open Graph, and Twitter metadata. | `routes update social metadata and the standalone 404 shares the site chrome`. | L-demo | `/demo`, `/privacy`, `/terms`, and missing route metadata recorded in L-report. |
| F-1-5 | Static 404 retains the shared BR wordmark, nav, footer line, builder link, version, and build date. | `SWA config rewrites only known client routes and preserves a real 404 response`. | L-mobile | `/missing-route` returns the designed page with HTTP 404. |
| F-1-6 | First screen names backend engineers and queue, webhook, and third-party failures. | `mobile and desktop first read keep the demo action and facts in view`. | L-mobile | `/` action ends at y=571 and facts at y=804 in 390×844. |
| F-1-7 | Preview label says a captured failure becomes a localhost mock. | Copy audit. | L-desktop | `/` rendered copy checked cold. |
| F-1-8 | Preview heading says “Remove selected secrets before export.” | Copy audit. | L-desktop | `/` rendered copy checked cold. |
| F-1-9 | Workflow label names capture, secret removal, and replay. | Copy audit. | L-mobile | `/#how` renders and receives focus through cross-route navigation. |
| F-1-10 | Limits label states what Boundary Replay will not do. | Copy audit. | L-mobile | `/` rendered copy checked cold. |
| F-1-11 | Terminal says four secret or personal-data fields were removed before saving. | `@claim:default-cli-demo`. | L-desktop | `/` terminal preview uses the corrected sentence. |
| F-1-12 | A labelled, selectable install field remains next to the copy action and usable failure text. | `install guidance links to source, copies a clone-ready command, and uses the mobile landscape source`. | L-mobile | `/` field, button, and source link are present. |
| F-1-13 | Offline notice says the page and sample data remain available. | `@claim:offline-demo`. | L-demo | Cold live demo reloaded offline with notice and 503 sample visible. |
| F-1-14 | README keeps direct-route and unknown-route behavior in separate sentences. | `@claim:deployed-routes`. | L-desktop | Three deep routes return 200; `/missing-route` returns 404. |
| F-1-15 | README uses the exact locked package verification command. | Clean `cargo package --allow-dirty --locked`; 11 files packaged and verified. | L-desktop | GitHub README returns 200 from the live source link. |
| F-1-16 | SPA and static 404 use “Page not found” and “Return home.” | `@claim:deployed-routes`. | L-mobile | `/missing-route` returns HTTP 404 with the recovery link. |

## Review 2

| Finding | Change made | Test evidence | Screenshot | Live URL check |
|---|---|---|---|---|
| F-2-1 | The exact MSRV claim self-provisions Rust 1.88 when absent, then runs `cargo build --locked`. README also lists the provision command. | `@claim:msrv-build`; clean-clone first run passed in 55.7s after uninstalling 1.88. | L-desktop | `/` links to the corrected README; repository URL returns 200. |
| F-2-2 | Added `build-artifacts` to the claims inventory and asserted both static and release outputs after the real production build. | `@claim:build-artifacts`; clean clone passed and found `dist/site/index.html` plus `target/release/boundary-replay`. | L-desktop | Deployed JS/CSS hashes match the local production build. |
| F-2-3 | Added a claim server that applies the shipped Static Web Apps rules, deep-loads all legal/demo routes, and returns the designed document with status 404. | `@claim:deployed-routes`. | L-demo | `/demo`, `/privacy`, `/terms` = 200; `/missing-route` = 404 in L-report. |
| F-2-4 | README names both example files. The new claim compares method, path, event, status, and four removed fields across examples, CLI, and browser. | `@claim:shipped-sample`. | L-demo | `/?demo=1` shows the shipped `payment.failed` request and 503 response. |
| F-2-5 | Deleted the redundant eyebrow and replaced boundary/fixture/sidecar wording with requests, responses, secret removal, localhost mock, and capture command. | Copy audit; full 30-test browser suite. | L-mobile | Cold `/` contains none of the seven cited phrases. |
| F-2-6 | Rewrote the README introduction, demo, recording section, forwarding explanation, and unsaved-body limit in plain words. | Copy audit; README maximum sentence length is 20 words. | L-desktop | Live source link reaches the updated GitHub README with HTTP 200. |
| F-2-7 | The first screen introduces “loopback addresses such as 127.0.0.1.” Safety rules, README, claims, help, and errors use “loopback.” | `@claim:local-only-replay`. | L-mobile | `/` displays the exact loopback rule before scrolling. |
| F-2-8 | Removed the internal registry-publishing sentence without adding an unsupported publishing promise. | Copy audit and README inspection. | L-desktop | Live source link reaches the updated README with HTTP 200. |

## Final live evidence

- Deployment ID: `e558c69f-62ee-4514-8095-04984c2bf802`.
- Live URL: https://incident-boundary-replay.sociobot.in
- URL verifier: title, language, one h1, main, alt text, button names, and console passed.
- Axe: zero serious or critical findings on `/`, `/demo`, `/privacy`, `/terms`,
  and the designed 404.
- Live Lighthouse mobile: performance 100, accessibility 100, best practices
  100, SEO 100; LCP 1.1 s, CLS 0.003, TBT 0 ms.
- Live JS SHA-256: `582f1fad0728a8acbae9b419b627944e459e9ad558f3e8433e2366f490aae8ba`.
- Live CSS SHA-256: `a801b92cebb5d51bda268eede7540cd24840a7db5dca43e6af42a3e1cef6d2bf`.

No finding from either review remains unresolved.
