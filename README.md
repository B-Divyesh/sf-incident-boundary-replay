# Boundary Replay

Capture an opted-in HTTP boundary, scrub secrets before disk, and export a
local mock bundle. It is for backend engineers reproducing queue, webhook, and
third-party failures without calling the original system.

Boundary Replay has no telemetry. Captures and bundles stay in paths you
choose. Replay and webhook send commands accept loopback targets only.

## Install

Build the single binary with Rust 1.85 or newer:

```sh
cargo install --path .
boundary-replay --help
```

The release-ready archive can be checked with `cargo package --allow-dirty`.
The factory owns registry publishing.

## Try the safe demo

```sh
boundary-replay demo
```

The command creates a temporary folder, records a realistic failed payment
webhook, redacts its secrets, exports a bundle, and prints the mock command.
It does not read your captures. The same sample is in `examples/`.

The browser walkthrough is available at `/demo` or
https://incident-boundary-replay.sociobot.in/demo.

## Capture a boundary

Start the sidecar and name each upstream host explicitly:

```sh
boundary-replay capture \
  --listen 127.0.0.1:8787 \
  --upstream http://127.0.0.1:9000 \
  --out ./captures \
  --redact ./boundary-replay.json
```

Point the opted-in client at `http://127.0.0.1:8787`. The sidecar forwards each
request, replaces selected headers and JSON fields in memory, then writes the
scrubbed exchange. Raw bodies never reach the capture folder.

Example policy:

```json
{
  "headers": ["authorization", "cookie", "set-cookie", "x-api-key"],
  "json_fields": ["email", "phone", "token", "secret", "card_number"]
}
```

## Export and run a mock

```sh
boundary-replay export --captures ./captures --out ./payment-failure.bundle
boundary-replay serve --bundle ./payment-failure.bundle --listen 127.0.0.1:9487
```

The local server matches method and path, then returns the recorded status,
headers, and body. It refuses non-loopback bind addresses.

## Send a signed webhook to a local service

```sh
export MOCK_SIGNING_SECRET='local-test-secret'
boundary-replay send \
  --bundle ./payment-failure.bundle \
  --fixture payment-webhook \
  --target http://127.0.0.1:3000/hooks/payment \
  --signing-secret-env MOCK_SIGNING_SECRET
```

`send` removes captured signature headers and signs the scrubbed body with
HMAC-SHA256. It refuses non-loopback targets, so a bundle cannot replay into a
production host.

## Script output

Add `--json` to `demo`, `export`, and `send` for machine-readable results.
Errors use a non-zero exit code and go to stderr.

## Develop and verify

```sh
cargo test
npm install
npm test
npm run build
```

`npm run build` compiles the site to `dist/site`. It also builds the Rust
release binary. Site source is under `site/`; browser tests use Playwright
1.58.2 and the shipped demo data.

## Deploy

Deploy `dist/site` as the static root. The included SPA fallback preserves
`/demo`, `/privacy`, `/terms`, and `/404` on direct loads.

## License

MIT. See [LICENSE](LICENSE). The optional Team Policy Pack is a one-time
purchase sold by Sociobot, the merchant of record.
