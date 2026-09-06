# Capture HTTP failures and replay them locally — review 6

- Reviewed: 2026-09-06 UTC
- Verdict: **FAIL**
- Findings: **0 critical, 0 high, 0 medium, 0 low, 1 minor**
- Untested public claims: **0**
- Implementation candidate: `09a9cdc40cb83150f572f339bb54ea0dbad81d7d`
- Documentation commit: `10a8e642019caf0800a2df9f304bd6b07ba976fe`
- Checkout snapshot: `b139cb483f5d7158d80c1762cdb5d3748531f3b6`
- Live URL: https://incident-boundary-replay.sociobot.in
- Clean checkout: `/tmp/ibr-review6-clean.x3685X/repo`

## Verdict

**FAIL.** There is one minor finding and zero untested public claims.

All 19 declared claim commands passed on their first run from a clean public
checkout. The live site, one-click demo, accessibility checks, offline path,
privacy behavior, build, package, and installed core CLI flow passed. A fresh
boundary-path check found that `serve --listen 127.0.0.1:0` starts on an
OS-selected port but prints port `0`. The printed address cannot be used.

## Finding

### F-6-1 — Minor — an OS-selected mock port is reported as port zero

The installed package accepts this command and remains running:

```sh
boundary-replay serve \
  --bundle /tmp/boundary-replay-demo-2459a638/payment-failure.bundle \
  --listen 127.0.0.1:0
```

It prints:

```text
serving 1 fixture(s) on http://127.0.0.1:0
```

The process was actually listening on `127.0.0.1:42731`. A request to that
address returned the recorded 503 fixture. A request to the printed address
failed with curl exit 7. Port zero is a useful boundary value when avoiding
port collisions, but the successful command gives no usable address.

The cause is visible in `src/lib.rs:488-489`: `run_mock` binds a listener and
then prints the requested `addr`. It does not read `listener.local_addr()`.
The capture path already reads and prints its bound address at
`src/lib.rs:385-389`.

This does not falsify a declared public claim because the documented mock
commands use an explicit nonzero port. It is still a CLI boundary-path defect.
The workaround is to choose an unused nonzero loopback port.

## First screen

Fresh Chromium contexts used 1440 × 900 and 390 × 844 viewports. Neither was
scrolled before recording these answers.

- Job: capture failed HTTP requests, remove selected secrets, and replay the
  result on localhost.
- Audience: backend engineers reproducing queue, webhook, and third-party
  request failures.
- First action: **Try it with sample data**.

The desktop action ended at y=536.6 and the facts at y=658.4. The phone action
ended at y=571.5 and the facts at y=803.6. The first screen therefore showed
the job, audience, action, result description, and three facts without scroll
on both viewports.

## Demo and real-data isolation

One click opened `/demo` with a populated `payment.failed` webhook,
`POST /webhooks/payment`, four removed values, and a recorded 503 response.

- The persistent label said **Demo — sample data, nothing is saved**.
- **Reset demo** and **Start for real** remained available at the top after
  scrolling to the page end.
- **Inspect capture** reported four `[REDACTED]` values.
- Export downloaded one fixture with status 503 and four redactions.
- Reset restored the initial 503 result and focused the demo heading.
- Exit removed only `demo:incident-boundary-replay:state`.
- Seeded real local-storage and session-storage sentinels remained unchanged.
- Landing and demo requests were same-origin only.

No live browser action read, changed, or sent real data.

## Declared claims

Rust 1.88.0 and `npm ci` were installed first in the clean public clone. Every
exact command from `.factory/claims.json` passed on its first invocation:

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

Each ID appears in exactly one tagged test. The current landing page, demo,
privacy page, README, CLI help, and terms were cross-checked against the
inventory. There are zero missing or untested public claims. The repaired
`capture-opt-in` command also passed 20 consecutive repetitions.

## Clean build and package

The following checks passed from the same clean checkout:

```text
npm test                                      31 Playwright tests passed; 4 Rust tests passed
npm test -- --grep @claim:capture-opt-in --repeat-each=20
npm run typecheck
npm run lint
cargo fmt --all -- --check
npm run build
cargo package --locked                        11 files; 22.8 KiB compressed
```

The built JavaScript is 13,980 bytes (5,090 bytes gzip). CSS is 12,997 bytes
(3,777 bytes gzip). The prior mobile Lighthouse evidence remains applicable
because all 21 public files match the fresh build byte for byte. That evidence
records performance 100, accessibility 100, best practices 100, SEO 100,
LCP 1.2 s, CLS 0.003, and total blocking time 10 ms.

## Installed CLI exercise

The verified crate archive was unpacked and installed into the separate
consumer root `/tmp/ibr-review6-consumer.N2Ms1S`.

- `boundary-replay --version` returned `0.1.0`.
- Main and subcommand help named the job, required inputs, and loopback limits.
- `demo --json` created one isolated fixture in a temporary bundle.
- The installed mock returned status 503, `content-type: application/json`,
  `retry-after: 30`, and the recorded JSON body.
- A wrong path returned the actionable 404 response.
- Restarting from the same bundle returned the same 503 fixture.
- A non-loopback bind failed with exit 1 and a loopback instruction.
- Installed capture on `127.0.0.1:0` reported its actual port, forwarded a 503,
  and wrote one exchange with five redaction markers and none of the seeded
  request, response, header, or cookie secrets.

The declared tests additionally passed invalid policy, populated output,
redirect, signing, JSON/stderr, oversized request recovery, and chosen-path
cases. F-6-1 is the only defect found in normal, invalid, boundary, or recovery
paths.

## Live site, accessibility, privacy, and offline behavior

Fresh direct loads produced:

| Route | Status | Title |
| --- | ---: | --- |
| `/` | 200 | `Boundary Replay — replay HTTP failures on localhost` |
| `/demo` | 200 | `Demo — Boundary Replay` |
| `/privacy` | 200 | `Privacy — Boundary Replay` |
| `/terms` | 200 | `Terms — Boundary Replay` |
| `/missing-review-6` | 404 | `Not found — Boundary Replay` |

The deliberate 404 is expected. It has the shared header and footer, one main
landmark, one `Page not found` h1, and a working **Return home** link.

- Axe found zero violations on desktop landing and demo, phone demo, privacy,
  terms, and the designed 404.
- The factory `verify-url.sh` passed in 818 ms with no console errors, one h1,
  `lang=en`, one main landmark, complete alt text, and labelled buttons.
- Keyboard Tab exposed a 3 px amber focus ring on **Skip to content**. Enter
  moved focus to main; the next Tab reached the sample action.
- Phone pages had no horizontal overflow or visible target below 44 × 44 px.
- Reduced-motion emulation matched and had zero running animations.
- The service worker controlled a fresh demo, had no waiting update, and an
  offline reload retained the sample and visible offline notice.
- Security headers include HSTS, nosniff, strict-origin referrer policy,
  restrictive permissions policy, and CSP `frame-ancestors 'none'`.
- All internal routes, GitHub source, and Param Factory links returned their
  expected success responses. The privacy email is an explicit `mailto:` link.

The product has no backend, tenant, account, billing flow, or remote API.
Backend isolation, restart persistence, health, and 429 checks are not
applicable. Local mock restart persistence and the recorded `Retry-After`
header were checked in the installed consumer flow.

## Candidate and live deployment

`09a9cdc` is the last product implementation commit. `10a8e64` is the latest
report/documentation commit. `b139cb4` only refreshes Graphify output. Later
report-only and Graphify commits do not require a new product image.

The clean build from `b139cb4` matched all 21 live public files byte for byte,
including HTML, JavaScript, CSS, service worker, fonts, and images. The live
browser artifact therefore matches implementation candidate `09a9cdc`.

## Earlier findings disposition

All earlier review, verification, and polish reports were reread. Their cited
issues remain resolved; F-6-1 is new.

| Earlier findings | Current proof and disposition |
| --- | --- |
| Review 1 F-1-1 through F-1-3 | Rust 1.88, bounded safety wording, and the executable default demo all pass declared claims. |
| Review 1 F-1-4 through F-1-5 | Route metadata and the shared designed 404 pass fresh live checks. |
| Review 1 F-1-6 through F-1-16 | The fresh cold read, current copy audit, terminal recovery, offline notice, README, and 404 use plain job and action wording. |
| Review 2 F-2-1 through F-2-4 | Clean toolchain provisioning, build artifacts, deep routes, HTTP 404, and shipped-sample equivalence pass exact claims. |
| Review 2 F-2-5 through F-2-8 | The cited jargon, inconsistent terminology, and internal publishing sentence remain absent. |
| Review 3 F-3-1 through F-3-2 | Real demo output matches both landing transcripts, and IBM Plex Mono loads from the self-hosted build. |
| Verification 1 | Touch targets, claims coverage, and TypeScript all pass. |
| Verification 2 | First-screen action, redirect denial, CLI/demo isolation, persistent label, demo exit, removed paid offer, accessibility, HTTP 404, and help all pass. |
| Verification 3 | Wordmark name, HTTP 404, complete claims, populated-folder refusal, 16 px text, cross-route focus, install action, and responsive image all pass. |
| Review 5 F-5-1 | The exact capture claim passed once, then 20 repeats. Installed capture also succeeded on an OS-selected port. |
| Verifications 4, 5, and 6; review 4 | Their zero-finding conditions remain satisfied except for the newly tested F-6-1 path. |

There is no missed AI feature. Capture, field removal, signing, and deterministic
replay do not benefit from sending incident contents to another data boundary.

## Required next step

In `run_mock`, read `listener.local_addr()` after bind and print that address,
as the capture path already does. Add a regression that starts `serve` on
`127.0.0.1:0`, parses the printed nonzero address, and requests the fixture.
Then rerun all 19 claim commands and the installed consumer check.

The unambiguous review verdict is **FAIL**: finding count 1; untested claim
count 0.
