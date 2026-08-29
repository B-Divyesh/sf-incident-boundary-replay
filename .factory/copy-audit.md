# Copy audit — polish 3 — 2026-08-29

Whitespace-separated counts cover every visitor-facing landing unit, including
the terminal transcript, image alt text, actions, status text, and footer.
Every unit is 22 words or fewer. No banned marketing term appears.

## Landing page

| Copy | Words |
|---|---:|
| Skip to content | 3 |
| Boundary Replay | 2 |
| Demo | 1 |
| How it works | 3 |
| Privacy | 1 |
| Capture HTTP failures. Replay them on localhost. | 7 |
| For backend engineers reproducing failed queue, webhook, and third-party requests. | 10 |
| Try it with sample data | 5 |
| See a failed webhook with selected secrets removed. | 8 |
| Removes secrets before saving | 4 |
| Accepts loopback addresses such as 127.0.0.1 only | 7 |
| Free local exporter | 3 |
| Cyan request paths cross an amber redaction layer toward a local mock. | 12 |
| Production edge | 2 |
| Remove secrets | 2 |
| Local mock | 2 |
| A captured failure becomes a localhost mock. | 7 |
| CLI output from boundary-replay demo | 4 |
| Remove selected secrets before export. | 5 |
| boundary-replay demo | 2 |
| Demo — isolated sample data; no existing captures were read or changed. | 12 |
| Scrubbed four secret or personal-data fields before disk. | 8 |
| Bundle: /tmp/boundary-replay-demo-0ad0e8a4/payment-failure.bundle | 2 |
| Run: boundary-replay serve --bundle /tmp/boundary-replay-demo-0ad0e8a4/payment-failure.bundle --listen 127.0.0.1:9487 | 7 |
| A captured terminal transcript from the shipped demo command. | 9 |
| Install command | 2 |
| Copy install command | 3 |
| View source | 2 |
| Copied. | 1 |
| Copy failed. Select the install command shown above. | 8 |
| Capture, remove secrets, and replay an HTTP failure. | 8 |
| How to capture, remove secrets, and replay a failure | 9 |
| Capture | 1 |
| Opt in one client | 4 |
| Route one client through Boundary Replay to record its request and response. | 12 |
| Remove secrets | 2 |
| Replace selected values | 3 |
| Headers and JSON fields are replaced in memory before any write. | 11 |
| Replay | 1 |
| Run the local mock | 4 |
| Match the recorded method and path. | 6 |
| Return the failed response locally. | 5 |
| What Boundary Replay will not do. | 6 |
| Production replay is not a feature | 6 |
| Recording starts only when you run the capture command. | 9 |
| Mock servers and webhook sends accept loopback targets only. | 9 |
| New mock signatures use a secret from your environment. | 9 |
| Offline — this page and its sample data remain available. | 10 |
| Record a failed HTTP exchange. Replay it on localhost. | 9 |
| Terms | 1 |
| Built by Param Factory | 4 |
| v0.1.0 · build 2026.08.29 | 4 |

The terminal lines are a captured stdout transcript. The test normalizes only
the generated temporary-folder ID before comparing fresh CLI stdout with both
the HTML and SVG proof.

## README

Code blocks are executable examples and are excluded. All headings and prose
sentences are 20 words or fewer. The longest sentence explains that loopback
targets reject redirects before a bundle could reach a production host.

## Terminology

| Concept | One term |
|---|---|
| The user action | record |
| The executable recording operation | `capture` command |
| Removing configured values | remove secrets |
| The enforced network restriction | loopback |
| Where the mock runs | localhost |
| The browser sample | demo |
| The exported runnable result | localhost mock |
