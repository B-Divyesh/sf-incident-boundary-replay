# Boundary Replay — polish 1 handoff

## Delivered

Repair commit `1701c245eb8a478a442b866694a4fa64ecd04811` resolves every finding
in `.factory/review-1.md`; the finding-by-finding map is in
`.factory/polish-1.md`.

- The first screen now uses direct, bounded wording for backend engineers
  reproducing failed queue, webhook, and third-party requests.
- `/demo` and `?demo=1` enter the isolated sample workspace. Its persistent
  banner says that nothing is saved and provides reset and exit controls.
- The claim inventory now has 16 one-test claims, including a clean Rust 1.88
  locked build and the complete default CLI demo behavior.
- Route-specific Open Graph/Twitter metadata updates during SPA navigation.
  The real 404 has matching metadata plus the product header and footer.
- The install command is visible and selectable, the offline notice is plain,
  and the static 404 reflows at the 195 CSS-pixel test width.
- The service-worker post-build step is idempotent, so repeated builds work.

## Clean-clone evidence

Fresh clone: `/tmp/ibr-polish-clean.hO56fK` at commit
`1701c245eb8a478a442b866694a4fa64ecd04811`.

- `npm ci` passed with 0 audit vulnerabilities.
- `npm test` passed: 4 Rust tests and 27 Playwright tests.
- Every exact command in `.factory/claims.json` passed independently:
  16 claims / 16 one-test passes. Complete log:
  `/tmp/ibr-polish-claims.log`.
- `npm run typecheck`, `npm run lint`, `cargo fmt --all -- --check`,
  `cargo +1.88.0 build --locked`, `npm run build`, and
  `cargo package --allow-dirty --locked` passed.
- Re-running `npm run build:site` twice succeeds. The final clean build has
  `dist/site` and `target/package/boundary-replay-0.1.0.crate`.
- Final clean-build hashes: JS
  `f1dc1d4d03fbfae9f59be38537e48081282d6ff1a6c0885e3c16c9cf313af75d`;
  CSS `a801b92cebb5d51bda268eede7540cd24840a7db5dca43e6af42a3e1cef6d2bf`.

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh incident-boundary-replay dist/site
```

The CLI package is ready for factory-owned publishing with:

```sh
cargo package --locked
```

## Known gaps

None. There is intentionally no paid offer because no Sociobot product is
registered for this repository; no unavailable checkout is shown or claimed.

## Deployment evidence

The static deployment and cold live-route check are recorded below after this
commit is pushed and deployed.
