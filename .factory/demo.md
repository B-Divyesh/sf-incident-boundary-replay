# Demo sandbox

- Browser: `/demo` or `?demo=1` through the canonical `/demo` link.
- CLI: `boundary-replay demo`.
- Sample: one `payment.failed` webhook with a trace ID, four redactions, and a
  recorded 503 response.
- Reset: use **Reset demo** in the banner. CLI demos always create a new temp
  folder and never read an existing capture folder.
- Browser storage: session storage key
  `demo:incident-boundary-replay:state`. Real local storage is not read while
  the demo banner is active. License storage is unrelated and never copied.
- Verification starts from a fresh browser context or temp folder. No account
  or external network is needed for the demo.
