# Polish 3 — cumulative acceptance map

Candidate `9ca531ce8abc140c597e0456d3d27a5288966eef` was repaired against every
finding in reviews 1, 2, and 3. The final evidence paths and deployed revision
are recorded in the handoff after the live verification.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Declared Rust 1.88 and made the MSRV claim provision it before a locked build. | `@claim:msrv-build`; clean-clone claim run. |
| F-1-2 | Removed unbounded “safe” wording from the page, alt text, and README. | Copy audit; full browser suite. |
| F-1-3 | Tests the default demo folder, printed command, mock response, and now both landing transcripts. | `@claim:default-cli-demo`. |
| F-1-4 | Updates route-specific description, canonical, Open Graph, and Twitter metadata. | `routes update social metadata and the standalone 404 shares the site chrome`. |
| F-1-5 | Generates the HTTP 404 from the same Vite shell, header, footer, and fonts as product routes. | 404 chrome/routing tests; live missing-route check. |
| F-1-6 | First screen names backend engineers and queue, webhook, and third-party failures. | Mobile/desktop first-read test. |
| F-1-7 | Preview label names the localhost-mock outcome. | Copy audit. |
| F-1-8 | Preview heading names secret removal before export. | Copy audit. |
| F-1-9 | Workflow label names record, secret removal, and replay. | Copy audit; hash navigation test. |
| F-1-10 | Limits label names the product limits. | Copy audit. |
| F-1-11 | CLI and terminal proof say “four secret or personal-data fields.” | `@claim:default-cli-demo`. |
| F-1-12 | Adds a labelled selectable install command and actionable clipboard recovery. | Install-guidance browser test. |
| F-1-13 | Offline notice names the page and sample data. | `@claim:offline-demo`. |
| F-1-14 | Splits direct-route and missing-route README statements. | `@claim:deployed-routes`. |
| F-1-15 | README gives the exact locked package verification command. | `cargo package --allow-dirty --locked`. |
| F-1-16 | SPA and HTTP 404 use “Page not found” and “Return home.” | `@claim:deployed-routes`; live missing-route check. |
| F-2-1 | The MSRV claim self-provisions Rust 1.88 in a fresh worker. | `@claim:msrv-build`; clean-clone claim run. |
| F-2-2 | Inventoried production build outputs and asserts both the site and release binary. | `@claim:build-artifacts`. |
| F-2-3 | Inventoried direct routes and the real HTTP 404. | `@claim:deployed-routes`. |
| F-2-4 | Tests CLI and browser samples against both shipped example files. | `@claim:shipped-sample`. |
| F-2-5 | Replaced undefined landing implementation terms with plain actions and results. | Copy audit; full browser suite. |
| F-2-6 | Rewrote README installation and capture wording in plain language. | Copy audit. |
| F-2-7 | Introduces `loopback` with `127.0.0.1` and uses it consistently for the restriction. | `@claim:local-only-replay`; copy audit. |
| F-2-8 | Removed internal registry-publishing copy. | README audit. |
| F-3-1 | Replaced altered/invented terminal lines with one captured `boundary-replay demo` stdout transcript in HTML and SVG. The claim normalizes only the generated temp-folder ID and compares fresh stdout to both. | `@claim:default-cli-demo`; local and live screenshots in handoff. |
| F-3-2 | Uses the actual `IBM Plex Mono` family and builds the 404 through Vite so the same self-hosted face loads there. | `self-hosted IBM Plex Mono loads for the product body on landing and 404 routes`; live request check in handoff. |

The static product retains its luminous glass data-landscape identity: dark
instrument surfaces, cyan request paths, amber secret-removal signals, clipped
controls, and the original boundary artwork. It does not use a generic SaaS
template.
