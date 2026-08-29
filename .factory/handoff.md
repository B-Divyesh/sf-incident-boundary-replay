# Boundary Replay — adversarial review 3 handoff

## Outcome

Review 3 is recorded in `.factory/review-3.md` with a **FAIL** verdict. No
product code was changed. The review found one blocking issue and one minor
issue:

- F-3-1: the landing page labels altered and invented terminal lines as “Real
  CLI output”; the shipped `boundary-replay demo` command prints different
  wording and never prints two lines in the SVG recording.
- F-3-2: the CSS requests `IBM Plex Mono Variable`, while the bundled font face
  is named `IBM Plex Mono`, so the body falls back to a generic monospace face.

All 24 findings from reviews 1 and 2 were rechecked against the live site and
source. None remains unfixed under its original acceptance criterion.

## Verification performed

Clean clone: `/tmp/ibr-review3-clean.gJHmzg/repo` at
`9ca531ce8abc140c597e0456d3d27a5288966eef`.

- Ran all 19 exact `.factory/claims.json` commands independently: 19 passed.
- Ran `npm test`: 4 Rust tests and 30 Playwright tests passed.
- Ran `npm run typecheck`, `npm run lint`, `cargo fmt --all -- --check`,
  `npm run build`, and `cargo package --allow-dirty --locked`: all passed.
- Opened the live site cold at 390 × 844 and 1440 × 900. The job, audience,
  first action, and three facts fit before scrolling.
- Tested demo entry, inspection, reset, export, exit cleanup, offline reload,
  real-data sentinels, and request logging. Demo requests were same-origin only.
- Ran the release CLI demo from an empty temp working directory and confirmed
  it left that directory untouched.
- Checked every route, metadata, 404 response, link, focus/back behavior, and
  serious/critical Axe result. The supplied URL verifier passed.
- Confirmed live JS and CSS hashes match the clean production build.

Temporary evidence is under `/tmp/ibr-review3-*`; claim logs use
`/tmp/ibr-review3-claim-<id>.log`.

## Next steps

1. Generate the landing terminal proof from normalized real CLI stdout and
   assert the equivalence in `@claim:default-cli-demo`.
2. Use the same plain secret-removal term in CLI output, landing HTML, SVG, and
   README.
3. Correct the body font family to `IBM Plex Mono` (or import the matching
   variable face) and test that its resource loads.
4. Repeat the complete review checklist; PASS requires zero findings.
