# Boundary Replay repair 5 handoff

## Outcome

**PASS.** Review 5 finding F-5-1 is fixed at its cause. The implementation
commit is `09a9cdc40cb83150f572f339bb54ea0dbad81d7d` (`fix: remove capture
claim port race`). The current documentation update follows that implementation
commit in Git history.

Boundary Replay records selected HTTP requests and responses, removes selected
secrets before saving, and exports a localhost mock. It is for backend
engineers reproducing queue, webhook, and third-party failures. The first
action is **Try it with sample data**.

## What changed

- The capture command now reports the loopback address it actually bound. This
  makes `--listen 127.0.0.1:0` usable for isolated consumers and tests.
- Capture regressions no longer reserve a port and release it before spawning
  the sidecar. They let the sidecar choose an OS port, parse its announced
  address, and send the request there.
- Startup failures now include the child process stdout and stderr, not only an
  exit code.
- The `capture-opt-in` claim checks that its new output folder is empty before
  the command runs, then proves a real post-launch request is recorded. It is
  an outcome check rather than a source-text assertion.

The repair did not change browser assets. A fresh production build still
matches the current HTTPS `index.html`, `404.html`, `sw.js`, main JavaScript,
and main CSS byte for byte. The source implementation was pushed to `main`.

## Verification

### Clean claims and quality gates

Two detached clean clones of `09a9cdc` were used. The definitive run was
`/tmp/ibr-repair5-clean-two.5wchSn/repo` after the documented setup:

```sh
rustup toolchain install 1.88.0 --profile minimal
npm ci
```

- All 19 exact commands in `.factory/claims.json` passed independently on
  their first command invocation in the clean clone.
- `npm test` passed: 31 Playwright tests plus 4 Rust unit tests and doc tests.
- `npm run typecheck`, `npm run lint`, `cargo fmt --all -- --check`,
  `npm run build`, and `cargo package --locked` passed.
- `cargo package --locked` packaged and verified 11 files (22.8 KiB
  compressed).
- The repaired claim also passed 20 consecutive repetitions with
  `npm test -- --grep @claim:capture-opt-in --repeat-each=20`.

### Clean consumer CLI

The packed crate was extracted and installed into
`/tmp/ibr-repair5-consumer.sgYptb/root` with `cargo install --path ...
--locked`. The installed binary reported `boundary-replay 0.1.0`; its
`demo --json` created one sample fixture. Its `capture --listen 127.0.0.1:0`
run announced its bound loopback address, forwarded a local 503 response, and
wrote exactly one scrubbed exchange.

### Live HTTPS product

Checked 2026-09-06 UTC at
`https://incident-boundary-replay.sociobot.in` in fresh 1440 × 900 and 390 ×
844 Chromium contexts.

- The cold first screen showed the job, named backend engineers and their
  failure types, and exposed the first action. The action/facts ended at
  537/658 px on desktop and 571/804 px on phone.
- One click opened the populated `payment.failed` sample with its 503 result,
  four removed values, persistent **Demo — sample data, nothing is saved**
  label, **Reset demo**, and **Start for real**.
- Inspect, reset, sticky-banner scroll, and exit passed. Exit removed only the
  demo session key and preserved seeded real local/session storage values.
- Landing and demo requests were same-origin only. Service-worker update left
  no waiting worker; an offline demo reload retained the sample, 503 response,
  and offline notice.
- Keyboard skip focus, the 3 px focus ring, no horizontal overflow, and
  reduced motion passed on both viewports.
- Axe found zero violations on landing (desktop and phone), privacy, terms,
  and the designed 404. `/`, `/demo`, `/privacy`, and `/terms` returned 200;
  `/missing-repair5` returned the designed HTTP 404.
- The factory `verify-url.sh` passed the live landing in 1.017 seconds with no
  console errors, one h1, one main landmark, `lang=en`, and no missing image
  alt text or unlabeled buttons.
- HTTPS responses retain CSP with `frame-ancestors 'none'`, HSTS, nosniff,
  strict-origin referrer policy, and restrictive permissions policy.
- Built initial JavaScript is 13,980 bytes (5,070 bytes gzip); CSS is 12,997
  bytes (3,790 bytes gzip).

The current live static output is the same browser artifact as the prior
candidate because this repair changes the CLI/runtime test path only. It was
compared byte for byte with the current build after push.

## Earlier findings and scope

All earlier review and verification findings were reread before this repair.
Their current dispositions remain those independently rechecked in
`.factory/review-5.md`; F-5-1 is now resolved by the clean-run evidence above.
No Graphify workspace changes were staged or committed.

There is no public backend, account system, paid offer, billing registration,
or AI runtime. The free local exporter remains usable. Backend tenant, health,
rate-limit, and entitlement checks are not applicable. The package is ready to
publish with `cargo package --locked`; publishing remains a factory-owned
operation.

## Run and deploy

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

Deploy `dist/site` as the static root. `site/public/staticwebapp.config.json`
preserves direct loads for `/demo`, `/privacy`, and `/terms`, and rewrites real
missing routes to the designed HTTP 404.
