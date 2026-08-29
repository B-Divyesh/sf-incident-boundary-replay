# Adversarial first-read review 1 — FAIL

**Reviewed:** 2026-08-29  
**Candidate:** `53b006e2df9be03d187fe849ccecb17b3f32547b`  
**Live URL:** https://incident-boundary-replay.sociobot.in  
**Clean clone:** `/tmp/ibr-review1-clean.Qule2P`

## Verdict

**FAIL.** The cold first screen, one-click demo, declared claim suite, privacy
boundary, main routes, and build all pass. The advertised Rust 1.85 minimum is
false in a clean locked build. The page also makes an unbounded safety claim
that is not in the claims inventory. There are 16 findings in total, so this
round cannot pass.

## 1. Cold first read

Tested in fresh contexts at 390 × 844 and 1440 × 900 before scrolling.

- **What it does:** captures a failed HTTP exchange, removes selected secrets,
  and turns the exchange into a localhost mock.
- **For whom:** backend engineers debugging failed integrations and webhooks.
- **First action:** **Try it with sample data**.

All three answers are visible on the first screen at both sizes. At 390 px,
the action ends at y=591 and all three facts end at y=797. At desktop, the
action ends at y=661 and the facts end at y=757. This gate passes, subject to
the unsupported word “safely” in finding F-1-2.

Evidence: `/tmp/live-cold-mobile.png` and `/tmp/live-cold-desktop.png`.

## Findings

### F-1-1 — BLOCKING — the stated Rust 1.85 minimum does not build

**Quote/location:** README, Install: “Build the single binary with Rust 1.85
or newer.”

**Evidence:** in the clean clone, `cargo +1.85.0 build --locked` exits 101.
`icu_collections`, `icu_locale_core`, `icu_normalizer`, `icu_properties`, and
`icu_provider` require Rust 1.88; `idna_adapter` requires Rust 1.86. There is no
`rust-version` in `Cargo.toml` and no `claims.json` entry for the minimum
supported Rust version.

**Why this fails:** a first-time user following the only install prerequisite
cannot build the product with the promised toolchain.

**Concrete fix:** either pin dependencies that compile on Rust 1.85, or set
`rust-version = "1.88"` and change the README to “Build with Rust 1.88 or
newer.” Add an `msrv-build` claim whose clean test runs the locked build with
that exact minimum toolchain.

### F-1-2 — High — “safe” is an unlisted, unbounded claim

**Quotes/locations:** landing h1, “Replay them safely on localhost”; landing
image alt, “emerge as safe local fixtures”; README heading, “Try the safe
demo.”

**Why this fails:** the declared tests prove specific controls such as
redaction and loopback-only replay. They cannot prove the universal adjective
“safe,” and no claim entry defines it. A visitor could read “safe” as protection
against incomplete redaction, malicious fixtures, or all production impact.

**Concrete fix:** use “Capture HTTP failures. Replay them on localhost.” Rename
the README section “Run the sample demo.” Change the alt text to “Cyan request
paths cross an amber redaction layer toward a local mock.” Keep the specific,
tested safeguards as the proof.

### F-1-3 — High — the default CLI demo promise is not fully inventoried or tested

**Quote/location:** README, Try the safe demo: “The command creates a new
temporary folder, records a realistic failed payment webhook, redacts its
secrets, exports a bundle, and prints the mock command.”

**Why this fails:** this is also 24 words. Existing claims test an explicit
`--out` directory, JSON output, isolation, and exported data. No claim test
asserts that the default command creates a new temporary folder and prints a
usable human-readable mock command. A manual run succeeded once, but the
claims contract requires an inventoried regression.

**Concrete fix:** split and test it: “The demo creates a temporary folder with
a scrubbed failed-payment fixture. It prints the command that starts the local
mock.” Add one claim test that runs `boundary-replay demo` without `--out`,
parses the printed folder and command, confirms both work, and removes the temp
folder.

### F-1-4 — Medium — deep routes publish landing-page social metadata

**Location:** `/demo`, `/privacy`, and `/terms` after client navigation or a
direct deep link.

**Evidence:** `document.title`, description, and canonical update correctly,
but `og:title`, `og:description`, `twitter:title`, and
`twitter:description` remain the landing values. The standalone 404 document
has no Open Graph or Twitter metadata.

**Why this fails:** shared privacy or demo links are described as the landing
page, and the 404 route does not meet the metadata checklist.

**Concrete fix:** update all Open Graph and Twitter fields with the route
metadata in `render()`. Add equivalent metadata to `404.html` and a route test
for the rendered values.

### F-1-5 — Medium — the real 404 uses a different header and footer

**Quote/location:** missing-route response in `site/public/404.html`.

**Evidence:** the product routes use the `BR` mark, include **How it works**,
use “Capture a scrubbed boundary. Replay it locally.”, and show
`v0.1.0 · build 2026.08.28`. The real 404 uses `B>_`, omits **How it works**,
uses a different one-liner, and shows only `Built by Param Factory · v0.1.0`.

**Why this fails:** the site-structure contract requires a consistent header
and footer on every route. The not-found page appears to be an older product
version.

**Concrete fix:** generate the 404 header/footer from the same source or keep a
snapshot test that compares their wordmark, nav links, one-liner, builder link,
version, and build id.

### F-1-6 — Minor — the audience sentence uses contrast copy instead of the situation

**Quote/location:** landing first screen: “For backend engineers who need the
failed boundary, not another trace.”

**Why this fails:** “failed boundary” is product jargon, and “not another
trace” is a slogan-like contrast. It does not name the queue, webhook, or
third-party failure the reader is trying to reproduce.

**Concrete fix:** “For backend engineers reproducing failed queue, webhook,
and third-party requests.”

### F-1-7 — Minor — “One failure, isolated” is a mood heading

**Quote/location:** landing preview section index: “One failure, isolated.”

**Why this fails:** it does not say what the section contains when heard in a
heading list.

**Concrete fix:** “A captured failure becomes a local fixture.”

### F-1-8 — Minor — “Keep the boundary. Drop the secrets.” is a slogan

**Quote/location:** landing preview h2.

**Why this fails:** “keep” and “drop” are metaphors here. The heading does not
name the actual operation.

**Concrete fix:** “Scrub the exchange before export.”

### F-1-9 — Minor — “A short path back to the bug” is metaphorical

**Quote/location:** landing workflow section index.

**Why this fails:** it would fit many debugging tools and does not identify the
three operations in this section.

**Concrete fix:** “Capture, scrub, and replay an HTTP failure.”

### F-1-10 — Minor — “The safety boundary” is not a useful section name

**Quote/location:** landing limits section index.

**Why this fails:** the phrase is product lore when read without the following
h2. It does not tell the visitor that the section lists prohibited behavior.

**Concrete fix:** “What Boundary Replay will not do.”

### F-1-11 — Minor — terminal copy uses an awkward placeholder and jargon

**Quote/location:** landing terminal: “Scrubbed 4 secret or PII field(s) before
disk.”

**Why this fails:** “PII” is unnecessary jargon and “field(s)” reads like an
unresolved template.

**Concrete fix:** “Scrubbed four secret or personal-data fields before disk.”

### F-1-12 — Minor — the clipboard error asks for an impossible recovery

**Quote/location:** landing copy action: “Copy failed. Select the command
above.”

**Evidence:** there is no visible or selectable command above the error; only
the **Copy install command** button is shown.

**Why this fails:** the error tells the visitor to take an action the page does
not support.

**Concrete fix:** render the command in a labelled, selectable code field.
Then say, “Copy failed. Select the install command shown above.”

### F-1-13 — Minor — the offline notice uses implementation jargon

**Quote/location:** landing/demo network notice: “Offline — the saved shell
remains available.”

**Why this fails:** “shell” does not tell a visitor whether the sample data and
actions still work.

**Concrete fix:** “Offline — this page and its sample data remain available.”

### F-1-14 — Minor — the deploy sentence exceeds the 22-word cap

**Quote/location:** README, Deploy: “The Static Web Apps route rules preserve
`/demo`, `/privacy`, and `/terms` on direct loads while unknown URLs return the
designed HTTP 404 page.” (23 words)

**Why this fails:** it combines deep-link and missing-route behavior.

**Concrete fix:** “Static Web Apps preserves `/demo`, `/privacy`, and `/terms`
on direct loads. Unknown URLs return the designed HTTP 404 page.”

### F-1-15 — Minor — “release-ready” is an unsupported marketing adjective

**Quote/location:** README, Install: “The release-ready archive can be checked
with `cargo package --allow-dirty`.”

**Why this fails:** the command checks packaging; it does not establish that an
archive is ready for release.

**Concrete fix:** “Check the package archive with `cargo package
--allow-dirty --locked`.”

### F-1-16 — Minor — the 404 headline and recovery text use boundary metaphors

**Quotes/location:** real 404: “This route crossed the wrong boundary” and
“Return to the capture path.”

**Why this fails:** neither phrase names the error or recovery in plain words.

**Concrete fix:** use h1 “Page not found,” sentence “This address does not
match a Boundary Replay page,” and action “Return home.”

## 2. Copy audit

Method: whitespace-separated words. The landing audit includes headings,
labels, actions, status/error text, and alt text because each is read as a
standalone unit. README code blocks are executable examples rather than
sentences, so they are excluded; every heading and prose sentence is included.

### Landing page

| Copy | Words | Result |
|---|---:|---|
| Incident boundary capture | 3 | Pass |
| Capture failures. | 2 | Pass |
| Replay them safely on localhost. | 5 | F-1-2 |
| For backend engineers who need the failed boundary, not another trace. | 11 | F-1-6 |
| Try it with sample data | 5 | Pass: result-naming action |
| See a scrubbed failed webhook and its local response. | 9 | Pass |
| Redacts before disk | 3 | Pass |
| Replays only on localhost | 4 | Pass |
| Free local exporter | 3 | Pass |
| Request paths cross a glass redaction boundary and emerge as safe local fixtures. | 13 | F-1-2 |
| Production edge | 2 | Pass |
| Scrub | 1 | Pass |
| Local mock | 2 | Pass |
| One failure, isolated | 3 | F-1-7 |
| Real CLI output | 3 | Pass |
| Keep the boundary. | 3 | F-1-8 |
| Drop the secrets. | 3 | F-1-8 |
| Demo — isolated sample data; no existing captures were read or changed. | 12 | Pass |
| Scrubbed 4 secret or PII field(s) before disk. | 8 | F-1-11 |
| Bundle: /tmp/.../payment-failure.bundle | 2 | Pass |
| Run: boundary-replay serve --bundle … --listen 127.0.0.1:9487 | 7 | Pass |
| A terminal recording shows the demo command capturing, scrubbing, and exporting one fixture. | 13 | Pass |
| Copy install command | 3 | Pass: result-naming action |
| View source | 2 | Pass: result-naming action |
| A short path back to the bug | 7 | F-1-9 |
| How the boundary becomes a fixture | 6 | Pass |
| Capture | 1 | Pass |
| Opt in one client | 4 | Pass |
| Point that client at the sidecar to capture its boundary. | 10 | Pass for the named backend audience |
| Scrub | 1 | Pass |
| Replace selected values | 3 | Pass |
| Headers and JSON fields are replaced in memory before any write. | 11 | Pass |
| Replay | 1 | Pass |
| Run the local mock | 4 | Pass |
| Match the recorded method and path. | 6 | Pass |
| Return the failed response locally. | 5 | Pass |
| The safety boundary | 3 | F-1-10 |
| Production replay is not a feature | 6 | Pass |
| Capture starts only when you run the sidecar. | 8 | Pass |
| Mock servers and webhook sends refuse non-local targets. | 8 | Pass |
| New mock signatures use a secret from your environment. | 9 | Pass |
| Copied. | 1 | Pass |
| Copy failed. | 2 | F-1-12 |
| Select the command above. | 4 | F-1-12 |
| Offline — the saved shell remains available | 7 | F-1-13 |
| Capture a scrubbed boundary. | 4 | Pass |
| Replay it locally. | 3 | Pass |

No landing unit exceeds 22 words. No button uses a generic label such as
“Submit,” “Go,” or “Continue.”

### README

| Copy | Words | Result |
|---|---:|---|
| Boundary Replay | 2 | Pass |
| Capture an opted-in HTTP boundary, scrub secrets before disk, and export a local mock bundle. | 15 | Pass |
| It is for backend engineers reproducing queue, webhook, and third-party failures without calling the original system. | 16 | Pass |
| Boundary Replay sends no telemetry during its local demo flow. | 10 | Pass |
| Captures and bundles are written only under output folders you name. | 11 | Pass |
| Replay and webhook send commands accept loopback targets only and never follow redirects. | 13 | Pass |
| Install | 1 | Pass |
| Build the single binary with Rust 1.85 or newer: | 9 | F-1-1 |
| The release-ready archive can be checked with cargo package --allow-dirty. | 10 | F-1-15 |
| The factory owns registry publishing. | 5 | Pass |
| Try the safe demo | 4 | F-1-2 |
| The command creates a new temporary folder, records a realistic failed payment webhook, redacts its secrets, exports a bundle, and prints the mock command. | 24 | F-1-3 |
| With --out, it accepts only a new or empty folder. | 10 | Pass |
| It never reads or changes an existing capture folder. | 9 | Pass |
| The same sample is in examples/. | 6 | Pass |
| The browser walkthrough is available at /demo or https://incident-boundary-replay.sociobot.in/demo. | 9 | Pass |
| Capture a boundary | 3 | Pass for the named backend audience |
| Start the sidecar and name each upstream host explicitly: | 9 | Pass |
| Point the opted-in client at http://127.0.0.1:8787. | 6 | Pass |
| The sidecar forwards each request, replaces selected headers and JSON fields in memory, then writes the scrubbed exchange. | 18 | Pass |
| Raw bodies never reach the capture folder. | 7 | Pass |
| Example policy: | 2 | Pass |
| Export and run a mock | 5 | Pass |
| export --out accepts a new or empty folder only. | 9 | Pass |
| It refuses a populated folder before changing any file. | 9 | Pass |
| The local server matches method and path, then returns the recorded status, headers, and body. | 15 | Pass |
| It refuses non-loopback bind addresses. | 5 | Pass |
| Send a signed webhook to a local service | 8 | Pass |
| send removes captured signature headers and signs the scrubbed body with HMAC-SHA256. | 12 | Pass |
| It refuses non-loopback targets and returns redirects without following them, so a bundle cannot replay into a production host. | 19 | Pass |
| Script output | 2 | Pass |
| Add --json to demo, export, and send for machine-readable results. | 10 | Pass |
| Errors use a non-zero exit code and go to stderr. | 10 | Pass |
| Develop and verify | 3 | Pass |
| npm run build compiles the site to dist/site. | 8 | Pass |
| It also builds the Rust release binary. | 7 | Pass |
| Site source is under site/; browser tests use Playwright 1.58.2 and the shipped demo data. | 15 | Pass |
| Deploy | 1 | Pass |
| Deploy dist/site as the static root. | 6 | Pass |
| The Static Web Apps route rules preserve /demo, /privacy, and /terms on direct loads while unknown URLs return the designed HTTP 404 page. | 23 | F-1-14 |
| License | 1 | Pass |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

Terminology is otherwise consistent: an `exchange` is one request/response, a
`fixture` is one replay match, a `bundle` contains fixtures, a `sidecar`
captures traffic, and the browser sample is the `demo`.

## 3. Demo and sandbox

**PASS.** One click from the first screen opens `/demo`. At 390 px, the first
demo viewport already shows the persistent banner, a real-looking
`payment.failed` webhook, `POST /webhooks/payment`, and the start of its
captured lane. The full workbench shows four named redactions and a recorded
503 response.

- The banner says “Demo — sample data, nothing is saved” and includes **Reset
  demo** and **Start for real**.
- **Inspect capture** changes the output; **Reset demo** restores the initial
  bundle message.
- The banner remains sticky at y=0 after scrolling to the bottom.
- A seeded `real:sentinel=keep-me` local-storage value remains unchanged.
- **Start for real** removes `demo:incident-boundary-replay:state` and preserves
  the real sentinel.
- Live request logging recorded same-origin assets only.
- The CLI demo ran from `/tmp` and produced one fixture in a new temporary
  folder.

Evidence: `/tmp/live-demo-mobile.png`, `/tmp/live-demo-desktop.png`, and the
interaction output from `/tmp/live-interaction.mjs`.

## 4. Claims

Every exact `test` command in `.factory/claims.json` was run independently in
the clean clone after `npm ci`. Each id occurs in exactly one tagged test.

| Claim id | Result |
|---|---|
| `redact-before-disk` | PASS — 1 test |
| `local-only-replay` | PASS — 1 test |
| `runnable-local-mock` | PASS — 1 test |
| `signed-local-webhook` | PASS — 1 test |
| `private-demo` | PASS — 1 test |
| `cli-demo-isolation` | PASS — 1 test |
| `telemetry-free` | PASS — 1 test |
| `chosen-output-paths` | PASS — 1 test |
| `empty-output-folders` | PASS — 1 test |
| `cli-json-and-errors` | PASS — 1 test |
| `capture-opt-in` | PASS — 1 test |
| `offline-demo` | PASS — 1 test |
| `sample-export` | PASS — 1 test |
| `free-local-exporter` | PASS — 1 test |

Logs: `/tmp/ibr-review1-claim-logs/`. Findings F-1-1 through F-1-3 cover the
public promises that remain false, unlisted, or incompletely inventoried.

## 5. History replay

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists. I read all
four verification reports and the complete handoff, then rechecked their prior
findings on the live site and in the current code.

| Earlier finding | Current result |
|---|---|
| First action/facts below the desktop fold | Fixed; both fit at 1440 × 900 and 1366 × 768. |
| Redirects bypass local-only capture/send | Fixed; code disables redirects and the all-status claim test passes. |
| CLI demo reads or overwrites existing data | Fixed; isolation claim passes. |
| Demo banner scrolls away; exit retains demo state | Fixed; live sticky/exit checks pass. |
| Dead paid checkout | Fixed honestly by removing the unavailable offer; the handoff records the deviation. |
| Touch targets, 200% reflow, and small mobile copy | Fixed; current browser suite and live 390 px inspection pass. |
| Missing claims for output paths, errors, sidecar opt-in, and telemetry | Fixed by four claim entries and passing tests. |
| Missing URLs return HTTP 200 | Fixed; `/made-up-route` returns HTTP 404 with the designed document. |
| Mobile visible label/accessibility mismatch | Fixed; visible `BR Boundary Replay` is in the accessible name. |
| Normal export accepts a populated destination | Fixed; claim and Rust regression pass. |
| Cross-route How it works navigation/focus | Fixed in code and the browser suite. |
| Install action lacks acquisition path | Fixed; clone-ready command and source link are present. |
| Hero lacks a responsive source | Fixed with the 640 px source. |
| Standalone TypeScript check fails | Fixed; `npm run typecheck` passes. |

None of those earlier finding ids has regressed. F-1-1 through F-1-16 are new
findings from this from-scratch round.

## 6. Structure, accessibility, and build

- Routes `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route
  returns a designed HTTP 404.
- Each live route has one h1, one main landmark, `lang="en"`, a route-specific
  title, description, and client-updated canonical.
- Direct links, address-bar deep links, back navigation, route focus, and
  cross-route hash navigation pass the browser suite. All crawled internal,
  GitHub, and Sociobot links returned 200; `mailto:` was excluded.
- No console or page errors appeared on the cold landing/demo runs.
- Keyboard, 390 px layout, 200% reflow, reduced motion, image alt text, and
  serious/critical Axe checks pass the browser suite.
- The visual identity is distinct: dark instrument glass, cyan request paths,
  amber redaction panes, clipped controls, and an offset grid match
  `.factory/design.md`. It is not a generic centered SaaS template.
- The only structure failures are F-1-4, F-1-5, and F-1-16.

Clean-clone verification:

- `npm ci`: PASS, zero audit vulnerabilities.
- All 14 exact claim commands: PASS.
- `npm test`: PASS — 4 Rust tests and 23 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/site` and the release binary exist.
- Built JS: 12.98 kB, 4.97 kB gzip; below the static-product budget.
- Live/local asset identity: JS SHA-256
  `506693bc32264042853e7544bf2c5f282487449e0f7483eb98af680dec266f0a`;
  CSS SHA-256
  `ee9dac8d69addf762c434d25417adb14f073ee2f908162a3e46984f95a8aee3f`.

## 7. Missed leverage

No finding. The brief requires capture, scrubbing, export, and local replay;
all four exist. Import or cloud sync is not implied by the local-first job, and
an AI step would be decorative unless the scope expands to redaction-policy
drafting. No provider key or AI call is embedded.

## What would make this perfect

There is still work to do. Make the locked dependency graph honor a declared
and tested minimum Rust version; remove the unbounded safety language; add a
claim for the complete default demo behavior; replace every flagged slogan,
metaphor, jargon phrase, long sentence, and unusable clipboard recovery; make
route social metadata accurate; and make the real 404 reuse the standard
header/footer. Then rerun the entire cold-read, copy, claim, sandbox, history,
routing, accessibility, and link checklist from a clean clone. A passing round
requires zero remaining findings.
