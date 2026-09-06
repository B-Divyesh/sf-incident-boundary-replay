# Capture HTTP failures and replay them locally — verification 7

Date: 2026-09-06 UTC  
Live URL: https://incident-boundary-replay.sociobot.in  
Implementation candidate: `1fc70880aab6bfc165d3726537f7aaab560a03a9`  
Documentation commit: `752ccbb`  
Checked clean-clone snapshot: `8e1fe05cd4b705a008cb487930d59bf1ccc35d99`

## Verdict

**PASS.** Finding count: **0**. Untested public claim count: **0**.

Boundary Replay records an opted-in HTTP failure, removes selected secrets before saving it, and exports a localhost mock. It is for backend engineers reproducing queue, webhook, and third-party request failures. In fresh desktop and phone browsers, before scrolling, the first screen stated that job and audience and offered **Try it with sample data**. The desktop action was visible at y=461 in a 1440 × 900 viewport.

`1fc7088` is the runtime candidate: it reports the actual listener address selected for `--listen 127.0.0.1:0`. `752ccbb` records the preceding repair handoff. The checked `8e1fe05` snapshot contains later factory-only work and does not change the reviewed product runtime. The released browser asset is identical to the clean candidate build.

## Clean checkout and declared claims

I cloned the repository into a new temporary directory, used the documented toolchain prerequisite (the available Rust was 1.98.0, satisfying the stated 1.88 minimum), and ran `npm ci`. It completed with zero vulnerabilities. Every exact command in `.factory/claims.json` ran once from that clone and passed. The command log is `/work/.evidence/verification-7-claims.log`.

| Claim IDs passed | Observable contract checked |
| --- | --- |
| `msrv-build`, `build-artifacts`, `deployed-routes`, `shipped-sample` | Supported Rust build; production artifacts; direct client routes and real 404; CLI/browser use the shipped sample and policy. |
| `default-cli-demo`, `redact-before-disk`, `local-only-replay`, `runnable-local-mock` | Temp demo and printed mock command; scrub-before-write; loopback and redirect boundary; recorded method/path/status/headers/body. |
| `signed-local-webhook`, `private-demo`, `cli-demo-isolation`, `telemetry-free` | Fresh local signing; isolated browser state and same-origin requests; existing-folder preservation; no telemetry socket/request. |
| `chosen-output-paths`, `empty-output-folders`, `cli-json-and-errors`, `capture-opt-in` | Named output folders only; populated-output refusal; JSON and actionable stderr/exit behavior; no capture before explicit command. |
| `offline-demo`, `sample-export`, `free-local-exporter` | Service-worker controlled offline reload; one redacted exported fixture; free browser export path. |

The live landing, demo, README, and legal copy were cross-checked against the 19-entry inventory. The visitor-reliant statements map to those claims; no missing, false, or incomplete public claim was found.

## Quality gates and package

All of these passed in the clean clone. Output is in `/work/.evidence/verification-7-quality.log`.

```sh
npm test                     # 31 Playwright tests; pretest ran 4 Rust tests
npm run typecheck
npm run lint
cargo fmt --all -- --check
npm run build
cargo package --locked
```

The package verifier accepted 11 files (78.9 KiB unpacked, 22.8 KiB compressed). The production build created `dist/site/index.html` and the release binary. Its main JavaScript is 13.98 kB (5.07 kB gzip) and main CSS is 13.00 kB (3.79 kB gzip).

The 21 public build files that are served by the live site matched their clean build byte-for-byte, including HTML, service worker, scripts, styles, fonts, images, icons, sitemap, and robots file. `staticwebapp.config.json` correctly is not a public asset and returned the deliberate deployment-level 404.

## Installed CLI exercise

I installed the packaged crate into a separate clean consumer root with `cargo install --path ... --locked --root ...`. The installed binary reported `boundary-replay 0.1.0` and supplied command help.

Using that installed binary only, I started a loopback upstream, ran `capture --listen 127.0.0.1:0`, and sent one selected webhook. The command announced a nonzero bound port, forwarded and recorded the upstream 503 JSON response and `Retry-After: 12`, wrote one capture, and did not retain the seeded private values (only redaction markers). I exported it, served the bundle on another OS-selected nonzero port, and got the same 503 body and header. After stopping the mock, a second fresh `serve --listen 127.0.0.1:0` also replayed the fixture successfully. This verifies normal capture, export, replay, and restart persistence of a bundle outside the repository build.

Invalid, boundary, and recovery paths are also covered by the clean declared claims: non-loopback bind/target rejection, all redirect statuses denied, populated output refusal without changes, invalid command errors on stderr, and no capture before explicit opt-in. There is no hosted backend, account, tenant, health endpoint, or rate-limited API, so tenant isolation, database restart, health, and 429 checks do not apply.

## Live desktop and phone verification

Fresh Chromium contexts were used at 1440 × 900 and 390 × 844. The phone had touch enabled and reduced motion emulated.

- The initial pages had `scrollY=0`; both plainly named the job, audience, and first action before scrolling. There was no horizontal overflow and no visible link or button under 44 × 44 CSS px.
- One click entered `/demo` and immediately showed the realistic `payment.failed` sample: `POST /webhooks/payment`, four removed values, and a 503 response. The persistent label was exactly **Demo — sample data, nothing is saved**.
- Export produced one fixture with status 503 and redaction markers. Reset restored the sample and focused its heading. **Start for real** removed only `demo:incident-boundary-replay:state`; seeded non-demo local and session values remained unchanged. Landing and demo requests were same-origin only.
- The first Tab focused the visible 3 px **Skip to content** ring; Enter moved focus to `main`. Subsequent demo controls remained keyboard-operable. Reduced motion was respected.
- After service-worker control, an offline `/demo` reload returned HTTP 200 from the cache and displayed the offline notice with the populated sample.

The factory URL verifier passed in 783 ms with no console errors, one h1, one main landmark, `lang=en`, complete image alt text, and no unlabeled buttons. Playwright Axe found zero violations on `/`, `/demo`, `/privacy`, `/terms`, and the designed missing route. The verifier evidence is under `/work/.evidence/verification-7-url/`.

| Route | Status | Title | Result |
| --- | ---: | --- | --- |
| `/` | 200 | `Boundary Replay — replay HTTP failures on localhost` | pass |
| `/demo` | 200 | `Demo — Boundary Replay` | pass |
| `/privacy` | 200 | `Privacy — Boundary Replay` | pass |
| `/terms` | 200 | `Terms — Boundary Replay` | pass |
| `/missing-verify-7` | 404 | `Not found — Boundary Replay` | expected designed 404 with return-home link |

All rendered HTTP links returned 200; the privacy contact is an explicit `mailto:` link. Live response headers include CSP with response-header `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and a restrictive permissions policy.

## Earlier findings disposition

Every review, verification, and polish report was inspected. None is open, partly fixed, or regressed.

| Earlier finding set | Current disposition and proof |
| --- | --- |
| Review 1 F-1-1 through F-1-16 | Rust minimum, claim boundaries, demo behavior, route metadata/404 chrome, first-screen wording, recovery copy, offline notice, deploy wording, and plain 404 wording are covered by the clean claims, current live cold read, route scan, and URL verifier. |
| Review 2 F-2-1 through F-2-8 | Clean setup, production artifacts, direct routes, shipped samples, terminology, and README wording pass the 19 exact claims and clean quality gates. |
| Review 3 F-3-1 and F-3-2 | `default-cli-demo` proves the current CLI transcript and mock command; the byte-matched build includes the self-hosted declared mono font. |
| Verification 1 | Phone target scan found no control under 44 px; all public claims are inventoried and tested; `npm run typecheck` passes. |
| Verification 2 | Redirect denial, demo isolation/exit/persistent label, non-empty-folder safety, help, route status, accessibility, and no paid claim are all currently proved by the claim suite and live checks. |
| Verification 3 | Current visible wordmark/name, real 404, claims, export-output safety, text sizing, cross-route focus, install action, and responsive art pass current build and live checks. |
| Review 5 F-5-1 | `capture-opt-in` passed from the clean clone using its OS-selected capture address. The installed consumer capture independently announced and used a nonzero selected port. |
| Review 6 F-6-1 | `runnable-local-mock` passed from the clean clone. The installed consumer exercise independently served/restarted using nonzero OS-selected mock ports and replayed the fixture. |

There is no missing AI feature: the defined job is deterministic local capture and replay of potentially sensitive incident traffic; adding a remote model boundary would not serve that job or its privacy constraints.

## Reproduce

```sh
rustup toolchain install 1.88.0 --profile minimal
npm ci
npm test
npm run typecheck
npm run lint
cargo fmt --all -- --check
npm run build
cargo package --locked
```

The unambiguous verification result is **PASS**.
