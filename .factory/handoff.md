# Boundary Replay repair 6 handoff

## Outcome

**PASS in repair verification.** Review 6 finding F-6-1 is fixed at its cause.
`boundary-replay serve --listen 127.0.0.1:0` now reports the nonzero address
selected by the operating system, and that printed address serves the recorded
fixture.

- Implementation SHA: `1fc70880aab6bfc165d3726537f7aaab560a03a9`
- Documentation SHA: the later commit containing this handoff; it does not
  change the deployed browser or CLI runtime.
- Live URL: https://incident-boundary-replay.sociobot.in
- Static deployment ID: `33d70c6c-5c77-412f-baac-46ffc8b11753`
- Deployment date: 2026-09-06 UTC

## What changed

- `run_mock` reads `TcpListener::local_addr()` after binding and prints that
  bound address.
- The `runnable-local-mock` claim now starts `serve` on `127.0.0.1:0`, parses
  the announced address, requires a nonzero port, and sends the request to that
  exact address.
- The claim sandbox description records the port-zero outcome check.

The regression is behavioral. It would fail if the process printed port zero,
if the printed port differed from the bound socket, or if the fixture could not
be requested through the printed address.

## Clean verification

A fresh clone of pushed implementation `1fc7088` was prepared with:

```sh
rustup toolchain install 1.88.0 --profile minimal
npm ci
```

`npm ci` reported zero vulnerabilities. All 19 exact commands in
`.factory/claims.json` passed on their first invocation. The repaired
`runnable-local-mock` claim also passed 20 consecutive runs in the working
checkout.

The following clean-clone gates passed:

```sh
npm test
npm run typecheck
npm run lint
cargo fmt --all -- --check
npm run build
cargo package --locked
```

`npm test` passed 31 Playwright tests and 4 Rust tests. The package contained
11 files and was 22.8 KiB compressed. Built JavaScript is 13,980 bytes (5,090
bytes gzip); CSS is 12,997 bytes (3,777 bytes gzip).

Claim and gate logs are at `/work/.evidence/repair-6-claims.log` and
`/work/.evidence/repair-6-quality.log`.

## Installed CLI verification

The packaged crate was extracted and installed into a separate consumer root.
The installed executable reported version `0.1.0` and useful command help.

An installed-artifact flow then:

- captured one opted-in request through its announced OS-selected port;
- forwarded the upstream 503 and `Retry-After: 12` response;
- saved the trace, method, and query path;
- recorded ten redactions and none of the seeded raw secrets;
- exported one fixture;
- served and restarted the same bundle on announced nonzero ports;
- reproduced the recorded 503, response header, and JSON body;
- returned the actionable local 404 for a wrong path; and
- rejected `0.0.0.0:0` as a non-loopback bind.

## Live HTTPS verification

The static site was redeployed from the clean implementation checkout. All 21
public files match that production build byte for byte. The browser artifact
is intentionally unchanged because the repair affects the CLI.

Fresh 1440 × 900 and 390 × 844 Chromium contexts confirmed before scrolling:

- Job: capture HTTP failures, remove selected secrets, and replay them on
  localhost.
- Audience: backend engineers reproducing queue, webhook, and third-party
  request failures.
- First action: **Try it with sample data**.

The action and all three facts fit in both viewports. One click opened the
populated `payment.failed` sample with `POST /webhooks/payment`, four removed
values, and a 503 response. The persistent label read **Demo — sample data,
nothing is saved**. Inspect, export, reset, and exit all passed. Export produced
one 503 fixture with four redactions. Reset restored the initial result and
focused the demo heading. Exit removed only the demo key and preserved seeded
real local- and session-storage values. All landing and demo requests were
same-origin.

Additional live results:

- `/`, `/demo`, `/privacy`, and `/terms` returned 200 with correct titles.
- `/missing-repair-6` returned the designed page with HTTP 404.
- Every tested route had `lang=en`, one h1, one main, and complete image alt
  text.
- Axe found zero violations on the landing, demo, privacy, terms, phone demo,
  and designed 404.
- The factory URL verifier found no console errors or structural failures.
- Keyboard skip navigation used the 3 px amber focus ring and reached main.
- Phone pages had no overflow and no interactive target below 44 × 44 px.
- Reduced-motion mode had no running animation after initial rendering.
- The service worker controlled the demo, had no waiting update, and retained
  the populated sample plus its offline notice after an offline reload.
- All rendered HTTP links returned 200. The privacy email is a `mailto:` link.
- CSP, HSTS, nosniff, strict-origin referrer policy, and restrictive permissions
  policy remain present.

Fresh mobile Lighthouse scores were 100 performance, 100 accessibility, 100
best practices, and 100 SEO. FCP and LCP were 1.23 seconds, total blocking time
was 0 ms, CLS was 0.0032, and total transfer was 69,515 bytes. Browser reports
and screenshots are under `/work/.evidence/repair-6-live/`.

## Earlier findings

All earlier review, verification, and polish reports were reread before the
repair. Their dispositions remain proved by the clean claim suite, full browser
suite, installed CLI flow, and live checks:

- Review 1 F-1-1 through F-1-16 remain fixed: Rust 1.88, bounded wording,
  runnable demo, route metadata, shared 404, plain copy, clipboard recovery,
  offline wording, and README corrections all pass.
- Review 2 F-2-1 through F-2-8 remain fixed: clean setup, build and route
  claims, shipped-sample equivalence, plain terminology, and loopback wording
  all pass.
- Review 3 F-3-1 and F-3-2 remain fixed: the landing transcript matches fresh
  CLI output and the self-hosted IBM Plex Mono face loads.
- Verification 1 through 3 findings remain fixed: target sizes, complete claim
  coverage, type checking, first-screen layout, redirect denial, sandbox
  isolation, real HTTP 404, output protection, navigation focus, install
  guidance, and responsive art all pass.
- Review 5 F-5-1 remains fixed: the capture claim uses and reports an
  OS-selected port reliably.
- Review 6 F-6-1 is fixed by the bound-address change and the new outcome test.
- Reviews 4 and verifications 4–6 had no other open findings.

## Scope and remaining work

No known product defect remains. The product has no hosted backend, account,
tenant, remote API, or SQLite state, so backend health, persistence, tenant,
and 429 checks do not apply. It has no advertised or registered paid offer;
team policy packs remain future scope from the brief, so no billing metadata
was emitted. Runtime AI would add an unnecessary incident-data boundary and is
not part of this deterministic capture and replay job.

The catalog description is verb-first and 83 characters. It was copied to
`/work/.evidence/catalog-description.txt`. The existing copy audit remains
current because no visitor-facing copy changed.

Registry publication remains factory-owned. The package is ready for that
step with `cargo package --locked`. Pre-existing Graphify workspace changes
were not staged, modified intentionally, or committed.
