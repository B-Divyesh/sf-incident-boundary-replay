# Polish 3 — cumulative acceptance map

Repaired candidate `9ca531ce8abc140c597e0456d3d27a5288966eef` is deployed from
commit `8f8de77cbcae771f6e348242f951da15e9f4802d`. Evidence below comes from
the clean-clone claim logs, the local 31-test suite, and the cold deployed
site. Live route, metadata, accessibility, isolation, offline, and font
results are in `.factory/qa-evidence/polish-3-live-report.json`.

| Finding | Change made | Test evidence | Screenshot | Live URL check |
|---|---|---|---|---|
| F-1-1 | Declared Rust 1.88 and self-provisions it for a locked build. | `@claim:msrv-build` passed after Rust 1.88 was uninstalled. | `polish-3-live-desktop.png` | `/` links to the corrected install instructions. |
| F-1-2 | Removed unbounded “safe” wording. | Copy audit; 31-test suite. | `polish-3-live-desktop.png` | `/` says “Replay them on localhost.” |
| F-1-3 | Tests temp output, printed mock command, mock response, and both landing transcripts. | `@claim:default-cli-demo`. | `polish-3-live-desktop.png` | `/` transcript matches fresh release stdout. |
| F-1-4 | Updates all route descriptions, canonicals, Open Graph, and Twitter metadata. | `routes update social metadata and the standalone 404 shares the site chrome`. | `polish-3-live-404-mobile.png` | `/demo`, `/privacy`, `/terms`, and `/missing-route`. |
| F-1-5 | Builds the real 404 through the shared Vite shell and chrome. | 404 routing/chrome tests. | `polish-3-live-404-mobile.png` | `/missing-route` returns HTTP 404. |
| F-1-6 | Names backend engineers and queue, webhook, and third-party failures. | Mobile/desktop first-read test. | `polish-3-live-desktop.png` | `/` cold first screen. |
| F-1-7 | Preview label names the localhost-mock result. | Copy audit. | `polish-3-live-desktop.png` | `/` preview section. |
| F-1-8 | Preview heading names secret removal before export. | Copy audit. | `polish-3-live-desktop.png` | `/` preview section. |
| F-1-9 | Workflow label names record, secret removal, and replay. | Hash-navigation test. | `polish-3-live-desktop.png` | `/#how`. |
| F-1-10 | Limits label names the product limits. | Copy audit. | `polish-3-live-desktop.png` | `/` limits section. |
| F-1-11 | Uses “four secret or personal-data fields” in CLI proof. | `@claim:default-cli-demo`. | `polish-3-live-desktop.png` | `/` transcript. |
| F-1-12 | Adds labelled selectable install text and usable copy failure recovery. | Install-guidance browser test. | `polish-3-live-desktop.png` | `/` install controls. |
| F-1-13 | Names the page and sample data in the offline notice. | `@claim:offline-demo`; live offline report. | `polish-3-live-demo-mobile.png` | `/demo` offline reload. |
| F-1-14 | Splits README direct-route and missing-route sentences. | `@claim:deployed-routes`. | `polish-3-live-404-mobile.png` | `/demo`, `/privacy`, `/terms`, `/missing-route`. |
| F-1-15 | Names the exact locked package verification command. | `cargo package --allow-dirty --locked`. | `polish-3-live-desktop.png` | Source README linked from `/`. |
| F-1-16 | Uses “Page not found” and “Return home.” | `@claim:deployed-routes`. | `polish-3-live-404-mobile.png` | `/missing-route`. |
| F-2-1 | MSRV claim self-provisions Rust 1.88. | Clean `@claim:msrv-build`. | `polish-3-live-desktop.png` | `/` install path. |
| F-2-2 | Inventoried static and release build outputs. | `@claim:build-artifacts`. | `polish-3-live-desktop.png` | Deployed `main-*` assets match build. |
| F-2-3 | Inventoried direct routes and the real HTTP 404. | `@claim:deployed-routes`. | `polish-3-live-404-mobile.png` | `/missing-route` is 404. |
| F-2-4 | Compares both demos to both shipped example files. | `@claim:shipped-sample`. | `polish-3-live-demo-mobile.png` | `/?demo=1` shows the shipped payment failure. |
| F-2-5 | Replaced landing implementation jargon with plain actions/results. | Copy audit; 31-test suite. | `polish-3-live-desktop.png` | `/` cold first screen. |
| F-2-6 | Rewrote README setup and recording terms in plain language. | Copy audit. | `polish-3-live-desktop.png` | `/` source link returns 200. |
| F-2-7 | Introduces `loopback` with `127.0.0.1` and uses it consistently. | `@claim:local-only-replay`; copy audit. | `polish-3-live-desktop.png` | `/` fact line. |
| F-2-8 | Removed internal registry-publishing copy. | README audit. | `polish-3-live-desktop.png` | `/` source link returns 200. |
| F-3-1 | Replaced altered/invented lines with one captured `boundary-replay demo` transcript in HTML and SVG; normalizes only the temp ID. | `@claim:default-cli-demo`; live report `cliTranscript.matchesFreshReleaseStdout=true`. | `polish-3-live-desktop.png` | `/` loads transcript from deployed `main-BlkGr-R_.js`. |
| F-3-2 | Uses actual `IBM Plex Mono`; the Vite-built 404 loads the shared self-hosted face. | `self-hosted IBM Plex Mono loads for the product body on landing and 404 routes`; live font report. | `polish-3-live-404-mobile.png` | `/` and `/missing-route` request/load IBM Plex Mono. |

Screenshot paths above are relative to `.factory/qa-evidence/`. The demo
screenshot is cold at 390 × 844 and shows the persistent isolated-data banner,
Reset demo, and Start for real. The 404 screenshot is cold at 390 × 844. The
desktop screenshot is cold at 1440 × 900 and keeps the job, audience, action,
and three facts in view.

The product retains its luminous glass data-landscape identity: dark instrument
surfaces, cyan request paths, amber secret-removal signals, clipped controls,
and original boundary artwork. It does not use a generic SaaS template.
