# Boundary Replay review 5 handoff

## Outcome

**FAIL — one high finding and zero untested claims.** No product code was
changed. The full report is `.factory/review-5.md`.

Implementation reviewed:
`8f8de77cbcae771f6e348242f951da15e9f4802d`. Documentation baseline:
`045063a858e63e8d36cc987be8489e352ea24d9a`. Checkout baseline:
`7a0ed243a74978825d5c95ab6d108f05c483619e`.

## Finding

The exact `capture-opt-in` claim command failed on its first clean-checkout
run because the sidecar stopped during startup. It passed on retry, in 20
repeats, and in the full suite. The test releases its selected port before
launch and omits child stderr from the failure. Make port selection reliable,
include stderr, and rerun all claim commands from a clean checkout.

## Verification completed

- Installed documented Rust 1.88 and ran `npm ci` in a clean checkout.
- Ran all 19 declared claim commands. Eighteen passed first run; one failed.
- Ran `npm test`: 31 Playwright and four Rust tests passed.
- Passed typecheck, Clippy, formatting, build, and locked package checks.
- Installed the packed crate into a clean consumer root and exercised the CLI.
- Checked normal, invalid, size-boundary, recovery, and restart paths.
- Opened the live site in fresh desktop and phone contexts.
- Verified demo population, persistent label, reset, exit, export, storage
  isolation, same-origin requests, offline reload, and service-worker update.
- Checked keyboard, focus, reduced motion, 44 px targets, 200% reflow, all
  routes, legal pages, links, titles, metadata, Axe, and the designed 404.
- The factory URL verifier passed with no console error.
- Lighthouse performance scored 99 with 1.6 s LCP, 0.003 CLS, and 0 ms TBT.
- All 21 public build files matched the live deployment byte for byte.

## Reproduce

```sh
rustup toolchain install 1.88.0 --profile minimal
npm ci
jq -r '.[].test' .factory/claims.json
npm test
npm run typecheck
npm run lint
cargo fmt --all -- --check
npm run build
cargo package --locked
```

Clean checkout used: `/tmp/ibr-review5-clean.2JiBLF/repo`.

## Product status

The live browser product and installed CLI passed their direct behavior checks.
The release still fails because a declared claim command did not pass on its
required first run. No backend, tenant system, paid flow, or AI runtime exists,
so their service checks are not applicable.
