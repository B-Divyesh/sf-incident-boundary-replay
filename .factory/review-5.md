# Capture HTTP failures and replay them locally — review 5

- Reviewed: 2026-09-06 UTC
- Verdict: **FAIL**
- Findings: **1 high, 0 medium, 0 low, 0 minor**
- Untested public claims: **0**
- Implementation candidate: `8f8de77cbcae771f6e348242f951da15e9f4802d`
- Documentation baseline: `045063a858e63e8d36cc987be8489e352ea24d9a`
- Checkout baseline: `7a0ed243a74978825d5c95ab6d108f05c483619e`
- Live URL: https://incident-boundary-replay.sociobot.in
- Clean checkout: `/tmp/ibr-review5-clean.2JiBLF/repo`

## Verdict

**FAIL.** One of the 19 declared claim commands failed on its required first
run from the clean checkout. The same command passed on retry, across 20
repeats, and in the full suite. That confirms a test reliability defect rather
than a repeatable product failure. The claims contract still makes any claim
command failure a finding.

The live product, browser demo, packaged CLI, accessibility checks, and all
other claim commands passed. There are no untested public claims.

## Finding

### F-5-1 — High — the capture opt-in claim test is not reliable

The exact declared command below failed on its first run in the clean checkout:

```sh
npm test -- --grep @claim:capture-opt-in
```

Playwright reported `capture sidecar stopped with 1` at
`tests/product.spec.ts:500`. The test does not include the child process stderr
in that error, so the failed run does not explain why startup stopped.

The test releases a dynamically selected port before launching the sidecar.
This creates a time-of-check/time-of-use port race. The test then makes a
failed request to that released port before the sidecar starts.

The exact command passed on immediate retry. A diagnostic run with
`--repeat-each=20` passed 20 times, and the later full 31-test suite passed.
Independent installed-CLI checks also confirmed that capture starts only after
launch. Those later passes do not erase the required first-run failure.

Fix the test so it cannot lose its selected port, and include child stderr in
startup failures. Then run all 19 declared commands again from a clean checkout.

## First screen

Fresh Chromium contexts used 1440 × 900 and 390 × 844 viewports. Neither was
scrolled before these answers were recorded.

- Job: record failed HTTP requests, remove selected secrets, and replay the
  result on localhost.
- Audience: backend engineers reproducing queue, webhook, and third-party
  request failures.
- First action: **Try it with sample data**.

The job, audience, action, result text, and three facts were visible in both
viewports. The phone action ended at y=571, and the facts ended at y=804.
The desktop action ended at y=537, and the facts ended at y=658. Both layouts
had zero horizontal overflow.

Screenshots: `/tmp/ibr-review5-live-phone.png` and
`/tmp/ibr-review5-live-desktop.png`.

## Demo and privacy

The first-screen action opened `/demo` in one click. The first demo screen was
already populated with a `payment.failed` webhook, `POST /webhooks/payment`,
four removed values, and a recorded 503 response.

- The persistent label says **Demo — sample data, nothing is saved**.
- **Reset demo** and **Start for real** remained visible after scrolling on
  desktop and phone.
- **Inspect capture** showed four `[REDACTED]` values.
- Reset restored the initial bundle result and focused the demo heading.
- Export produced one fixture with four redactions, status 503,
  `retry-after: 30`, and the expected JSON body.
- Exit removed only `demo:incident-boundary-replay:state`.
- Seeded real local-storage and session-storage values were unchanged.
- The full landing and demo flow made no third-party request.
- A controlled service worker update left no waiting worker.
- Offline reload kept the demo, the 503 result, and the visible offline notice.

No browser action read, changed, or sent real data.

## Declared claims

Rust 1.88 and `npm ci` were installed first, as documented. All 19 exact
commands in `.factory/claims.json` then ran from the clean checkout.

| Claim | First run |
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
| `capture-opt-in` | **FAIL — F-5-1** |
| `offline-demo` | PASS |
| `sample-export` | PASS |
| `free-local-exporter` | PASS |

Each claim ID appears in exactly one tagged test. Landing, demo, privacy, and
README statements map to the inventory. No public claim is missing or untested.

## Installed CLI checks

`cargo package --locked` produced and verified the 11-file crate. The crate was
unpacked and installed into a new consumer root at
`/tmp/ibr-review5-packed-install.OGaEfb`.

- `boundary-replay --version` returned `0.1.0`.
- Main and subcommand help named required inputs and loopback restrictions.
- `demo --json` created one fixture in a new temporary folder.
- Starting the printed mock returned the recorded 503 response, headers, and
  body for `POST /webhooks/payment`.
- A wrong method or path returned an actionable 404.
- Restarting the mock from the same bundle returned the same 503 response.
- Non-loopback serve and send targets failed with exit code 1 and stderr.
- A 10 MiB plus one-byte request returned 502 with `length limit exceeded`.
- The next small request succeeded with 503 and created one capture.
- Invalid policy JSON failed with exit code 1, empty stdout, and an actionable
  parse error.
- Redirect refusal, HMAC re-signing, empty-output protection, JSON output, and
  chosen-path isolation passed their dedicated claim tests.

The product has no public backend, tenant system, account state, or remote
request allowance. Tenant isolation, backend restart persistence, health, and
429 checks are not applicable. The CLI mock is deliberately loopback-only.

## Site, accessibility, and performance

- `/`, `/demo`, `/privacy`, and `/terms` returned HTTP 200.
- A missing address returned the designed page with HTTP 404. Chromium's
  failed-resource console line is expected for that deliberate 404.
- Every route had `lang=en`, one h1, one main, ordered headings, alt text,
  route-specific title, description, canonical, Open Graph, and Twitter data.
- Privacy and terms pages were readable and linked from the shared footer.
- `robots.txt`, `sitemap.xml`, internal routes, GitHub source, and the builder
  link returned 200 after redirects.
- Axe found zero violations on every route and the 404.
- All tested phone links, buttons, and inputs were at least 44 × 44 CSS pixels.
- The 195 CSS-pixel reflow check had no horizontal overflow on any route.
- Keyboard use reached the skip link and showed a 3 px amber focus ring.
- The skip link focused main content. Cross-route `/#how` focused its section.
- Reduced motion changed the signal animation to 0.01 ms and one iteration.
- The factory URL verifier passed in 813 ms with no console error.
- Fresh mobile Lighthouse performance was 99. LCP was 1.6 s, CLS was 0.003,
  total blocking time was 0 ms, and transfer was 68 KiB.
- Built JavaScript was 13,980 bytes and 5,090 bytes gzip.
- Built CSS was 12,997 bytes and 3,777 bytes gzip.
- The mobile hero was 19,982 bytes. The desktop hero was 63,102 bytes.

## Candidate and live deployment

`8f8de77` is the last commit that changed product code, claims, tests, or
product-facing documentation. Later commits add reports, evidence, and
Graphify output only. The last report documentation baseline before this
review is `045063a`; `7a0ed24` only refreshes Graphify output.

A clean production build matched all 21 publicly served live files byte for
byte. `staticwebapp.config.json` is deployment configuration and is correctly
not public. Key SHA-256 values were:

- `index.html`: `e6c234626fd67a67678daee59d8fb5854497a359b5c5b041f700befa2b7fd9fe`
- `404.html`: `04394a1ee1a3b2d29124e227d5a57bb30a6836d6f0530f41b98988275632411c`
- `sw.js`: `80f33b9be02d18358f7584dea2ddaa8cb07e9a363932983096bf124a5701bec8`
- JavaScript: `db0ae7d79fea342970321f5dcb1478228c78cfa782dc66eec8fb09bc9f4e31d0`
- CSS: `2bcf68debf5f30dbd284a38cde6cf8d11e5eaef5b8a4f15c52bd1a7c097c5e3e`

The live runtime therefore matches the implementation candidate. No new
product image is required for the later report-only and Graphify commits.

## Earlier review findings

Every earlier review, verification, polish report, and handoff was read. The
following checks prove the current status instead of relying on repair notes.

| Earlier finding | Current evidence and disposition |
|---|---|
| Review 1 F-1-1: false Rust 1.85 minimum | Fixed. README and Cargo metadata say 1.88. The exact MSRV claim passed. |
| F-1-2: unbounded “safe” claim | Fixed. The cited copy is absent. Specific controls have claim tests. |
| F-1-3: incomplete default-demo claim | Fixed. The test checks the temp folder, printed command, mock, response, HTML, and SVG. |
| F-1-4: stale route social metadata | Fixed live on demo, privacy, terms, and 404. |
| F-1-5: inconsistent 404 chrome | Fixed. Header, navigation, footer, one-line description, version, and build date match. |
| F-1-6: unclear audience sentence | Fixed. The first screen names backend engineers and three failure types. |
| F-1-7: unclear preview label | Fixed. It names the localhost mock result. |
| F-1-8: slogan preview heading | Fixed. It names selected-secret removal before export. |
| F-1-9: unclear workflow label | Fixed. It names capture, secret removal, and replay. |
| F-1-10: unclear limits label | Fixed. It says what the product will not do. |
| F-1-11: `PII field(s)` placeholder | Fixed. The live and CLI transcript use plain wording. |
| F-1-12: unusable clipboard recovery | Fixed. A labelled selectable command is present and named by the error. |
| F-1-13: unclear offline notice | Fixed. It names the page and sample data. |
| F-1-14: long deploy sentence | Fixed. The two behaviors are separate short sentences. |
| F-1-15: unsupported “release-ready” adjective | Fixed. README names the exact package check. |
| F-1-16: 404 metaphors | Fixed. The page says “Page not found” and “Return home.” |
| Review 2 F-2-1: missing MSRV provisioning | Fixed for setup. Rust 1.88 installed and the exact claim passed. |
| F-2-2: missing build-artifact claim | Fixed. The claim found the static site and release executable. |
| F-2-3: missing deployed-route claim | Fixed. The claim proved three deep routes and a real HTTP 404. |
| F-2-4: unlisted sample equivalence | Fixed. Both demos match both shipped example files. |
| F-2-5: landing jargon | Fixed at every cited location. |
| F-2-6: README jargon | Fixed at every cited location. |
| F-2-7: inconsistent loopback terms | Fixed. The first screen defines loopback with `127.0.0.1`. |
| F-2-8: internal publishing sentence | Fixed. The sentence is absent. |
| Review 3 F-3-1: altered CLI recording | Fixed. Fresh output matches HTML and SVG after only the random temp ID is normalized. |
| F-3-2: missing IBM Plex Mono | Fixed. The self-hosted face loaded on landing and 404. |

## Earlier verification findings

| Earlier finding | Current evidence and disposition |
|---|---|
| Verification 1: phone touch targets | Fixed. No tested target was below 44 × 44 CSS pixels. |
| Verification 1: unlisted claims | Fixed. All public capability and privacy claims map to the 19 entries. |
| Verification 1: TypeScript check failed | Fixed. `npm run typecheck` passed. |
| Verification 2: desktop first action below the fold | Fixed. The desktop action ended at y=537 in a 900 px viewport. |
| Verification 2: redirects bypassed local-only rules | Fixed. All five standard redirect status cases passed for capture and send. |
| Verification 2: CLI demo read or overwrote existing data | Fixed. The isolation claim refused and preserved a populated folder. |
| Verification 2: demo label did not persist | Fixed. The label remained at y=0 after scrolling on phone and desktop. |
| Verification 2: demo state survived exit | Fixed. Exit removed the demo key and preserved real-data sentinels. |
| Verification 2: paid checkout was unavailable | Fixed by removing the unshipped paid offer. No paid control or claim remains. |
| Verification 2: accessibility gaps | Fixed. Axe, target size, focus, and 200% reflow checks passed. |
| Verification 2: claims inventory was incomplete | Fixed. The current inventory has 19 one-to-one tagged tests. |
| Verification 2: missing pages returned 200 | Fixed. The designed missing page returned HTTP 404. |
| Verification 2: subcommand help lacked option guidance | Fixed. Fresh installed help describes required paths, URLs, and secrets. |
| Verification 3: mobile wordmark accessible name mismatch | Fixed. Its name includes visible `BR`; Axe reported no violation. |
| Verification 3: missing URLs returned 200 | Fixed. The live missing address returned 404. |
| Verification 3: claims were missing or incomplete | Fixed. Path, headers, JSON, stderr, opt-in, and CLI networking are tested. |
| Verification 3: export accepted a populated folder | Fixed. It refuses before any file changes. |
| Verification 3: meaningful text was below 16 px | Fixed. The mobile regression and fresh computed checks passed. |
| Verification 3: cross-route How it works navigation failed | Fixed. `/#how` scrolled and focused `#how`. |
| Verification 3: install action was incomplete | Fixed. It provides a clone-ready command and source link. |
| Verification 3: hero image was not responsive | Fixed. The phone loads the 640 px source through `picture`. |

Verification 4 and verification 5 reported no findings. Their pass conditions
remain satisfied except for the new claim-test reliability finding above.

## Other checks

`npm test` passed all 31 Playwright tests and all four Rust tests after the
individual claim run. `npm run typecheck`, `npm run lint`,
`cargo fmt --all -- --check`, `npm run build`, and `cargo package --locked`
also passed.

The brief does not need a runtime AI step. Capturing, removing selected values,
exporting, replaying, and signing are deterministic safety operations. A model
would add an unnecessary data boundary. No AI or payment integration is present.

## Required next step

Repair F-5-1 without changing the observable capture behavior. Then repeat all
19 exact claim commands from a clean checkout. The verdict can become PASS only
if every first run passes and no new finding appears.
