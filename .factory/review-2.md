# Adversarial first-read review 2 — FAIL

- **Reviewed:** 2026-08-29
- **Candidate:** `1469113ec5fd449cbca58bc3ea8da78c6878651b`
- **Live URL:** https://incident-boundary-replay.sociobot.in
- **Clean clone:** `/tmp/ibr-review2-clean.IPyHrt`

## Verdict

**FAIL.** The first screen, one-click demo, sandbox, live routes, accessibility,
and product behavior are usable. The declared claim suite does not pass on its
first run in the clean worker, three README promises are absent from the claim
inventory, and several copy units still use undefined internal terms. There
are eight findings: one blocking, two high, one medium, and four minor.

## 1. Cold first read

Tested before scrolling in fresh Chromium contexts at 390 × 844 and
1440 × 900.

- **What it does:** records an HTTP failure, removes selected secrets, and
  replays the result on localhost.
- **For whom:** backend engineers reproducing queue, webhook, and third-party
  failures.
- **What to click first:** **Try it with sample data**.

All three answers are visible on both first screens. On mobile, the action ends
at y=621 and the final fact ends at y=828 in an 844 px viewport. On desktop,
the action ends at y=586 and all facts end at y=682 in a 900 px viewport.
This gate passes. Evidence: `/tmp/ibr-review2-cold-mobile.png` and
`/tmp/ibr-review2-cold-desktop.png`.

## Findings

### F-2-1 — BLOCKING — the claim suite fails in the clean verifier environment

**Quote/location:** `.factory/claims.json`, `msrv-build`; README, “Build the
single binary with Rust 1.88 or newer”; `tests/product.spec.ts:135-139`.

**Evidence:** the exact declared command
`npm test -- --grep @claim:msrv-build` failed on its first run in the clean
clone. The test invokes `rustup run 1.88.0 cargo build --locked`, but the worker
started with supported Rust 1.98 and did not have the exact 1.88.0 toolchain
installed. The command exited non-zero with “toolchain
‘1.88.0-x86_64-unknown-linux-gnu’ is not installed.” The full `npm test`
therefore reported 26 passed and 1 failed.

Installing 1.88.0 manually and rerunning proved the package itself builds with
that version; the isolated claim and full suite then passed. That does not
erase the required clean-sandbox failure: the listed command is not
self-provisioning and gives a verifier no prerequisite command.

**Why this fails:** the claims contract says every listed command runs from a
fresh clone in the worker sandbox and that any failing claim test blocks the
release. A supported newer Rust installation is not enough because the test
hard-codes an unavailable older toolchain.

**Concrete fix:** provision Rust 1.88.0 in the documented verification setup
before `npm test`, or make the declared test command install/check that exact
toolchain before invoking it. Re-run the unmodified claim command in a worker
that starts without 1.88.0 and require it to pass.

### F-2-2 — High — build-output promises are missing from `claims.json`

**Quote/location:** README, Develop and verify: “`npm run build` compiles the
site to `dist/site`.” and “It also builds the Rust release binary.”

**Why this fails:** these are observable promises a maintainer relies on, but
no claim entry owns them. The build passed in this review, but an ordinary
untagged check does not satisfy the claim inventory contract.

**Concrete fix:** add a `build-artifacts` claim with the exact public wording.
Its one tagged test must run the production build from a clean tree and assert
both `dist/site/index.html` and the release executable exist.

### F-2-3 — High — deploy-route promises are missing from `claims.json`

**Quote/location:** README, Deploy: “Static Web Apps preserves `/demo`,
`/privacy`, and `/terms` on direct loads.” and “Unknown URLs return the
designed HTTP 404 page.”

**Why this fails:** these are public routing guarantees. An untagged browser
test and a successful live spot check exist, but neither sentence has a
`claims.json` entry as required.

**Concrete fix:** add a `deployed-routes` claim and one tagged test that starts
the production-equivalent server, directly loads each named route, and proves
that an unknown route returns the designed document with HTTP 404.

### F-2-4 — Medium — the shipped-example equivalence claim is unlisted

**Quote/location:** README, Run the sample demo: “The same sample is in
`examples/`.”

**Why this fails:** the current claims test the generated CLI demo and browser
sample, but none compares either one with `examples/boundary-replay.json` or
`examples/sample-payment-webhook.json`. “The same” can therefore drift without
failing a claim.

**Concrete fix:** either change the sentence to the precise file and tested
relationship, or add a `shipped-sample` claim whose tagged test compares the
event, request path, response status, and redaction fields across the CLI demo,
browser fixture, and shipped example.

### F-2-5 — Minor — landing copy still uses undefined internal terms

**Quotes/locations and rewrites:**

- Hero eyebrow, “Incident boundary capture.” Delete it; the h1 already states
  the job.
- Preview index, “A captured failure becomes a local fixture.” Use “A captured
  failure becomes a localhost mock.”
- Preview h2, “Scrub the exchange before export.” Use “Remove selected secrets
  before export.”
- Workflow h2, “How the boundary becomes a fixture.” Use “How to capture,
  remove secrets, and replay a failure.”
- Capture step, “Point that client at the sidecar to capture its boundary.” Use
  “Route one client through Boundary Replay to record its request and
  response.”
- Limits copy, “Capture starts only when you run the sidecar.” Use “Recording
  starts only when you run the capture command.”
- Footer, “Capture a scrubbed boundary. Replay it locally.” Use “Record a
  failed HTTP exchange. Replay it on localhost.”

**Why this fails:** “boundary,” “fixture,” “exchange,” and “sidecar” are not
defined on the page. The h1 proves the product can explain the job without
them, so these later phrases add translation work for a first-time visitor.

### F-2-6 — Minor — README introduces the same jargon before explaining it

**Quotes/locations and rewrites:**

- Opening, “Capture an opted-in HTTP boundary, scrub secrets before disk, and
  export a local mock bundle.” Use “Record selected HTTP requests and
  responses, remove secrets before saving, and export a localhost mock.”
- Demo, “The demo creates a temporary folder with a scrubbed failed-payment
  fixture.” Use “The demo creates a temporary folder with a failed-payment
  sample whose selected secrets are removed.”
- Heading, “Capture a boundary.” Use “Record an HTTP failure.”
- Capture instructions, “Start the sidecar and name each upstream host
  explicitly.” Use “Start Boundary Replay and name the service that receives
  the request.”
- Capture explanation, “The sidecar forwards each request, replaces selected
  headers and JSON fields in memory, then writes the scrubbed exchange.” Use
  “Boundary Replay forwards each request. It replaces selected headers and
  JSON fields before saving the request and response.”
- Capture limit, “Raw bodies never reach the capture folder.” Use “Unredacted
  request and response bodies are not saved in the capture folder.”

**Why this fails:** the README is the installation path for a new user. These
terms describe implementation architecture instead of the action and result.

### F-2-7 — Minor — one safety concept has three names

**Quotes/locations:** landing, “Replays only on localhost” and “refuse
non-local targets”; README, “accept loopback targets only,” “refuses
non-loopback bind addresses,” and “refuses non-loopback targets.”

**Why this fails:** `localhost`, `local`, and `loopback` are used for the same
restriction. The copy contract requires one word for one concept.

**Concrete fix:** introduce the exact rule once as “accepts loopback addresses
such as `127.0.0.1` only,” then use “loopback” consistently in the landing
facts, safety copy, README, and claim text.

### F-2-8 — Minor — a README sentence carries no reader-useful information

**Quote/location:** README, Install: “The factory owns registry publishing.”

**Why this fails:** “factory” is internal project vocabulary. The sentence
does not tell a user whether a published binary exists or what installation
method to use.

**Concrete fix:** delete the sentence. If no registry package exists, say
“No registry package is published; install from this repository.”

## 2. Copy audit

Method: whitespace-separated word count. Executable code blocks are excluded
because they are commands rather than sentences. Headings, labels, actions,
status/error text, and image alt text are included. No unit exceeds 22 words;
no banned marketing adjective appears. `F-2-5` through `F-2-8` mark the
remaining jargon, inconsistent term, and no-information copy.

### Landing page

| Copy | Words | Result |
|---|---:|---|
| Skip to content | 3 | Pass |
| Boundary Replay | 2 | Pass |
| Demo | 1 | Pass |
| How it works | 3 | Pass |
| Privacy | 1 | Pass |
| Incident boundary capture | 3 | F-2-5 |
| Capture HTTP failures. Replay them on localhost. | 7 | Pass |
| For backend engineers reproducing failed queue, webhook, and third-party requests. | 10 | Pass |
| Try it with sample data | 5 | Pass: result-naming action |
| See a scrubbed failed webhook and its local response. | 9 | Pass |
| Redacts before disk | 3 | Pass |
| Replays only on localhost | 4 | F-2-7 |
| Free local exporter | 3 | Pass |
| Cyan request paths cross an amber redaction layer toward a local mock. | 12 | Pass |
| Production edge | 2 | Pass |
| Scrub | 1 | Pass |
| Local mock | 2 | Pass |
| A captured failure becomes a local fixture. | 7 | F-2-5 |
| Real CLI output | 3 | Pass |
| Scrub the exchange before export. | 5 | F-2-5 |
| Demo — isolated sample data; no existing captures were read or changed. | 12 | Pass |
| Scrubbed four secret or personal-data fields before disk. | 8 | Pass |
| A terminal recording shows the demo command capturing, scrubbing, and exporting one fixture. | 13 | Pass |
| Install command | 2 | Pass |
| Copy install command | 3 | Pass: result-naming action |
| View source | 2 | Pass: result-naming action |
| Copied. | 1 | Pass |
| Copy failed. Select the install command shown above. | 8 | Pass |
| Capture, scrub, and replay an HTTP failure. | 7 | Pass |
| How the boundary becomes a fixture | 6 | F-2-5 |
| Capture | 1 | Pass |
| Opt in one client | 4 | Pass |
| Point that client at the sidecar to capture its boundary. | 10 | F-2-5 |
| Scrub | 1 | Pass |
| Replace selected values | 3 | Pass |
| Headers and JSON fields are replaced in memory before any write. | 11 | Pass |
| Replay | 1 | Pass |
| Run the local mock | 4 | Pass |
| Match the recorded method and path. | 6 | Pass |
| Return the failed response locally. | 5 | Pass |
| What Boundary Replay will not do. | 6 | Pass |
| Production replay is not a feature | 6 | Pass |
| Capture starts only when you run the sidecar. | 8 | F-2-5 |
| Mock servers and webhook sends refuse non-local targets. | 8 | F-2-7 |
| New mock signatures use a secret from your environment. | 9 | Pass |
| Offline — this page and its sample data remain available. | 10 | Pass |
| Capture a scrubbed boundary. Replay it locally. | 7 | F-2-5 |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| v0.1.0 · build 2026.08.28 | 4 | Pass |

### README

| Copy | Words | Result |
|---|---:|---|
| Boundary Replay | 2 | Pass |
| Capture an opted-in HTTP boundary, scrub secrets before disk, and export a local mock bundle. | 15 | F-2-6 |
| It is for backend engineers reproducing queue, webhook, and third-party failures without calling the original system. | 16 | Pass |
| Boundary Replay sends no telemetry during its local demo flow. | 10 | Pass |
| Captures and bundles are written only under output folders you name. | 11 | Pass |
| Replay and webhook send commands accept loopback targets only and never follow redirects. | 13 | F-2-7 |
| Install | 1 | Pass |
| Build the single binary with Rust 1.88 or newer. | 9 | F-2-1 |
| Check the package archive with cargo package --allow-dirty --locked. | 9 | Pass |
| The factory owns registry publishing. | 5 | F-2-8 |
| Run the sample demo | 4 | Pass |
| The demo creates a temporary folder with a scrubbed failed-payment fixture. | 11 | F-2-6 |
| It prints the command that starts the local mock. | 9 | Pass |
| With --out, it accepts only a new or empty folder. | 10 | Pass |
| It never reads or changes an existing capture folder. | 9 | Pass |
| The same sample is in examples/. | 6 | F-2-4 |
| The browser walkthrough is available at /demo or https://incident-boundary-replay.sociobot.in/demo. | 9 | Pass |
| Capture a boundary | 3 | F-2-6 |
| Start the sidecar and name each upstream host explicitly. | 9 | F-2-6 |
| Point the opted-in client at http://127.0.0.1:8787. | 6 | Pass |
| The sidecar forwards each request, replaces selected headers and JSON fields in memory, then writes the scrubbed exchange. | 18 | F-2-6 |
| Raw bodies never reach the capture folder. | 7 | F-2-6 |
| Example policy | 2 | Pass |
| Export and run a mock | 5 | Pass |
| export --out accepts a new or empty folder only. | 9 | Pass |
| It refuses a populated folder before changing any file. | 9 | Pass |
| The local server matches method and path, then returns the recorded status, headers, and body. | 15 | Pass |
| It refuses non-loopback bind addresses. | 5 | F-2-7 |
| Send a signed webhook to a local service | 8 | Pass |
| send removes captured signature headers and signs the scrubbed body with HMAC-SHA256. | 12 | Pass: necessary protocol term |
| It refuses non-loopback targets and returns redirects without following them, so a bundle cannot replay into a production host. | 19 | F-2-7 |
| Script output | 2 | Pass |
| Add --json to demo, export, and send for machine-readable results. | 10 | Pass |
| Errors use a non-zero exit code and go to stderr. | 10 | Pass |
| Develop and verify | 3 | Pass |
| npm run build compiles the site to dist/site. | 8 | F-2-2 |
| It also builds the Rust release binary. | 7 | F-2-2 |
| Site source is under site/; browser tests use Playwright 1.58.2 and the shipped demo data. | 15 | Pass |
| Deploy | 1 | Pass |
| Deploy dist/site as the static root. | 6 | Pass |
| Static Web Apps preserves /demo, /privacy, and /terms on direct loads. | 11 | F-2-3 |
| Unknown URLs return the designed HTTP 404 page. | 8 | F-2-3 |
| License | 1 | Pass |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

All actions use result-naming verbs. The remaining terminology inconsistency is
documented in F-2-7.

## 3. Demo and sandbox

**PASS.** One click from the first screen enters `/demo`. At 390 px, the first
viewport already shows the persistent demo banner, trace ID, payment-failure
h1, `POST`, `/webhooks/payment`, and `payment.failed`. The complete workbench
shows four named redactions and the recorded 503 response.

- Banner: “Demo — sample data, nothing is saved,” with **Reset demo** and
  **Start for real**.
- **Inspect capture** changes the result message. **Reset demo** restores the
  original bundle message and focuses the demo h1.
- The banner remains sticky at y=0 after scrolling.
- A seeded `real:sentinel=keep-me` local-storage value remains unchanged.
- Exit removes `demo:incident-boundary-replay:state` and preserves the real
  sentinel.
- The entire live request log is same-origin; no analytics, CDN, or gateway
  request occurs.
- The CLI demo was run from empty temp directory
  `/tmp/ibr-review2-cli-cwd.II4axx`. It left that directory empty and created
  its bundle under a separate `/tmp/boundary-replay-demo-*` directory.

Evidence: `/tmp/ibr-review2-demo-mobile.png` and
`/tmp/ibr-review2-live.json`.

## 4. Claims

Every exact `test` command was run independently from the clean clone. Every
claim id occurs in exactly one tagged test.

| Claim id | Result |
|---|---|
| `msrv-build` | **FAIL** on the first clean-worker run; PASS only after manual `rustup toolchain install 1.88.0 --profile minimal` — F-2-1 |
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

Complete first-run log: `/tmp/ibr-review2-claims.log`. F-2-2 through F-2-4
list the claim-like README statements that have no inventory entry. No live
landing capability sentence lacks a semantically matching claim entry.

## 5. History replay

Read `.factory/review-1.md`, `.factory/polish-1.md`, and the complete incoming
`.factory/handoff.md`. Each earlier finding was checked again on the live site
and in the current source, not accepted from the polish report.

| Earlier finding | Current verification |
|---|---|
| F-1-1 — false Rust 1.85 minimum | Fixed in product: README and `Cargo.toml` say 1.88, and a locked build passes after 1.88 is installed. F-2-1 is a new clean-verifier setup failure. |
| F-1-2 — unbounded “safe” claim | Fixed: the word is absent from the cited landing h1, alt text, and README heading. |
| F-1-3 — incomplete default-demo claim | Fixed: one tagged test parses the temporary bundle and printed mock command, starts it, and checks the 503 fixture. |
| F-1-4 — stale route social metadata | Fixed live and in code for `/demo`, `/privacy`, `/terms`, and 404. |
| F-1-5 — inconsistent 404 chrome | Fixed: live 404 header/footer text matches product routes and includes the build id. |
| F-1-6 — contrast-copy audience sentence | Fixed: the live first screen names backend engineers and queue, webhook, and third-party failures. |
| F-1-7 — mood preview index | Fixed for the original issue: it now states an outcome. Its remaining undefined noun is newly recorded in F-2-5. |
| F-1-8 — slogan preview heading | Fixed for the original issue: it now names scrubbing and export. Its remaining jargon is newly recorded in F-2-5. |
| F-1-9 — metaphorical workflow index | Fixed: it names capture, scrubbing, and replay. |
| F-1-10 — product-lore limits index | Fixed: “What Boundary Replay will not do” names the section. |
| F-1-11 — `PII field(s)` terminal text | Fixed live and in the CLI: “four secret or personal-data fields.” |
| F-1-12 — impossible clipboard recovery | Fixed in code: a labelled selectable command is shown and the error names it. |
| F-1-13 — offline “saved shell” jargon | Fixed: the live message says the page and sample data remain available. |
| F-1-14 — 23-word deploy sentence | Fixed: it is split into two sentences of 11 and 8 words. Their missing claim entries are newly recorded in F-2-3. |
| F-1-15 — “release-ready” marketing adjective | Fixed: README now names the exact package check. |
| F-1-16 — 404 metaphors | Fixed live: “Page not found,” direct explanation, and “Return home.” |

No earlier finding remains unfixed under its original acceptance criterion.

## 6. Structure, accessibility, links, and build

- `/`, `/demo`, `/privacy`, and `/terms` return 200. A missing route returns
  the designed HTTP 404 page.
- Every route has one h1, one main landmark, `lang="en"`, route-correct title,
  description, canonical, Open Graph and Twitter text, favicon, and apple-touch
  icon.
- Titles follow the required pattern: “Boundary Replay — replay failed HTTP
  boundaries,” “Demo — Boundary Replay,” “Privacy — Boundary Replay,” “Terms —
  Boundary Replay,” and “Not found — Boundary Replay.”
- Header and footer copy is consistent across all routes. Privacy and Terms
  are present. The 404 uses the same identity and recovery path.
- Back and forward navigation move focus to the route h1. Cross-route **How it
  works** navigation focuses the target section at the top of the viewport.
- All HTTP links crawled from the real routes returned 200. The privacy
  `mailto:` link was excluded as allowed. The 404 skip link is a working
  same-document fragment on the expected 404 response, not a network link.
- Live Chromium logged no page errors on product routes and no horizontal
  overflow at 390 px.
- `/opt/fleet/lib/verify-url.sh` passed. A live Axe scan at 390 px reported zero
  violations on `/`, `/demo`, `/privacy`, and `/terms`.
- The visual identity is distinct: offset dark instrument grid, cyan request
  paths, amber redaction panes, clipped controls, and product-specific art. It
  is not a centered generic SaaS template.
- Built JS is 13,756 bytes (5.06 kB gzip). Live JS and CSS hashes exactly match
  the clean build.
- `npm run build`, `npm run typecheck`, `npm run lint`, and
  `cargo fmt --all -- --check` pass. The initial `npm test` failure and the
  post-provisioning pass are both documented in F-2-1.

## 7. Missed leverage

No finding. The brief implies capture, selected redaction, export, and local
replay; all four are implemented. Cloud sync would conflict with the local
incident workflow. Sending incident contents to an AI service would add a new
privacy boundary without a necessary job benefit. No AI provider keys or
decorative AI feature are present.

## What would make this perfect

Make the declared MSRV test pass on its first run in a clean supported worker.
Inventory and tag the build-artifact, deployed-route, and shipped-example
claims. Replace the flagged internal vocabulary with the proposed request,
response, secret-removal, and localhost wording; use one term for the loopback
restriction; and remove the internal registry-publishing sentence. Then rerun
all 16 exact claim commands and the complete cold-read, demo, privacy, history,
routing, link, accessibility, and build checklist from another clean clone. A
passing review requires zero remaining findings.
