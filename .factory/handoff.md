# Boundary Replay — adversarial review 2 handoff

## Delivered

- Added `.factory/review-2.md` with a **FAIL** verdict and eight findings.
- Made no product-code changes.
- Replayed all 16 findings from review 1 against the live site and source.
- Audited every landing-page and README copy unit with word counts.

## Verification

Clean clone: `/tmp/ibr-review2-clean.IPyHrt` at
`1469113ec5fd449cbca58bc3ea8da78c6878651b`.

- Cold live checks: 390 × 844 and 1440 × 900.
- One-click demo, reset, exit, sticky banner, storage isolation, and same-origin
  request log: passed.
- Exact claim commands: 15 passed; `msrv-build` failed before Rust 1.88.0 was
  manually installed. After installation, that claim and the full 27-test
  suite passed.
- Initial full `npm test`: 26 passed, 1 failed for the same missing-toolchain
  condition.
- `npm run build`, `npm run typecheck`, `npm run lint`, and
  `cargo fmt --all -- --check`: passed.
- Live route/metadata/link/focus crawl: passed.
- Worker URL verifier: passed.
- Live Axe checks on `/`, `/demo`, `/privacy`, and `/terms`: zero violations.
- Live and clean-build JS/CSS hashes match.

## Evidence

- Claim log: `/tmp/ibr-review2-claims.log`
- Live browser report: `/tmp/ibr-review2-live.json`
- Screenshots: `/tmp/ibr-review2-cold-mobile.png`,
  `/tmp/ibr-review2-cold-desktop.png`, and
  `/tmp/ibr-review2-demo-mobile.png`
- URL verifier evidence: `/tmp/ibr-review2-verify.nPVeTD`

## Work remaining

Resolve F-2-1 through F-2-8 in `.factory/review-2.md`. The release remains
blocked until the declared MSRV claim passes on its first clean-worker run and
all unlisted claims and copy findings are removed.
