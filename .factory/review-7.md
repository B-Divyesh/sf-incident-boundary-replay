# Capture HTTP failures and replay them locally — review 7

Date: 2026-09-06 UTC  
Live URL: https://incident-boundary-replay.sociobot.in  
Implementation candidate: `1fc70880aab6bfc165d3726537f7aaab560a03a9`  
Documentation baseline: `d7d3bfe`  
Checked repository snapshot: `46079576236f4be712c28899ff62d0fa0fd3d849`

## Verdict

**PASS.** Finding count: **0**. Untested public claim count: **0**.

Boundary Replay records an opted-in failed HTTP exchange, removes selected secrets before saving, and exports a localhost mock. It is for backend engineers reproducing queue, webhook, and third-party request failures.

`1fc7088` is the implementation reviewed. The later commits contain verification documentation and factory Graphify metadata only; the current clean production build and all 21 public live files are byte-for-byte identical. Pre-existing unstaged Graphify changes were not inspected as product changes or staged.

## First screen and demo

Fresh Chromium desktop (1440 × 900) and phone (390 × 844, touch and reduced motion) contexts both began at `scrollY=0` and stated, before scrolling:

- Job: **Capture HTTP failures. Replay them on localhost.**
- Audience: backend engineers reproducing failed queue, webhook, and third-party requests.
- First action: **Try it with sample data**. It was visible on desktop at y=461 and on phone at y=522.

One click entered `/demo` with a populated `payment.failed` fixture: `POST /webhooks/payment`, four removed values, and a 503 local response. The persistent label read **Demo — sample data, nothing is saved**. Export reported one redacted sample. Reset restored the sample and focused its heading. Leaving demo removed only `demo:incident-boundary-replay:state`; seeded non-demo local and session storage values remained unchanged. Browser requests in the full landing/demo flow were same-origin only and no console errors occurred.

## Clean checkout, claims, and quality gates

A new clone at `4607957` was used. I installed the documented Rust 1.88 prerequisite before measurement, ran `npm ci` (zero vulnerabilities), then ran each exact command in `.factory/claims.json` serially. All 19 passed on their clean first measured run:

`msrv-build`, `build-artifacts`, `deployed-routes`, `shipped-sample`, `default-cli-demo`, `redact-before-disk`, `local-only-replay`, `runnable-local-mock`, `signed-local-webhook`, `private-demo`, `cli-demo-isolation`, `telemetry-free`, `chosen-output-paths`, `empty-output-folders`, `cli-json-and-errors`, `capture-opt-in`, `offline-demo`, `sample-export`, and `free-local-exporter`.

These commands cover normal capture/export/replay, redaction before disk, loopback and redirect rejection, signed local webhook delivery, empty-folder refusal and recovery, JSON/error behavior, explicit opt-in capture, demo isolation, privacy requests, offline reload, and shipped sample equivalence. Public landing, demo, README, and legal statements were cross-checked against the 19-item inventory; no unlisted, false, incomplete, or untested public claim remains.

The following clean-clone gates also passed:

```sh
npm test                    # 31 Playwright tests; pretest ran 4 Rust tests
npm run typecheck
npm run lint
cargo fmt --all -- --check
npm run build
cargo package --locked
```

The package verifier accepted 11 files (78.9 KiB unpacked, 22.8 KiB compressed). The production build produced `dist/site/index.html` and the release CLI. Main JavaScript is 13.98 kB (5.07 kB gzip); main CSS is 13.00 kB (3.79 kB gzip).

## Installed CLI

I installed the packaged crate into a separate consumer root with `cargo install --path ... --locked --root ...`. The installed `boundary-replay 0.1.0` supplied useful command help. Its `demo --out ... --json` produced one bundle with no seeded email, card number, or bearer value. The installed `serve --listen 127.0.0.1:0` announced a nonzero loopback address, replayed `POST /webhooks/payment` with the recorded 503 JSON body and `retry-after: 30`, and stopped cleanly. The declared clean claims separately exercised capture, the selected-port capture boundary, local signing, invalid targets, redirects, and mock restart.

## Live browser, accessibility, and routes

The factory URL verifier passed in 829 ms: title, `lang=en`, one h1, one main landmark, complete image alt text, labelled buttons, and no console errors. Axe found zero violations on `/`, `/demo`, `/privacy`, `/terms`, and `/missing-review-7`.

| Route | Status | Title | Result |
| --- | ---: | --- | --- |
| `/` | 200 | `Boundary Replay — replay HTTP failures on localhost` | pass |
| `/demo` | 200 | `Demo — Boundary Replay` | pass |
| `/privacy` | 200 | `Privacy — Boundary Replay` | pass |
| `/terms` | 200 | `Terms — Boundary Replay` | pass |
| `/missing-review-7` | 404 | `Not found — Boundary Replay` | expected designed 404 |

The first Tab reached the visible 3 px skip-link focus ring; Enter moved focus into main. Phone demo controls measured at least 44 px in both dimensions. Reduced-motion media preference was active without animation failure. After service-worker control, a fresh offline `/demo` reload returned 200 and retained the populated sample plus the offline notice. All rendered HTTP links returned 200 except the 404 page's self skip-link, which deliberately preserves the 404 status and is not a broken user path; the privacy link is explicit `mailto:`. Live responses included HSTS, `nosniff`, strict-origin referrer policy, restrictive CSP with response-header `frame-ancestors 'none'`, and permissions policy.

## Earlier findings disposition

| Earlier finding set | Current disposition and evidence |
| --- | --- |
| Review 1 F-1-1 through F-1-16 | Rust 1.88 build, bounded wording, executable demo transcript, plain first-screen/README/404 language, route metadata, shared 404 chrome, recovery copy, and offline notice all pass the new clean claim run, copy audit, and live cold read. |
| Review 2 F-2-1 through F-2-8 | Clean provisioning, build outputs, direct routes with real 404, shipped sample equivalence, terminology, and README content are covered by the 19 exact passing claims and current quality gates. |
| Review 3 F-3-1 and F-3-2 | `default-cli-demo` passes; the installed CLI and build prove the current transcript/mock behavior. The byte-matched live build contains the self-hosted declared mono font. |
| Initial verification | Current phone controls meet the 44 px check; all public claims are listed and tested; `npm run typecheck` passes. |
| Verification 2 | Loopback redirect denial, CLI/demo isolation, persistent demo label and exit, accessibility, claim inventory, help, and real 404 pass the current claims and live checks. No paid feature is advertised. |
| Verification 3 | Visible wordmark, response-status 404, non-empty output refusal, 16 px mobile copy, cross-route focus, install action, and responsive visual asset are covered by the current suite and live build. |
| Review 5 F-5-1 | `capture-opt-in` passed in this clean serial run after Rust provisioning; the claim verifies a nonzero OS-selected capture address. |
| Review 6 F-6-1 | `runnable-local-mock` passed and the separately installed consumer CLI announced a nonzero listener and replayed the fixture. |
| Verifications 4–7 and review 4 | Their zero-finding conditions remain satisfied; the current live artifact match and independent clean rerun show no regression. |

There is no hosted backend, account, tenant, database, health route, rate limit, paid plan, or AI feature in this local CLI product. Tenant isolation, restart persistence of a service, health, and 429 checks are therefore not applicable. Adding a remote model boundary would conflict with the product's deterministic, local-first incident-data constraint.

## Evidence

- `/work/.evidence/review-7-msrv-clean.log`
- `/work/.evidence/review-7-claims-remaining.log`
- `/work/.evidence/review-7-quality.log`
- `/work/.evidence/review-7-installed-flow.log`
- `/work/.evidence/review-7-live-browser.json`
- `/work/.evidence/review-7-live-assets.log`
- `/work/.evidence/review-7-verify-url.log`

The unambiguous review result is **PASS**.
