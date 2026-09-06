# Independent verification 6 — Boundary Replay capture and replay CLI

Date: 2026-09-06 UTC  
Live URL: https://incident-boundary-replay.sociobot.in  
Implementation candidate: `09a9cdc40cb83150f572f339bb54ea0dbad81d7d`  
Documentation commit: `39deee330e014f864b53074b5ba3938ac8bba834`  
Checked repository snapshot: `0232d61fd6643ecb42fff27b2eb8d78ffb94cca0` (later factory/report-only commit)

## Verdict

**PASS.** There are **zero findings** of every severity and **zero untested public claims**.

Boundary Replay's job is to record selected HTTP failures, remove configured
secrets before saving, and export a localhost mock. It is for backend engineers
reproducing queue, webhook, and third-party failures. In fresh 1440 × 900 and
390 × 844 live browsers, before any scrolling, the first screen stated that
job, named those engineers and failure types, and offered **Try it with sample
data** as the first action. The action ended at y=537 of the desktop viewport.

## Candidate and scope

The implementation under review is `09a9cdc`, which removes the capture-port
race, reports the actual bound loopback port, and includes child stdout/stderr
on capture startup failure. `39deee3` is the documentation commit requested by
the work order. `0232d61` follows both and only records factory work; it does
not require a new product image.

The production browser artifact made by the clean checkout matched live HTTPS
byte-for-byte:

| File | SHA-256 | Result |
| --- | --- | --- |
| `index.html` | `e6c234626fd67a67678daee59d8fb5854497a359b5c5b041f700befa2b7fd9fe` | match |
| `404.html` | `04394a1ee1a3b2d29124e227d5a57bb30a6836d6f0530f41b98988275632411c` | match |
| `sw.js` | `80f33b9be02d18358f7584dea2ddaa8cb07e9a363932983096bf124a5701bec8` | match |
| `assets/main-BlkGr-R_.js` | `db0ae7d79fea342970321f5dcb1478228c78cfa782dc66eec8fb09bc9f4e31d0` | match |
| `assets/main-3azw1oUJ.css` | `2bcf68debf5f30dbd284a38cde6cf8d11e5eaef5b8a4f15c52bd1a7c097c5e3e` | match |

## Clean checkout and claims

I cloned the public repository into `/tmp/ibr-v6-clean.0gQN7B/repo`, installed
the documented Rust 1.88.0 toolchain, and ran `npm ci`. All 19 exact commands
from `.factory/claims.json` passed from that clean clone on their initial
invocation. Each is the declared `npm test -- --grep @claim:<id>` command.

| Claim IDs passed | Evidence checked by the declared test |
| --- | --- |
| `msrv-build`, `build-artifacts`, `deployed-routes`, `shipped-sample` | Rust 1.88 build; both production artifacts; direct routes and real HTTP 404; shipped browser and CLI samples |
| `default-cli-demo`, `redact-before-disk`, `local-only-replay`, `runnable-local-mock` | temporary demo and printed mock command; redaction before disk; non-loopback and redirect denial; recorded method/path/status/headers/body |
| `signed-local-webhook`, `private-demo`, `cli-demo-isolation`, `telemetry-free` | fresh local HMAC; demo namespace and same-origin requests; refusal/preservation of existing folder; no CLI socket or browser third-party request |
| `chosen-output-paths`, `empty-output-folders`, `cli-json-and-errors`, `capture-opt-in` | named output paths; refusal before populated-folder changes; JSON/stdout/stderr exit behavior; no exchange before capture then a recorded request |
| `offline-demo`, `sample-export`, `free-local-exporter` | controlled service-worker offline reload; one redacted browser sample; free export path |

The repaired claim was additionally run as:

```sh
npm test -- --grep @claim:capture-opt-in --repeat-each=20
```

It passed all 20 repetitions. This independently resolves F-5-1 rather than
accepting a one-off pass.

The full suite then passed: `npm test` reported 31 Playwright tests, and its
pretest reported 4 Rust unit tests. `npm run typecheck`, `npm run lint`,
`cargo fmt --all -- --check`, `npm run build`, and `cargo package --locked`
all passed. The package verification compiled the archive; it contained 11
files (78.8 KiB, 22.8 KiB compressed). The project declares no separate
format script, so the documented Rust formatter check is the applicable format
gate. The built site JavaScript is 13,980 bytes (5,070 bytes gzip) and CSS is
12,997 bytes (3,790 bytes gzip).

## Clean consumer CLI exercise

I installed the verified crate archive into a separate consumer root,
`/tmp/ibr-v6-consumer.QBmIKB`, with `cargo install --path ... --locked`.
The installed executable reported `boundary-replay 0.1.0`; `demo --json`
created a one-fixture temporary bundle. I then ran installed `capture` with
`--listen 127.0.0.1:0` against a separate local upstream.

It announced the actual address `http://127.0.0.1:34019`, returned the
upstream's 503 JSON response and `retry-after: 30`, and saved one exchange
under the named consumer capture directory. The saved exchange redacted both
the authorization header and email field. This covers the normal job path and
the repaired port-selection behavior in an installed artifact, not just the
repository binary. The declared claims cover invalid input, non-loopback
targets, redirect boundaries, populated-folder refusal, and recovery/error
paths; all passed above.

## Live desktop and phone checks

Fresh Chromium contexts were used; no account or existing visitor data was
used. The desktop initial page had `scrollY=0`, title `Boundary Replay — replay
HTTP failures on localhost`, the stated job/audience/action, and all three
plain facts. Keyboard Tab focused the visible **Skip to content** link, and
Enter moved to `#main`.

One click entered `/demo`. The page immediately showed the populated
`payment.failed` webhook, `POST /webhooks/payment`, a 503 response, and four
removed values. The persistent banner read **Demo — sample data, nothing is
saved** and exposed **Reset demo** and **Start for real**. Export produced one
fixture with status 503, four redactions, and `[REDACTED]` for customer email.
**Inspect capture** changed the observable output; **Reset demo** restored its
initial message. Leaving demo removed only
`demo:incident-boundary-replay:state`; seeded real local and session values
remained unchanged. Requests throughout the landing/demo flow were same-origin
only.

At 390 × 844 with touch enabled, the first screen and populated demo had no
horizontal overflow and no visible link or button below 44 × 44 CSS pixels.
The sample banner and 503 response remained visible and usable. With reduced
motion emulated, the media query matched and no page animations were active.

## Accessibility, offline, routing, privacy, and links

Playwright Axe scans had zero violations on desktop landing, `/demo`,
`/privacy`, `/terms`, the designed missing page, and the 390 px demo. The
factory `verify-url.sh` passed live in 803 ms: title present, `lang=en`, one
`h1`, a main landmark, no images missing alt text, no unlabeled buttons, and
no console errors. The live phone check also had no console errors.

Routes were direct-loaded and had the following results:

| URL | Status | Title | Result |
| --- | ---: | --- | --- |
| `/` | 200 | `Boundary Replay — replay HTTP failures on localhost` | pass |
| `/demo` | 200 | `Demo — Boundary Replay` | pass |
| `/privacy` | 200 | `Privacy — Boundary Replay` | pass |
| `/terms` | 200 | `Terms — Boundary Replay` | pass |
| `/missing-v6` | 404 | `Not found — Boundary Replay` | expected designed 404 |

The 404 has one main landmark, a plain `Page not found` h1, consistent chrome,
and a working return-home action. Chromium records a failed-resource console
line for the deliberate 404 navigation; that is expected HTTP behavior, not a
broken page or console defect.

After initial `/demo` load, the service worker controlled the page and had no
waiting update. Offline reload returned the demo, retained the populated
sample, and showed `Offline — this page and its sample data remain available.`
The live response includes HSTS, nosniff, strict-origin referrer policy,
restrictive permissions policy, and a CSP with response-header
`frame-ancestors 'none'`. All rendered navigation links, source and factory
external links returned 200; the privacy email is an explicit `mailto:` link.
The skip link on the deliberate missing page is same-document navigation on
that 404 response, so its underlying URL correctly remains 404 rather than a
broken link.

There is no backend, tenant, account, billing, or rate-limited API in this
product. Tenant isolation, restart persistence, health, and 429/Retry-After
server checks are therefore not applicable. The CLI's local 503 response did
preserve `retry-after: 30` in the clean consumer test.

## Earlier findings disposition

Every earlier review and verification report was reread. All are resolved and
were checked against the current claim run, installed artifact, or live page:

| Earlier findings | Current disposition and proof |
| --- | --- |
| F-1-1 | Rust 1.88 is documented and the clean MSRV claim passed. |
| F-1-2 | The unbounded `safe` copy is absent; specific controls are claimed and tested. |
| F-1-3 | The default-demo test runs the printed mock and verifies the 503 fixture. |
| F-1-4, F-1-5 | Route metadata is route-specific; live 404 chrome is consistent. |
| F-1-6 through F-1-10 | The current first screen, preview, workflow, and limits use plain job/action wording, confirmed in the fresh cold read. |
| F-1-11, F-1-12, F-1-13 | Transcript wording is plain, clipboard recovery is selectable, and the offline notice names the page and sample. |
| F-1-14, F-1-15, F-1-16 | Deploy wording remains split and factual; the 404 says `Page not found` and `Return home`. |
| F-2-1 through F-2-4 | Clean provisioning, build artifacts, deployed routes, and shipped-sample equivalence all passed their exact claims. |
| F-2-5 through F-2-8 | Landing/README jargon and inconsistent loopback terminology remain removed or defined; the internal publishing sentence is absent. |
| F-3-1 | Fresh CLI demo output is covered by `default-cli-demo` and matches the landing recording after only its random temporary ID varies. |
| F-3-2 | The self-hosted IBM Plex Mono asset is present in the current built/live output. |
| Verification 1: touch targets, unlisted claims, TypeScript | Fresh phone target scan found none under 44 px; 19 claims all ran; typecheck passed. |
| Verification 2: below-fold action, redirects, isolation, persistent label, exit, paid control, accessibility, inventory, HTTP 404, help | Fresh desktop action is y=537/900; redirect/isolation claims pass; banner/reset/exit were live-tested; no paid control remains; Axe/targets/routes/help and all claims pass. |
| Verification 3: wordmark name, 404, missing claims, populated export, text size, cross-route focus, install action, responsive art | Axe/live route checks, `empty-output-folders`, current navigation/source link, mobile scan, and shipped responsive assets pass. |
| F-5-1 | Capture now reports its actual port. The clean exact claim passed and then passed 20 consecutive repetitions; the installed consumer capture also used an OS-selected port successfully. |

No prior finding is open, partially fixed, or regressed. There is no missing
AI feature: the scoped job is a local privacy-preserving CLI, and sending
incident contents to an AI service would add an unnecessary data boundary.

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

The report verdict is **PASS**: finding count 0; untested claim count 0.
