# Demo sandbox

- Browser: `/demo` or `?demo=1`; both enter the same isolated sample workspace
  in one click from the first screen.
- CLI: `boundary-replay demo`.
- Sample: one `payment.failed` webhook with a trace ID, four redactions, and a
  recorded 503 response.
- Reset: use **Reset demo** in the banner. CLI demos create a new temp folder
  by default. With `--out`, they refuse a non-empty directory, so they never
  read or overwrite an existing capture folder.
- Browser storage: session storage key
  `demo:incident-boundary-replay:state`. Leaving demo mode discards it. Real
  local storage is not read while the demo banner is active.
- Banner: **Demo — sample data, nothing is saved**, with **Reset demo** and
  **Start for real**. Reset recreates only the demo-prefixed session state.
- Source equivalence: `examples/sample-payment-webhook.json` supplies the
  request and response. `examples/boundary-replay.json` supplies the fields
  removed in both the CLI and browser samples.
- Verification starts from a fresh browser context or temp folder. No account
  or external network is needed for the demo.
