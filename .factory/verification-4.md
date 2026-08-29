# Independent verification 4 — PASS

**Candidate:** `439785f4ae42ee002cc92b214c619e5151ad6f39`  
**Live URL:** https://incident-boundary-replay.sociobot.in  
**Verified:** 2026-08-29 UTC

## Verdict

**PASS — release candidate accepted.** The deployed static product is an exact
artifact match for the candidate build, and the Rust CLI delivers the brief's
core job: explicitly capture an opted-in HTTP boundary, redact before it is
written, export it, and replay it locally without allowing non-loopback
targets. No release-blocking defects were found.

## Mandatory first-read and demo gate

A cold desktop visit states, in plain words:

- **What:** “Capture failures. Replay them safely on localhost.”
- **For whom:** “For backend engineers who need the failed boundary, not
  another trace.”
- **First action:** the visible **Try it with sample data** link, accompanied
  by “See a scrubbed failed webhook and its local response.”

The first action opens `/demo` in one click. It is already populated with a
scrubbed `payment.failed` failure and recorded local 503 response. The page has
the persistent “Demo — sample data, nothing is saved” banner, **Reset demo**,
and **Start for real**. This passes at 1440 x 900 and 390 x 844.

## Required claims gate

`.factory/claims.json` is present. I made a pristine detached clone at the
candidate commit (`/tmp/incident-boundary-replay-clean-BRFEpu`), ran `npm ci`,
then ran every `test` command from the manifest independently through its demo
entry point. All passed; the combined log is
`/tmp/incident-boundary-replay-clean-claims-rerun.log`.

| Claim ID | Result |
| --- | --- |
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

## Local build, package, and CLI exercise

- `npm ci`, `npm test` (23/23 Playwright tests plus 4 Rust unit tests and doc
  tests), `npm run typecheck`, `npm run lint`, `cargo fmt --all -- --check`,
  `npm run build`, and `cargo package --allow-dirty` all passed.
- The production build generated `dist/site` and the 6.9 MiB release binary;
  the package is `target/package/boundary-replay-0.1.0.crate` (23,184 bytes).
- I extracted that crate into a separate consumer directory, installed it with
  `cargo install --path <extracted-crate> --root <temp> --locked`, and ran its
  public CLI. It reports `boundary-replay 0.1.0`; `demo --json` creates one
  fixture and a bundle. Repeating it against a populated output exits with an
  actionable refusal before changes.
- Manual end-to-end capture: an opted-in local client sent a payment webhook
  through the sidecar to a local 503 upstream. The local caller received the
  recorded 503, JSON body, and `retry-after: 30`. The saved exchange contains
  `[REDACTED]` for authorization, email, and card number and contains none of
  the sent raw values. Evidence: `/tmp/boundary-capture-fpAn6u/captures2`.
- Manual boundary/recovery checks: a non-loopback mock bind (`0.0.0.0`) exited
  1 with “refusing non-loopback address”; a wrong mock path returns the clear
  local 404 response; the correct `POST /webhooks/payment` returns 503 with
  the recorded JSON and retry header. The declared redirect, signing, output,
  isolation, JSON/error, and opt-in boundary cases are additionally covered by
  the passing claim suite.

## Live product QA

- **Deployment identity:** local production and live SHA-256 hashes match for
  HTML, service worker, JS, and CSS. JS:
  `506693bc32264042853e7544bf2c5f282487449e0f7483eb98af680dec266f0a`;
  CSS: `ee9dac8d69addf762c434d25417adb14f073ee2f908162a3e46984f95a8aee3f`.
- **Routes and semantics:** `/`, `/demo`, `/privacy`, and `/terms` return 200
  and each has `lang=en`, one `<h1>`, one `<main>`, and the appropriate title.
  An unknown path returns the designed document with a real HTTP 404.
- **Desktop/mobile/accessibility:** tested at 1440 x 900 and 390 x 844. No
  normal-layout horizontal overflow; all visible links, buttons, and inputs at
  390 px are at least 44 x 44 CSS px. Reflow at a 195 CSS-pixel viewport has no
  horizontal overflow on `/`, `/demo`, or `/privacy`. Keyboard use reaches all
  controls, and visible focus is a 3 px amber ring. The skip link works.
  Playwright Axe found zero serious or critical findings on landing and demo
  at desktop and mobile. Reduced-motion mode loads with no errors.
- **Privacy/network:** fresh landing and demo contexts made only same-origin
  requests. Demo state is only
  `sessionStorage['demo:incident-boundary-replay:state']`; no real
  local-storage data is used. No console or page errors occurred.
- **PWA:** after the worker took control, `registration.update()` completed
  without a waiting worker; an offline `/demo` reload retained the sample and
  produced no errors.
- **Headers/caching:** live responses include self-only CSP (including
  `frame-ancestors 'none'`), HSTS, `X-Content-Type-Options: nosniff`, strict
  origin referrer policy, and restrictive permissions policy. HTML and the
  service worker revalidate at 30 seconds; hashed JS/CSS, fonts, and images
  are one-year immutable.
- **Budgets:** initial JS is 12,983 bytes (4,980 gzip), CSS 12,749 bytes, all
  shipped fonts total 75,792 bytes, and the desktop hero WebP is 63,102 bytes.
  All are within the supplied static-product budgets.

There is no deployed application API, paid-unlock request, or sign-in flow;
the API allowance/429 and Entra tenant checks are therefore not applicable.
The local CLI listeners are intentional loopback fixture servers, not public
server-side endpoints.

## Notes

The repository does not include a `verify-url.sh`; equivalent title, language,
main landmark, image-alt, console, route, and Playwright Axe checks were run
directly against the live URL. Pre-existing `graphify-out/` worktree changes
were left untouched. No product code was changed during verification.
