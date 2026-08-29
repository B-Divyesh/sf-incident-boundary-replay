# Boundary Replay

Record selected HTTP requests and responses, remove secrets before saving, and
export a localhost mock. It is for backend engineers reproducing queue, webhook, and
third-party failures without calling the original system.

Boundary Replay sends no telemetry during its local demo flow. Recorded requests and
exports are written only under output folders you name. Mock servers and webhook
sends accept loopback addresses such as `127.0.0.1` only. They never follow redirects.

## Install

Build the single binary with Rust 1.88 or newer:

```sh
rustup toolchain install 1.88.0 --profile minimal
rustup run 1.88.0 cargo install --path . --locked
boundary-replay --help
```

Check the package archive with `cargo package --allow-dirty --locked`.

## Run the sample demo

```sh
boundary-replay demo
```

The demo creates a temporary folder with a failed-payment sample whose selected secrets are removed.
It prints the command that starts the local mock. With `--out`, it accepts
only a new or empty folder. It never reads or changes an existing capture
folder. `examples/sample-payment-webhook.json` supplies the request and response.
`examples/boundary-replay.json` lists the fields removed from that sample.

The browser walkthrough is available at `/demo` or
https://incident-boundary-replay.sociobot.in/demo.

## Record an HTTP failure

Start Boundary Replay and name the service that receives the request:

```sh
boundary-replay capture \
  --listen 127.0.0.1:8787 \
  --upstream http://127.0.0.1:9000 \
  --out ./captures \
  --redact ./boundary-replay.json
```

Point the selected client at `http://127.0.0.1:8787`. Boundary Replay forwards
each request. It replaces selected headers and JSON fields before saving the
request and response. Unredacted request and response bodies are not saved in
the capture folder.

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

`export --out` accepts a new or empty folder only. It refuses a populated
folder before changing any file. The local server matches method and path, then
returns the recorded status, headers, and body. It accepts loopback bind
addresses only.

## Send a signed webhook to a loopback service

```sh
export MOCK_SIGNING_SECRET='local-test-secret'
boundary-replay send \
  --bundle ./payment-failure.bundle \
  --fixture payment-webhook \
  --target http://127.0.0.1:3000/hooks/payment \
  --signing-secret-env MOCK_SIGNING_SECRET
```

`send` removes captured signature headers and signs the cleaned body with
HMAC-SHA256. It accepts loopback targets only and returns redirects without
following them, so a bundle cannot replay into a production host.

## Script output

Add `--json` to `demo`, `export`, and `send` for machine-readable results.
Errors use a non-zero exit code and go to stderr.

## Develop and verify

```sh
cargo test
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

`npm run build` compiles the site to `dist/site`. It also builds the Rust
release binary. Site source is under `site/`; browser tests use Playwright
1.58.2 and the shipped demo data.

## Deploy

Deploy `dist/site` as the static root. Static Web Apps preserves `/demo`,
`/privacy`, and `/terms` on direct loads. Unknown URLs return the designed HTTP
404 page.

## License

MIT. See [LICENSE](LICENSE).
