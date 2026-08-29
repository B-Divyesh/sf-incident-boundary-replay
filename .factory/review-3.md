# Adversarial first-read review 3 — FAIL

- **Reviewed:** 2026-08-29
- **Candidate:** `9ca531ce8abc140c597e0456d3d27a5288966eef`
- **Live URL:** https://incident-boundary-replay.sociobot.in
- **Clean clone:** `/tmp/ibr-review3-clean.gJHmzg/repo`

## Verdict

**FAIL.** The cold first screen, interactive demo, storage isolation, all 19
declared claims, routes, accessibility checks, and build gates pass. The CLI
proof on the landing page does not match the shipped binary even though it is
labelled “Real CLI output.” The page also fails to load the IBM Plex Mono
body face specified by the product's visual system. There are two findings:
one blocking and one minor.

## Findings

### F-3-1 — BLOCKING — the claimed real CLI recording is altered and partly invented

**Quotes/locations:** landing preview eyebrow, “Real CLI output”; HTML terminal,
“Removed four secret or personal-data fields before saving”; terminal recording
SVG, “Captured POST /webhooks/payment” and “Exported 1 mock · ready on loopback
address 127.0.0.1.”

**Evidence:** running the release binary's required demo command from the fresh
temporary directory `/tmp/ibr-review3-cli-cwd.syokeD` printed:

```text
Demo — isolated sample data; no existing captures were read or changed.
Scrubbed four secret or personal-data fields before disk.
Bundle: /tmp/boundary-replay-demo-67a67310/payment-failure.bundle
Run: boundary-replay serve --bundle /tmp/boundary-replay-demo-67a67310/payment-failure.bundle --listen 127.0.0.1:9487
```

The command does not print the landing page's “Removed … before saving” line.
It also does not print either of the SVG's capture/export lines. Source confirms
the divergence at `src/main.rs:176`, `site/src/main.ts:66`, and
`site/public/assets/terminal-recording.svg:13-15`. The existing
`@claim:default-cli-demo` test verifies the folder, command, and mock response,
but does not compare the displayed recording with stdout. “Real CLI output” is
therefore an unlisted, untested claim.

**Why this blocks:** the CLI demo contract requires a landing-page recording of
the real binary. A first-time visitor is shown polished output that the command
does not produce, so the primary product proof is not honest even though the
underlying command works.

**Concrete fix:** generate the landing recording from a captured
`boundary-replay demo` fixture, or label it “Example CLI flow” and remove lines
the binary does not print. Use one phrase for secret removal across the binary,
landing page, SVG, and README. Extend `@claim:default-cli-demo` to compare the
checked-in recording text with normalized real stdout.

### F-3-2 — Minor — the declared body typeface is not used

**Quote/location:** `.factory/design.md`, “Body and code use IBM Plex Mono”;
`site/src/style.css:15`, `--mono: 'IBM Plex Mono Variable'`; generated CSS,
`@font-face { font-family: 'IBM Plex Mono' }`.

**Evidence:** the live computed body family is `"IBM Plex Mono Variable",
ui-monospace, monospace`, but the only matching font face is named `IBM Plex
Mono`. The cold live request log loads Space Grotesk and never requests either
shipped IBM Plex Mono font file.

**Why this matters:** the page silently uses the browser's generic monospace
face instead of the product-specific type pairing recorded as the visual source
of truth. The overall identity remains distinct, so this is not blocking.

**Concrete fix:** set `--mono: 'IBM Plex Mono', ui-monospace, monospace` or
import the actual variable package under the declared family. Add a browser
test that waits for the family and confirms an IBM Plex Mono font resource was
requested.

## 1. Cold first read

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900 without
scrolling.

- **What it does:** records HTTP failures, removes selected secrets, and replays
  the result on localhost.
- **For whom:** backend engineers reproducing failed queue, webhook, and
  third-party requests.
- **What to click first:** **Try it with sample data**.

All three answers are visible in both first screens. On mobile the action ends
at y=571 and the facts end at y=804. On desktop they end at y=537 and y=658.
There is no horizontal overflow. Evidence:
`/tmp/ibr-review3-cold-mobile.png` and
`/tmp/ibr-review3-cold-desktop.png`.

## 2. Copy audit

Method: whitespace-separated words. Code blocks are commands, not sentences,
so README code blocks are excluded. Headings, labels, actions, conditional
status text, alt text, terminal lines, and visible SVG text are included. No
unit exceeds 22 words and no banned marketing adjective appears. F-3-1 marks
the only copy failure: a truth and terminology mismatch, not a length failure.

### Landing page

| Copy | Words | Result |
|---|---:|---|
| Skip to content | 3 | Pass |
| Boundary Replay | 2 | Pass |
| Demo | 1 | Pass |
| How it works | 3 | Pass |
| Privacy | 1 | Pass |
| Capture HTTP failures. | 3 | Pass |
| Replay them on localhost. | 4 | Pass |
| For backend engineers reproducing failed queue, webhook, and third-party requests. | 10 | Pass |
| Try it with sample data | 5 | Pass: result-naming action |
| See a failed webhook with selected secrets removed. | 8 | Pass |
| Removes secrets before saving | 4 | Pass |
| Accepts loopback addresses such as 127.0.0.1 only | 7 | Pass |
| Free local exporter | 3 | Pass |
| Cyan request paths cross an amber redaction layer toward a local mock. | 12 | Pass |
| Production edge | 2 | Pass: diagram label |
| Remove secrets | 2 | Pass: diagram label |
| Local mock | 2 | Pass: diagram label |
| A captured failure becomes a localhost mock. | 7 | Pass |
| Real CLI output | 3 | **F-3-1** |
| Remove selected secrets before export. | 5 | Pass |
| Demo — isolated sample data; no existing captures were read or changed. | 12 | Pass |
| Removed four secret or personal-data fields before saving. | 8 | **F-3-1** |
| Bundle: /tmp/.../payment-failure.bundle | 2 | Pass: abbreviated command output |
| Run: boundary-replay serve --bundle … --listen 127.0.0.1:9487 | 7 | Pass: abbreviated command output |
| A terminal recording shows the demo command recording a failed webhook and exporting a localhost mock. | 16 | **F-3-1** |
| boundary-replay demo — recorded locally | 5 | **F-3-1** |
| Captured POST /webhooks/payment · trace 7ef92c1b45d04da6 | 6 | **F-3-1** |
| Removed 4 selected values before saving | 6 | **F-3-1** |
| Exported 1 mock · ready on loopback address 127.0.0.1 | 9 | **F-3-1** |
| Install command | 2 | Pass |
| Copy install command | 3 | Pass: result-naming action |
| View source | 2 | Pass: result-naming action |
| Copied. | 1 | Pass |
| Copy failed. | 2 | Pass |
| Select the install command shown above. | 6 | Pass |
| Capture, remove secrets, and replay an HTTP failure. | 8 | Pass |
| How to capture, remove secrets, and replay a failure | 9 | Pass |
| Capture | 1 | Pass |
| Opt in one client | 4 | Pass |
| Route one client through Boundary Replay to record its request and response. | 12 | Pass |
| Remove secrets | 2 | Pass |
| Replace selected values | 3 | Pass |
| Headers and JSON fields are replaced in memory before any write. | 11 | Pass |
| Replay | 1 | Pass |
| Run the local mock | 4 | Pass |
| Match the recorded method and path. | 6 | Pass |
| Return the failed response locally. | 5 | Pass |
| What Boundary Replay will not do. | 6 | Pass |
| Production replay is not a feature | 6 | Pass |
| Recording starts only when you run the capture command. | 9 | Pass |
| Mock servers and webhook sends accept loopback targets only. | 9 | Pass |
| New mock signatures use a secret from your environment. | 9 | Pass |
| Offline — this page and its sample data remain available. | 10 | Pass |
| Record a failed HTTP exchange. | 5 | Pass |
| Replay it on localhost. | 4 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| v0.1.0 · build 2026.08.29 | 4 | Pass |

### README

| Copy | Words | Result |
|---|---:|---|
| Boundary Replay | 2 | Pass |
| Record selected HTTP requests and responses, remove secrets before saving, and export a localhost mock. | 15 | Pass |
| It is for backend engineers reproducing queue, webhook, and third-party failures without calling the original system. | 16 | Pass |
| Boundary Replay sends no telemetry during its local demo flow. | 10 | Pass |
| Recorded requests and exports are written only under output folders you name. | 12 | Pass |
| Mock servers and webhook sends accept loopback addresses such as 127.0.0.1 only. | 12 | Pass |
| They never follow redirects. | 4 | Pass |
| Install | 1 | Pass |
| Build the single binary with Rust 1.88 or newer: | 9 | Pass |
| Check the package archive with cargo package --allow-dirty --locked. | 9 | Pass |
| Run the sample demo | 4 | Pass |
| The demo creates a temporary folder with a failed-payment sample whose selected secrets are removed. | 15 | Pass |
| It prints the command that starts the local mock. | 9 | Pass |
| With --out, it accepts only a new or empty folder. | 10 | Pass |
| It never reads or changes an existing capture folder. | 9 | Pass |
| examples/sample-payment-webhook.json supplies the request and response. | 6 | Pass |
| examples/boundary-replay.json lists the fields removed from that sample. | 8 | Pass |
| The browser walkthrough is available at /demo or https://incident-boundary-replay.sociobot.in/demo. | 9 | Pass |
| Record an HTTP failure | 4 | Pass |
| Start Boundary Replay and name the service that receives the request: | 11 | Pass |
| Point the selected client at http://127.0.0.1:8787. | 6 | Pass |
| Boundary Replay forwards each request. | 5 | Pass |
| It replaces selected headers and JSON fields before saving the request and response. | 13 | Pass |
| Unredacted request and response bodies are not saved in the capture folder. | 12 | Pass |
| Example policy: | 2 | Pass |
| Export and run a mock | 5 | Pass |
| export --out accepts a new or empty folder only. | 9 | Pass |
| It refuses a populated folder before changing any file. | 9 | Pass |
| The local server matches method and path, then returns the recorded status, headers, and body. | 15 | Pass |
| It accepts loopback bind addresses only. | 6 | Pass |
| Send a signed webhook to a loopback service | 8 | Pass |
| send removes captured signature headers and signs the cleaned body with HMAC-SHA256. | 12 | Pass |
| It accepts loopback targets only and returns redirects without following them, so a bundle cannot replay into a production host. | 20 | Pass |
| Script output | 2 | Pass |
| Add --json to demo, export, and send for machine-readable results. | 10 | Pass |
| Errors use a non-zero exit code and go to stderr. | 10 | Pass |
| Develop and verify | 3 | Pass |
| npm run build compiles the site to dist/site. | 8 | Pass |
| It also builds the Rust release binary. | 7 | Pass |
| Site source is under site/; browser tests use Playwright 1.58.2 and the shipped demo data. | 15 | Pass |
| Deploy | 1 | Pass |
| Deploy dist/site as the static root. | 6 | Pass |
| Static Web Apps preserves /demo, /privacy, and /terms on direct loads. | 11 | Pass |
| Unknown URLs return the designed HTTP 404 page. | 8 | Pass |
| License | 1 | Pass |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

All landing buttons use result-naming verbs. Apart from F-3-1, the landing and
README consistently use record/capture command, remove secrets, loopback,
localhost mock, demo, and exported mock for their respective concepts.

## 3. Demo and sandbox

The interactive demo itself passes.

- One click on **Try it with sample data** opens `/demo`.
- The first 390 px screen already shows the persistent banner, sample trace,
  payment-failure h1, `POST`, `/webhooks/payment`, and `payment.failed`.
- The banner says “Demo — sample data, nothing is saved” and provides **Reset
  demo** and **Start for real**.
- **Inspect capture** changes the result. **Reset demo** restores the original
  bundle result and focuses the demo h1.
- Export downloads one realistic bundle with four `[REDACTED]` values and a
  recorded 503 response.
- A seeded local-storage and session-storage real-data sentinel remained
  unchanged. Exit removed `demo:incident-boundary-replay:state` only.
- All browser requests were same-origin. Offline reload kept the sample, 503
  response, banner, and offline notice available.
- The release CLI demo ran from an empty temp directory and left it empty. It
  created its sample under a separate `/tmp/boundary-replay-demo-*` folder.

Evidence: `/tmp/ibr-review3-demo-mobile.png` and the request/storage output from
the live Playwright run. F-3-1 is the separate failure in the landing-page CLI
recording required for this artifact class.

## 4. Claims

Every exact `test` command in `.factory/claims.json` was run independently on
its first attempt after `npm ci` in the clean clone. Every id occurs in exactly
one tagged test.

| Claim id | Result |
|---|---|
| `msrv-build` | PASS |
| `build-artifacts` | PASS |
| `deployed-routes` | PASS |
| `shipped-sample` | PASS |
| `default-cli-demo` | PASS |
| `redact-before-disk` | PASS |
| `local-only-replay` | PASS |
| `runnable-local-mock` | PASS |
| `signed-local-webhook` | PASS |
| `private-demo` | PASS |
| `cli-demo-isolation` | PASS |
| `telemetry-free` | PASS |
| `chosen-output-paths` | PASS |
| `empty-output-folders` | PASS |
| `cli-json-and-errors` | PASS |
| `capture-opt-in` | PASS |
| `offline-demo` | PASS |
| `sample-export` | PASS |
| `free-local-exporter` | PASS |

Logs: `/tmp/ibr-review3-claim-<id>.log`. The live and clean production JS and
CSS hashes match. F-3-1 is the sole unlisted claim-like statement: none of the
declared tests establishes that the displayed “Real CLI output” is real.

## 5. History replay

All earlier reviews, polish reports, and the incoming handoff were read. Each
finding was checked on the live site and in current source.

| Earlier finding | Current verification |
|---|---|
| F-1-1 — false Rust 1.85 minimum | Fixed: README and Cargo metadata say 1.88; the clean claim self-provisioned 1.88 and passed. |
| F-1-2 — unbounded “safe” claim | Fixed: the cited landing, alt, and README text contains no “safe” claim. |
| F-1-3 — incomplete default-demo claim | Fixed for its stated behavior: the tagged test starts the printed mock and verifies the 503 response. F-3-1 concerns the separate visual recording claim. |
| F-1-4 — stale route social metadata | Fixed live and in code on all named routes and 404. |
| F-1-5 — inconsistent 404 chrome | Fixed: wordmark, nav, footer line, links, version, and build id match. |
| F-1-6 — contrast-copy audience sentence | Fixed: the first screen names the audience and failure types. |
| F-1-7 — mood preview index | Fixed: it states that a captured failure becomes a localhost mock. |
| F-1-8 — slogan preview heading | Fixed: it names secret removal before export. |
| F-1-9 — metaphorical workflow index | Fixed: it names capture, secret removal, and replay. |
| F-1-10 — product-lore limits index | Fixed: it names what Boundary Replay will not do. |
| F-1-11 — `PII field(s)` placeholder | Fixed under the original criterion: neither cited phrase remains; the actual CLI says “four secret or personal-data fields.” |
| F-1-12 — impossible clipboard recovery | Fixed: a labelled selectable command is present and named by the error. |
| F-1-13 — offline “saved shell” jargon | Fixed: the notice names the page and sample data. |
| F-1-14 — 23-word deploy sentence | Fixed: it remains split into 11- and 8-word sentences. |
| F-1-15 — “release-ready” adjective | Fixed: README gives the exact locked package check. |
| F-1-16 — 404 metaphors | Fixed: live 404 says “Page not found” and “Return home.” |
| F-2-1 — missing MSRV provisioning | Fixed: the exact claim installed the absent toolchain and passed first-run. |
| F-2-2 — missing build-artifact claims | Fixed: `build-artifacts` passed and found both outputs. |
| F-2-3 — missing deployed-route claims | Fixed: `deployed-routes` passed; live routes returned the expected status. |
| F-2-4 — unlisted shipped-example equivalence | Fixed: `shipped-sample` passed against both example files. |
| F-2-5 — landing internal terms | Fixed at every cited landing location. F-3-1 is a new cross-surface truth mismatch. |
| F-2-6 — README jargon | Fixed at every cited README location. |
| F-2-7 — three names for loopback | Fixed: the first screen introduces loopback with `127.0.0.1`; rule copy uses loopback consistently. |
| F-2-8 — internal registry sentence | Fixed: the sentence is absent. |

No earlier finding remains unfixed under its original acceptance criterion.

## 6. Structure, accessibility, links, and quality gates

- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown path returns
  the designed document with HTTP 404.
- Each route has `lang="en"`, one h1, one main, a route-correct title,
  description, canonical, Open Graph and Twitter metadata, favicon, and
  apple-touch icon. Titles follow the required pattern and remain under 60
  characters.
- Header/footer chrome is consistent, including Privacy, Terms, builder, and
  build id. The 404 has a clear home action.
- Live push navigation, browser back, route focus, and cross-route `/#how`
  focus all pass.
- All ordinary internal, source, and builder links return 200. The privacy
  `mailto:` is explicitly exempt. The missing page's skip fragment retains the
  expected 404 status because it targets the current 404 document.
- Live routes log no script or page errors. The deliberate missing URL produces
  only Chromium's expected failed-resource message for its HTTP 404 response.
- The supplied URL verifier passed. Live Axe scans found zero serious or
  critical issues on the landing, demo, privacy, terms, and 404 pages.
- The page has no 390 px overflow, keeps 44 px controls, supports 200% reflow,
  and respects reduced motion. F-3-2 is the remaining identity implementation
  defect.
- The visual composition is otherwise distinct: an offset instrument grid,
  product-specific cyan/amber boundary art, clipped controls, and a dark glass
  workbench rather than a generic SaaS template.
- Clean-clone gates pass: `npm test` (4 Rust + 30 Playwright), typecheck,
  Clippy, formatting, production build, and locked package verification.
  Production JS is 13.89 kB (5.05 kB gzip).

## 7. Missed leverage

No additional feature finding. The brief implies capture, selected secret
removal, export, and local replay; all are implemented. Import is unnecessary
because the CLI records HTTP directly, and cloud sync would conflict with the
local incident workflow. An AI step would add a new privacy boundary without
an obvious user benefit. No AI provider key or decorative AI feature exists.

## What would make this perfect

Make the terminal proof come from the shipped binary and cover that equivalence
with the existing demo claim test. Correct the IBM Plex Mono family so the
declared body face actually loads, and add a resource/font regression. Then
rerun every declared claim, the temp-directory CLI demo, cold mobile/desktop
read, demo storage/request audit, history replay, route crawl, accessibility
scan, and full build gates. A passing review requires both findings to be gone.
