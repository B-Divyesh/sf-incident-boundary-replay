import '@fontsource-variable/space-grotesk/wght.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import './style.css';

const PRODUCT = 'incident-boundary-replay';
const DEMO_KEY = `demo:${PRODUCT}:state`;

type Route = '/' | '/demo' | '/privacy' | '/terms' | '/404';

const fixture = {
  id: 'payment-webhook',
  trace_id: '7ef92c1b45d04da6',
  request: {
    method: 'POST',
    path: '/webhooks/payment',
    headers: { authorization: '[REDACTED]', 'content-type': 'application/json', 'x-signature': '[REDACTED]' },
    body: { event: 'payment.failed', customer_email: '[REDACTED]', card_number: '[REDACTED]', invoice_id: 'inv_01JY7F3M6D', retry_count: 3 }
  },
  response: { status: 503, headers: { 'content-type': 'application/json', 'retry-after': '30' }, body: { code: 'upstream_timeout', retryable: true } },
  redactions: ['request.headers.authorization', 'request.headers.x-signature', 'request.body.customer_email', 'request.body.card_number']
};

function esc(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]!));
}

function routeFromPath(): Route {
  if (location.pathname === '/' && new URLSearchParams(location.search).get('demo') === '1') {
    history.replaceState({}, '', '/demo');
  }
  return ['/', '/demo', '/privacy', '/terms', '/404'].includes(location.pathname) ? location.pathname as Route : '/404';
}

function header(): string {
  return `<a class="skip" href="#main">Skip to content</a>
    <header class="topbar">
      <a class="wordmark" href="/" data-link aria-label="BR Boundary Replay home"><span class="mark" aria-hidden="true">BR</span><span>Boundary Replay</span></a>
      <nav aria-label="Primary"><a href="/demo" data-link>Demo</a><a href="/#how">How it works</a><a href="/privacy" data-link>Privacy</a></nav><span class="network-state" hidden aria-live="polite">Offline — the saved shell remains available</span>
    </header>`;
}

function footer(): string {
  return `<footer><p>Capture a scrubbed boundary. Replay it locally.</p><div><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external)</span></a></div><p>v0.1.0 · build 2026.08.28</p></footer>`;
}

function landing(): string {
  return `${header()}<main id="main">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow"><span></span> Incident boundary capture</p>
        <h1 tabindex="-1">Capture failures. Replay them safely on localhost.</h1>
        <p class="lede">For backend engineers who need the failed boundary, not another trace.</p>
        <div class="hero-actions"><a class="button primary" href="/demo" data-link>Try it with sample data</a><span>See a scrubbed failed webhook and its local response.</span></div>
        <ul class="facts" aria-label="Product facts"><li>Redacts before disk</li><li>Replays only on localhost</li><li>Free local exporter</li></ul>
      </div>
      <figure class="landscape">
        <picture><source media="(max-width: 760px)" srcset="/assets/boundary-landscape-640.webp" /><img src="/assets/boundary-landscape.webp" width="1152" height="768" fetchpriority="high" alt="Request paths cross a glass redaction boundary and emerge as safe local fixtures." /></picture>
        <figcaption><span>PRODUCTION EDGE</span><span>SCRUB</span><span>LOCAL MOCK</span></figcaption>
      </figure>
    </section>
    <section class="live-preview" aria-labelledby="preview-heading">
      <div class="section-index"><span>01</span><p>One failure, isolated</p></div>
      <div>
        <p class="eyebrow">Real CLI output</p><h2 id="preview-heading">Keep the boundary. Drop the secrets.</h2>
        <div class="terminal" role="region" aria-label="Boundary Replay terminal recording">
          <div class="terminal-bar"><span></span><span></span><span></span><b>boundary-replay demo</b></div>
          <pre><code><span class="prompt">$</span> boundary-replay demo
Demo — isolated sample data; no existing captures were read or changed.
<span class="amber">Scrubbed 4 secret or PII field(s) before disk.</span>
Bundle: /tmp/.../payment-failure.bundle
<span class="green">Run: boundary-replay serve --bundle … --listen 127.0.0.1:9487</span></code></pre>
        </div>
        <img class="recording-proof" src="/assets/terminal-recording.svg" width="960" height="180" loading="lazy" alt="A terminal recording shows the demo command capturing, scrubbing, and exporting one fixture." />
        <div class="install-actions"><button class="copy-command" type="button" data-copy="git clone https://github.com/B-Divyesh/sf-incident-boundary-replay.git && cd sf-incident-boundary-replay && cargo install --path .">Copy install command</button><a href="https://github.com/B-Divyesh/sf-incident-boundary-replay" rel="external">View source <span class="sr-only">(external)</span></a></div><span class="copy-status" aria-live="polite"></span>
      </div>
    </section>
    <section class="how" id="how" aria-labelledby="how-heading">
      <div class="section-index"><span>02</span><p>A short path back to the bug</p></div>
      <div><h2 id="how-heading">How the boundary becomes a fixture</h2>
        <ol class="steps">
          <li><span>Capture</span><h3>Opt in one client</h3><p>Point that client at the sidecar to capture its boundary.</p></li>
          <li><span>Scrub</span><h3>Replace selected values</h3><p>Headers and JSON fields are replaced in memory before any write.</p></li>
          <li><span>Replay</span><h3>Run the local mock</h3><p>Match the recorded method and path. Return the failed response locally.</p></li>
        </ol>
      </div>
    </section>
    <section class="limits" aria-labelledby="limits-heading">
      <div class="section-index"><span>03</span><p>The safety boundary</p></div>
      <div><h2 id="limits-heading">Production replay is not a feature</h2><p>Capture starts only when you run the sidecar. Mock servers and webhook sends refuse non-local targets. New mock signatures use a secret from your environment.</p></div>
    </section>
  </main>${footer()}`;
}

function demo(): string {
  sessionStorage.setItem(DEMO_KEY, JSON.stringify({ fixture: fixture.id, stage: 'exported' }));
  return `${header()}<div class="demo-banner" role="status"><span>Demo — sample data, nothing is saved</span><div><button type="button" data-reset>Reset demo</button><a href="/" data-link data-exit-demo>Start for real</a></div></div>
    <main id="main" class="demo-main">
      <section class="demo-head"><p class="eyebrow">Sample trace 7ef92c1b45d04da6</p><h1 tabindex="-1">Inspect a scrubbed payment failure</h1><p>This sample is already captured. Move across the boundary to see what the local service receives.</p></section>
      <section class="boundary-workbench" aria-label="Sample boundary exchange">
        <div class="lane"><p class="lane-label">01 · CAPTURED</p><h2>Failed webhook</h2><dl><div><dt>Method</dt><dd>POST</dd></div><div><dt>Path</dt><dd>/webhooks/payment</dd></div><div><dt>Event</dt><dd>payment.failed</dd></div></dl><button type="button" data-stage="capture">Inspect capture</button></div>
        <div class="boundary-pane"><p class="lane-label">02 · SCRUBBED</p><h2>4 values replaced</h2><ul><li>Authorization</li><li>Signature</li><li>Customer email</li><li>Card number</li></ul><div class="shard" aria-hidden="true"></div></div>
        <div class="lane response"><p class="lane-label">03 · LOCAL MOCK</p><h2>503 response</h2><pre><code>{
  "code": "upstream_timeout",
  "retryable": true
}</code></pre><button type="button" data-stage="response">Test local response</button></div>
      </section>
      <section class="demo-output" aria-live="polite"><p class="status-dot">Ready</p><p>The bundle matches <code>POST /webhooks/payment</code> and returns status 503.</p><button class="button primary" type="button" data-export>Export sample bundle</button><p class="export-status"></p></section>
      <noscript>This browser demo needs JavaScript. The CLI demo works without it.</noscript>
    </main>${footer()}`;
}

function privacy(): string {
  return `${header()}<main id="main" class="prose"><p class="eyebrow">Policy · 28 August 2026</p><h1 tabindex="-1">Your captures stay in your chosen folder</h1><h2>CLI data</h2><p>Boundary Replay sends no telemetry. It writes scrubbed captures and bundles only to paths you choose.</p><h2>Browser data</h2><p>The demo uses session storage under a <code>demo:</code> key. Leaving demo mode discards that sample state.</p><h2>Contact</h2><p>Questions can go to <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p></main>${footer()}`;
}

function terms(): string {
  return `${header()}<main id="main" class="prose"><p class="eyebrow">Terms · 28 August 2026</p><h1 tabindex="-1">Use Boundary Replay on systems you control</h1><h2>Safe use</h2><p>You must have permission to capture each service boundary. Review redaction policies before handling production traffic.</p><h2>Free software</h2><p>The CLI is provided under the MIT License without warranty.</p><h2>Limits</h2><p>Redaction rules reduce exposure but cannot identify every secret. You remain responsible for each exported bundle.</p></main>${footer()}`;
}

function notFound(): string {
  return `${header()}<main id="main" class="not-found"><p class="error-code">404 · NO MATCHING FIXTURE</p><h1 tabindex="-1">This route crossed the wrong boundary</h1><p>The page was not found. Return to the capture path.</p><a class="button primary" href="/" data-link>Return home</a></main>${footer()}`;
}

const routeMeta: Record<Route, [string, string]> = {
  '/': ['Boundary Replay — replay failed HTTP boundaries', 'Capture an opted-in HTTP exchange, scrub secrets before disk, and export a runnable local mock.'],
  '/demo': ['Demo — Boundary Replay', 'Inspect a sample failed webhook, its redactions, and its local mock response.'],
  '/privacy': ['Privacy — Boundary Replay', 'How Boundary Replay handles captures and isolated demo state.'],
  '/terms': ['Terms — Boundary Replay', 'Terms for the Boundary Replay CLI.'],
  '/404': ['Not found — Boundary Replay', 'This Boundary Replay page could not be found.']
};

function render(focus = true): void {
  const route = routeFromPath();
  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.innerHTML = route === '/' ? landing() : route === '/demo' ? demo() : route === '/privacy' ? privacy() : route === '/terms' ? terms() : notFound();
  document.title = routeMeta[route][0];
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = routeMeta[route][1];
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = `https://incident-boundary-replay.sociobot.in${route === '/404' ? '/404' : route}`;
  bindEvents();
  syncNetworkState();
  requestAnimationFrame(() => {
    const target = location.hash ? document.querySelector<HTMLElement>(location.hash) : null;
    if (target) {
      target.tabIndex = -1;
      const savedScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      target.scrollIntoView({ block: 'start' });
      document.documentElement.style.scrollBehavior = savedScrollBehavior;
      target.focus();
    } else if (focus) {
      document.querySelector<HTMLElement>('h1')?.focus();
    }
  });
}

function navigate(path: string): void {
  history.pushState({}, '', path);
  if (!location.hash) window.scrollTo(0, 0);
  render(!location.hash);
}

function bindEvents(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach(link => link.addEventListener('click', event => {
    if (link.origin === location.origin) {
      if (link.hasAttribute('data-exit-demo')) sessionStorage.removeItem(DEMO_KEY);
      event.preventDefault(); navigate(link.pathname + link.search + link.hash);
    }
  }));
  document.querySelector<HTMLButtonElement>('[data-copy]')?.addEventListener('click', async event => {
    const button = event.currentTarget as HTMLButtonElement;
    try {
      await navigator.clipboard.writeText(button.dataset.copy!);
      document.querySelector<HTMLElement>('.copy-status')!.textContent = ' Copied.';
    } catch { document.querySelector<HTMLElement>('.copy-status')!.textContent = ' Copy failed. Select the command above.'; }
  });
  document.querySelector<HTMLButtonElement>('[data-reset]')?.addEventListener('click', () => {
    sessionStorage.removeItem(DEMO_KEY); render(false);
    document.querySelector<HTMLElement>('.demo-head h1')?.focus();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-stage]').forEach(button => button.addEventListener('click', () => {
    const message = button.dataset.stage === 'capture' ? 'The saved capture contains four [REDACTED] values.' : 'The local mock returned 503 with retryable set to true.';
    document.querySelector<HTMLElement>('.demo-output > p:nth-child(2)')!.textContent = message;
  }));
  document.querySelector<HTMLButtonElement>('[data-export]')?.addEventListener('click', () => {
    const bundle = { manifest: { schema_version: 1, fixture_count: 1, fixtures: ['payment-webhook.json'] }, fixtures: [fixture] };
    const url = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'payment-failure.bundle.json'; link.click(); URL.revokeObjectURL(url);
    document.querySelector<HTMLElement>('.export-status')!.textContent = 'Exported one scrubbed fixture.';
  });
}

function syncNetworkState(): void {
  const state = document.querySelector<HTMLElement>('.network-state');
  if (state) state.hidden = navigator.onLine;
}

document.addEventListener('click', event => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="/#"]');
  if (link && location.pathname !== '/') { event.preventDefault(); navigate(link.getAttribute('href')!); }
});
window.addEventListener('popstate', () => render());
window.addEventListener('online', syncNetworkState);
window.addEventListener('offline', syncNetworkState);
render(false);

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
