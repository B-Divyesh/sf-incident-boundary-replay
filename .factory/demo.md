# Demo sandbox

- Browser: `/demo` or `?demo=1`; both enter the same isolated sample workspace.
- CLI: `boundary-replay demo`.
- Sample: one `payment.failed` webhook with a trace ID, four redactions, and a
  recorded 503 response.
- Reset: use **Reset demo** in the banner. CLI demos create a new temp folder
  by default. With `--out`, they refuse a non-empty directory, so they never
  read or overwrite an existing capture folder.
- Browser storage: session storage key
  `demo:incident-boundary-replay:state`. Leaving demo mode discards it. Real
  local storage is not read while the demo banner is active.
- Verification starts from a fresh browser context or temp folder. No account
  or external network is needed for the demo.
