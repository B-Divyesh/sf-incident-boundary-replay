# Independent verification 5 — PASS

**Candidate:** `8e14cc7aea088d1572f17efb04a8240db4d93f74`  
**Live URL:** https://incident-boundary-replay.sociobot.in  
**Verified:** 2026-08-29 UTC

## Verdict

**PASS — release candidate accepted.** The deployed site is an exact byte match
for the candidate production build, and the packaged CLI completes the brief's
real job: explicitly capture an HTTP boundary, remove configured secrets before
disk, export the scrubbed exchange, and reproduce its failed response on a
loopback-only mock. Fresh testing found no release-blocking defect.

## Defects by severity

- Release blocker: 0
- High: 0
- Medium: 0
- Low: 0

The deliberately requested unknown URL produced Chromium's normal
`Failed to load resource: ... 404` console message for its document response.
All 200 routes and all tested interactions had zero console or page errors.

## Mandatory first-read and demo gate

A cold 1440 x 900 visit says:

- **What:** “Capture HTTP failures. Replay them on localhost.”
- **For whom:** “For backend engineers reproducing failed queue, webhook, and
  third-party requests.”
- **First click:** **Try it with sample data**, beside “See a failed webhook
  with selected secrets removed.”

The action opens the already populated `/demo` in one click. The same content,
action, and all three product facts fit inside the first 390 x 844 viewport.
The demo shows its persistent “Demo — sample data, nothing is saved” banner,
**Reset demo**, and **Start for real**. This mandatory gate passes.

## Claims gate

`.factory/claims.json` is present with 19 entries. I created a pristine detached
clone at `/tmp/boundary-replay-clean-qmv0yi/repo`, confirmed its status was
empty at the exact candidate, ran `npm ci`, and then ran every manifest `test`
command independently. Result: **19 passed, 0 failed**. Combined output is at
`/tmp/boundary-replay-clean-qmv0yi/claims.log`.

| Claim | Result |
| --- | --- |
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

Landing, legal, README, help, and offline copy were cross-checked against the
manifest. No unsupported or unlisted behavioral claim was found.

## Clean build, test, and package evidence

The following all passed in the pristine candidate clone:

- `npm ci` — 36 packages installed; 0 vulnerabilities.
- `npm test` — 31/31 Playwright tests, 4/4 Rust unit tests, and doc tests.
- `npm run typecheck`.
- `npm run lint` (`cargo clippy -- -D warnings`).
- `cargo fmt --all -- --check`.
- `npm run build` — produced `dist/site` and the release executable.
- `cargo package --locked` — verified 11 packaged files; 22.8 KiB compressed.

The exact build produced 13,980 bytes of initial JavaScript (5,090 gzip),
12,997 bytes of CSS (3,777 gzip), 75,792 bytes of fonts, a 63,102-byte desktop
hero, and a 19,982-byte mobile hero. These are within all supplied budgets.

## Packaged CLI and end-to-end behavior

I extracted `boundary-replay-0.1.0.crate` into a separate consumer directory,
installed it with `cargo install --path ... --root ... --locked`, and exercised
the installed executable, not the workspace binary. `--version` returned
`boundary-replay 0.1.0`; `--help` documented all five commands; `demo --json`
created one isolated fixture and a runnable bundle.

A separate real boundary run used the installed package and a local 503
upstream. The request included authorization, cookie, nested email, card,
array-token, trace ID, and query values; the response echoed the body and added
response secrets. Evidence under `/tmp/boundary-replay-e2e-7ki6G2` shows:

- caller received the real upstream 503;
- the saved exchange preserved trace `trace-qa-20260829` and
  `POST /webhooks/payment?attempt=0`;
- all eight unique raw secret values were absent from disk and 11 field/header
  occurrences were recorded as redactions, including echoed response values;
- export reported one fixture;
- the local mock reproduced status 503, `Retry-After: 12`, and the JSON body;
- the same path with the wrong method returned the actionable local 404;
- non-loopback bind, invalid policy JSON, and populated output each exited 1;
  invalid policy created no output, and the populated destination sentinel was
  unchanged.

The claim suite additionally proves fresh HMAC re-signing, redirect refusal for
301/302/303/307/308, CLI connect denial during the demo, capture opt-in, JSON
output for demo/export/send, and stderr/non-zero failure behavior.

## Live deployment evidence

- **Candidate identity:** fresh local and live SHA-256 hashes match byte for
  byte for `index.html`, `404.html`, `sw.js`, and all 14 built assets. Key
  hashes are index `e6c234626fd67a67678daee59d8fb5854497a359b5c5b041f700befa2b7fd9fe`,
  JS `db0ae7d79fea342970321f5dcb1478228c78cfa782dc66eec8fb09bc9f4e31d0`,
  and CSS `2bcf68debf5f30dbd284a38cde6cf8d11e5eaef5b8a4f15c52bd1a7c097c5e3e`.
- **Routes and structure:** `/`, `/demo`, `/privacy`, and `/terms` returned
  200; an unknown route returned the designed document with HTTP 404. Every
  route had `lang=en`, exactly one `h1`, exactly one `main`, ordered headings,
  route-correct title/description/canonical metadata, and no missing image alt.
- **Accessibility:** fresh Axe scans found zero serious/critical findings on
  every route. Keyboard-only use reached and operated the skip link, Demo,
  inspect, response, and export actions. Route focus moved to the new `h1`.
  Focus was a visible 3 px amber ring. All live 390 px targets were at least
  44 x 44 CSS px; 195 CSS-pixel reflow had no horizontal overflow.
- **Responsive and motion:** desktop 1440 x 900 and mobile 390 x 844 had no
  horizontal overflow. Reduced-motion matched and reduced the signal animation
  to 0.01 ms with one iteration. No errors occurred.
- **Privacy:** the entire live landing → demo → inspect → local-response →
  export → reset → exit flow requested only the product origin. Demo state was
  only `sessionStorage['demo:incident-boundary-replay:state']`; real local and
  session sentinels remained unchanged after reset and exit.
- **PWA:** the live service worker was activated and controlling, an explicit
  update left no waiting worker, and offline `/demo` reload retained the sample,
  503 response, and visible offline notice without errors.
- **Headers and caching:** live responses send HSTS, self-only CSP with
  `frame-ancestors 'none'`, `nosniff`, strict-origin referrer policy, and a
  restrictive permissions policy. HTML and `sw.js` revalidate after 30 seconds;
  hashed JS/CSS use one-year immutable caching.
- **Performance:** Lighthouse 13 mobile scored 100 performance, 100
  accessibility, 100 best practices, and 100 SEO. FCP and LCP were 1.23 s,
  TBT 13 ms, CLS 0.0032, and Speed Index 1.23 s. Raw report:
  `/tmp/boundary-replay-lighthouse-2.json`.
- **Links:** all internal routes, `robots.txt`, `sitemap.xml`, the GitHub source,
  and Sociobot footer destination returned 200 after redirects.

There is no deployed application API, paid-unlock call, sign-in flow, AI
runtime, or remote backend. The request-allowance/429 and Entra authority checks
are therefore not applicable. The CLI listeners are deliberate loopback-only
capture/mock processes, not public server endpoints. The brief does not gain a
useful core step from runtime AI; capture, scrub, export, replay, and signing are
deterministic safety operations.

The repository does not contain `verify-url.sh`; equivalent live title,
language, main landmark, alt, console, routing, link, header, and Axe checks were
run directly. Pre-existing `graphify-out/` workspace edits were not changed or
included in this verification.
