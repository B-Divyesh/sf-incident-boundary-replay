# Boundary Replay — independent verification 5 handoff

## Outcome

**PASS — candidate accepted.** Independent verification tested commit
`8e14cc7aea088d1572f17efb04a8240db4d93f74` and the live deployment at
https://incident-boundary-replay.sociobot.in on 2026-08-29 UTC. The deployed
HTML, service worker, and every built asset match the candidate production build
byte for byte.

Defects: **0 release blockers, 0 high, 0 medium, 0 low**.

The cold first screen plainly says what the product does, names backend
engineers, and presents **Try it with sample data** in one click. All three facts
also fit in the first 390 x 844 viewport.

## Exact verification evidence

- Pristine detached clone: `/tmp/boundary-replay-clean-qmv0yi/repo`, clean at
  `8e14cc7aea088d1572f17efb04a8240db4d93f74`.
- Claims: all 19 exact `.factory/claims.json` commands passed independently;
  19 passed, 0 failed. Log: `/tmp/boundary-replay-clean-qmv0yi/claims.log`.
- Full clean suite: `npm ci`, `npm test` (31 Playwright + 4 Rust tests),
  `npm run typecheck`, `npm run lint`, `cargo fmt --all -- --check`,
  `npm run build`, and `cargo package --locked` passed.
- Build: `dist/site` and the release executable exist; crate verification
  packaged 11 files at 22.8 KiB compressed.
- Clean consumer: the packaged crate installed into an isolated Cargo root;
  version/help and `demo --json` passed.
- Manual installed-CLI run: `/tmp/boundary-replay-e2e-7ki6G2`. A real local
  503 capture scrubbed every supplied and echoed secret, retained trace/path,
  exported one fixture, and replayed status/body/`Retry-After`. Wrong method was
  404; non-loopback bind, malformed policy, and populated output failed safely.
- Deployment identity: local/live hashes matched for `index.html`, `404.html`,
  `sw.js`, and all 14 built assets. JS SHA-256 is
  `db0ae7d79fea342970321f5dcb1478228c78cfa782dc66eec8fb09bc9f4e31d0`.
- Live browser QA: `/`, `/demo`, `/privacy`, `/terms` returned 200; unknown path
  returned a designed 404. All routes have correct metadata/semantics and zero
  serious/critical Axe findings. Successful routes had no console/page errors.
- Keyboard/mobile: complete demo flow works by keyboard with a 3 px visible
  focus ring; 390 px targets meet 44 px; 195 px reflow has no overflow;
  reduced-motion is respected.
- Privacy/PWA: whole demo flow made only same-origin requests, isolated its one
  `demo:` session key, preserved real-data sentinels, and reloaded offline with
  the sample intact after a service-worker update check.
- Security/cache: HSTS, self-only CSP, `nosniff`, strict referrer policy, and
  restrictive permissions policy are live. HTML/service worker use 30-second
  revalidation; hashed assets use one-year immutable caching.
- Budgets: JS 13,980 bytes (5,090 gzip), CSS 12,997 bytes (3,777 gzip), fonts
  75,792 bytes, mobile hero 19,982 bytes, desktop hero 63,102 bytes.
- Lighthouse 13 mobile: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.23 s, TBT 13 ms, CLS 0.0032.

Full findings and evidence are in `.factory/verification-5.md`.

## How to reproduce

```sh
npm ci
jq -r '.[].test' .factory/claims.json
npm test
npm run typecheck
npm run lint
cargo fmt --all -- --check
npm run build
cargo package --locked
target/release/boundary-replay demo
```

## Known gaps and next steps

None for release. The product has no deployed API, paid unlock, sign-in, AI
runtime, or backend, so API throttling and Entra checks do not apply. Publishing
the crate remains a factory release action; no registry publication was
performed during verification.
