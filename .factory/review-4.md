# Adversarial first-read review 4 — PASS

- **Reviewed:** 2026-08-29 UTC
- **Candidate:** `a2a72e5cbcf943dcb895472d850b5453b9295363`
- **Live URL:** https://incident-boundary-replay.sociobot.in
- **Clean clone:** `/tmp/ibr-review4-clean.BnyXKZ/repo`

## Verdict

**PASS.** There are zero findings, no untested public claims, and no regressed
finding from reviews 1–3. The cold first screen, one-click browser demo, CLI
demo, sandbox isolation, all 19 declared claim commands, route behavior,
accessibility checks, link crawl, and build gates pass. The deployed HTML,
service worker, JavaScript, and CSS match the clean production build byte for
byte.

## 1. Cold first read

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900 before any
scrolling.

- **What it does:** records failed HTTP requests, removes selected secrets,
  and replays the result on localhost.
- **For whom:** backend engineers reproducing failed queue, webhook, and
  third-party requests.
- **What to click first:** **Try it with sample data**.

All three answers and the three product facts are visible in both first
screens. At 390 px, the action ends at y=571 and the facts end at y=804. At
desktop, they end at y=537 and y=658. Neither viewport has horizontal overflow.

Evidence: `/tmp/ibr-review4-cold-mobile.png` and
`/tmp/ibr-review4-cold-desktop.png`.

## 2. Copy audit

Method: whitespace-separated words. Code blocks are executable examples and
are excluded from README sentence counts. Headings, labels, actions,
conditional status/error text, image alt text, and terminal transcript lines
are included. Every sentence is at most 22 words. No jargon, banned marketing
adjective, inconsistent term, mood heading, empty slogan, or non-result action
needs a flag.

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
| CLI output from boundary-replay demo | 5 | Pass |
| Remove selected secrets before export. | 5 | Pass |
| boundary-replay demo | 2 | Pass |
| Demo — isolated sample data; no existing captures were read or changed. | 12 | Pass |
| Scrubbed four secret or personal-data fields before disk. | 8 | Pass |
| Bundle: /tmp/boundary-replay-demo-0ad0e8a4/payment-failure.bundle | 2 | Pass: command output |
| Run: boundary-replay serve --bundle /tmp/boundary-replay-demo-0ad0e8a4/payment-failure.bundle --listen 127.0.0.1:9487 | 7 | Pass: command output |
| A captured terminal transcript from the shipped demo command. | 9 | Pass: image alt |
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
| Boundary Replay — replay HTTP failures on localhost | 8 | Pass: route announcement |

The embedded SVG repeats the same command and four transcript lines. Its
accessible name is supplied by the nine-word HTML image alt above; the SVG's
internal title and description do not replace or add visible landing copy.

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

Terminology remains consistent: `record` is the user action, `capture` is the
CLI command, selected values are `secrets`, the enforced network restriction
is `loopback`, the mock runs on `localhost`, the browser sample is the `demo`,
and the runnable export is a `localhost mock`.

## 3. Demo and sandbox

**PASS.** The first-screen action opens `/demo` in one click. The first mobile
demo viewport already shows the persistent banner, sample trace, payment
failure, `POST /webhooks/payment`, and the start of the captured request. The
same initial screen identifies the removed secrets and 503 localhost response
without setup.

- Banner: **Demo — sample data, nothing is saved**, with **Reset demo** and
  **Start for real**.
- **Inspect capture** changes the result; **Reset demo** restores the initial
  bundle result and returns focus to the demo h1.
- Export downloads one sample with four `[REDACTED]` values and a recorded 503.
- The only demo state is
  `sessionStorage["demo:incident-boundary-replay:state"]`. Seeded local- and
  session-storage real-data sentinels remain unchanged.
- **Start for real** removes only the demo key and returns to `/`.
- The complete landing and demo flow makes same-origin requests only. Offline
  reload retains the sample after the first visit.
- The release CLI demo ran in empty temporary directory
  `/tmp/ibr-review4-cli-cwd.PnHHGr`, left it empty, and wrote its sample to a
  separate `/tmp/boundary-replay-demo-*` folder as stated.

Evidence: `/tmp/ibr-review4-demo-mobile.png`,
`/tmp/ibr-review4-live.json`, and the claim logs below.

## 4. Claims

Every exact `test` command in `.factory/claims.json` ran independently on its
first attempt in the clean clone. Each id has exactly one tagged test. All
public capability, privacy, routing, build, and sample-equivalence statements
on the landing page and README map to these entries; there is no unlisted or
untested claim.

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

Summary: `/tmp/ibr-review4-claims-summary.tsv`. Individual logs:
`/tmp/ibr-review4-claim-<id>.log`.

## 5. History replay

Every earlier review, polish report, and handoff was read. Each finding was
checked in current source, the clean test suite, and the byte-identical live
deployment rather than accepted from its repair note.

| Earlier finding | Current verification |
|---|---|
| F-1-1 — false Rust 1.85 minimum | Fixed: README and Cargo metadata say 1.88; the exact clean MSRV claim passes. |
| F-1-2 — unbounded “safe” claim | Fixed: the cited landing, alt, and README copy contains no unbounded safety adjective. |
| F-1-3 — incomplete default-demo claim | Fixed: the test checks the temp folder, printed command, running mock, response, and both landing transcripts. |
| F-1-4 — stale route social metadata | Fixed live on demo, privacy, terms, and 404. |
| F-1-5 — inconsistent 404 chrome | Fixed: header, nav, footer, one-liner, version, and build id match. |
| F-1-6 — contrast-copy audience sentence | Fixed: the first screen names backend engineers and three failure types. |
| F-1-7 — mood preview label | Fixed: it names the localhost-mock result. |
| F-1-8 — slogan preview heading | Fixed: it names selected-secret removal before export. |
| F-1-9 — metaphorical workflow label | Fixed: it names capture, secret removal, and replay. |
| F-1-10 — product-lore limits label | Fixed: it names what the product will not do. |
| F-1-11 — `PII field(s)` placeholder | Fixed: landing and CLI use the same plain transcript wording. |
| F-1-12 — impossible clipboard recovery | Fixed: a labelled selectable command exists and the error names it. |
| F-1-13 — offline “saved shell” jargon | Fixed: the notice names the page and sample data. |
| F-1-14 — 23-word deploy sentence | Fixed: the two behaviors remain separate sentences. |
| F-1-15 — “release-ready” adjective | Fixed: README gives the exact locked package command. |
| F-1-16 — 404 metaphors | Fixed: live 404 says “Page not found” and “Return home.” |
| F-2-1 — clean MSRV test failure | Fixed: the exact claim self-provisions Rust 1.88 when needed and passes. |
| F-2-2 — unlisted build artifacts | Fixed: `build-artifacts` passes for both outputs. |
| F-2-3 — unlisted deployed routes | Fixed: `deployed-routes` passes direct routes and a real HTTP 404. |
| F-2-4 — unlisted shipped-example equivalence | Fixed: `shipped-sample` compares both demos with both example files. |
| F-2-5 — landing internal terms | Fixed at every cited location. |
| F-2-6 — README internal terms | Fixed at every cited location. |
| F-2-7 — three terms for loopback | Fixed: the first screen defines the address rule and rule copy uses `loopback`. |
| F-2-8 — internal publishing sentence | Fixed: the sentence is absent. |
| F-3-1 — invented CLI recording | Fixed: fresh release stdout matches HTML and SVG after normalizing only the random temp id. |
| F-3-2 — missing IBM Plex Mono | Fixed: the family loads on landing and 404, and both live routes request the self-hosted WOFF2. |

No earlier finding is unfixed, half-fixed, or regressed.

## 6. Structure, accessibility, links, and quality gates

- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown URL returns the
  designed page with HTTP 404.
- Every route has `lang="en"`, one h1, one main, route-correct title,
  description, canonical, Open Graph and Twitter metadata, SVG favicon, and
  180 px apple-touch icon. The Open Graph image is a real 1200 × 630 asset.
- Titles follow the required route pattern and stay under 60 characters.
- Header/footer chrome is consistent. Privacy, Terms, builder, version, and
  build id are present. The 404 has a clear home action.
- Push navigation, browser back, route focus, the live announcer, and
  cross-route `/#how` focus pass in the full browser suite.
- All crawled internal, source, and builder links return 200; `mailto:` is the
  explicit exception. `robots.txt` and `sitemap.xml` return 200 and list all
  public routes.
- Live successful routes have no console or page errors. The missing route has
  only Chromium's expected failed-resource message for its deliberate 404.
- Axe reports zero violations at 390 px on landing, demo, privacy, terms, and
  the real 404. The supplied URL verifier passes. Keyboard, focus, 44 px touch
  targets, 200% reflow, reduced motion, alt text, and contrast checks pass.
- The identity is distinct: offset dark instrument layout, cyan request paths,
  amber secret-removal panes, clipped controls, product-specific generated
  art, and self-hosted product fonts. It is not a generic SaaS template.
- Full clean suite: 31 Playwright tests and 4 Rust tests pass. TypeScript,
  Clippy, formatting, production build, and locked package verification pass.
- Production JavaScript is 13,980 bytes and 5,090 bytes gzip, below the budget.
  Production CSS is 3,777 bytes gzip.
- Live/local SHA-256 values match for `index.html`, `404.html`, `sw.js`, the
  main JavaScript, and the main CSS.

## 7. Missed leverage

No finding. The brief calls for capture, configured secret removal, export,
and local replay; all four are complete. The shipped examples already provide
the useful import path for the demo, while cloud sync would conflict with the
local incident workflow. An AI step would add an unnecessary data boundary and
does not improve the stated job. There is no decorative AI feature or embedded
provider key.

## What would make this perfect

Nothing remains to change for the reviewed scope. Preserve the current claim
suite, isolated demo contract, plain terminology, and byte-for-byte deployment
verification in future releases.
