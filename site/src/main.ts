import '@fontsource-variable/space-grotesk/wght.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import './style.css';

const PRODUCT = 'incident-boundary-replay';
const LICENSE_KEY = `sb_license:${PRODUCT}`;
const VERDICT_KEY = `${LICENSE_KEY}:verdict`;
const DEMO_KEY = `demo:${PRODUCT}:state`;
const API = 'https://api.sociobot.in/api/v1';
const TEAM_PACK = {
  pack: 'Boundary Replay Team Policy Pack', version: '2026.08',
  policies: {
    payments: { headers: ['authorization', 'x-signature'], json_fields: ['card_number', 'customer_email', 'client_secret'] },
    messaging: { headers: ['authorization', 'x-api-key'], json_fields: ['phone', 'message_body', 'media_url'] },
    identity: { headers: ['authorization', 'cookie'], json_fields: ['email', 'password', 'access_token', 'refresh_token'] },
    support: { headers: ['authorization'], json_fields: ['email', 'phone', 'message', 'attachment_url'] }
  }
};

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
      <a class="wordmark" href="/" data-link aria-label="Boundary Replay home"><span class="mark" aria-hidden="true">BR</span><span>Boundary Replay</span></a>
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
        <img src="/assets/boundary-landscape.webp" width="1152" height="768" fetchpriority="high" alt="Request paths cross a glass redaction boundary and emerge as safe local fixtures." />
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
Demo — sample data, nothing was read from your captures.
<span class="amber">Scrubbed 4 secret or PII field(s) before disk.</span>
Bundle: /tmp/.../payment-failure.bundle
<span class="green">Run: boundary-replay serve --bundle … --listen 127.0.0.1:9487</span></code></pre>
        </div>
        <img class="recording-proof" src="/assets/terminal-recording.svg" width="960" height="180" loading="lazy" alt="A terminal recording shows the demo command capturing, scrubbing, and exporting one fixture." />
        <button class="copy-command" type="button" data-copy="cargo install --path .">Copy install command</button><span class="copy-status" aria-live="polite"></span>
      </div>
    </section>
    <section class="how" id="how" aria-labelledby="how-heading">
      <div class="section-index"><span>02</span><p>A short path back to the bug</p></div>
      <div><h2 id="how-heading">How the boundary becomes a fixture</h2>
        <ol class="steps">
          <li><span>Capture</span><h3>Opt in one client</h3><p>Point that client at the sidecar. Other traffic stays untouched.</p></li>
          <li><span>Scrub</span><h3>Replace selected values</h3><p>Headers and JSON fields are replaced in memory before any write.</p></li>
          <li><span>Replay</span><h3>Run the local mock</h3><p>Match the recorded method and path. Return the failed response locally.</p></li>
        </ol>
      </div>
    </section>
    <section class="limits" aria-labelledby="limits-heading">
      <div class="section-index"><span>03</span><p>The safety boundary</p></div>
      <div><h2 id="limits-heading">Production replay is not a feature</h2><p>Capture starts only when you run the sidecar. Mock servers and webhook sends refuse non-local targets. New mock signatures use a secret from your environment.</p></div>
    </section>
    ${pricing()}
  </main>${footer()}`;
}

function pricing(): string {
  return `<section class="pricing" aria-labelledby="pricing-heading">
    <div class="section-index"><span>04</span><p>Optional team rules</p></div>
    <div><p class="eyebrow">One-time purchase</p><h2 id="pricing-heading">Use one policy across services</h2><p class="price"><span>$49</span> Team Policy Pack</p><p>Includes maintained payment, messaging, identity, and support redaction policies. The free exporter stays complete.</p>
      <div class="price-actions"><a class="button secondary" href="https://api.sociobot.in/api/v1/products/incident-boundary-replay/checkout">Buy the policy pack</a><button class="text-button" type="button" data-show-license>Have a license? Paste it</button></div>
      <form class="license-form" hidden><label for="license">License token</label><div><input id="license" name="license" autocomplete="off" /><button type="submit">Verify license</button></div><p class="license-status" aria-live="polite"></p></form>
      <div class="paid-download" hidden><p>License active on this device.</p><a download="boundary-replay-team-policies.json" href="#" data-team-download>Download team policies</a></div>
      <p class="legal-note">Sociobot is the merchant of record. See <a href="/terms" data-link>terms</a> and <a href="/privacy" data-link>privacy</a>.</p>
    </div>
  </section>`;
}

function demo(): string {
  sessionStorage.setItem(DEMO_KEY, JSON.stringify({ fixture: fixture.id, stage: 'exported' }));
  return `${header()}<div class="demo-banner" role="status"><span>Demo — sample data, nothing is saved</span><div><button type="button" data-reset>Reset demo</button><a href="/" data-link>Start for real</a></div></div>
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
  return `${header()}<main id="main" class="prose"><p class="eyebrow">Policy · 28 August 2026</p><h1 tabindex="-1">Your captures stay in your chosen folder</h1><h2>CLI data</h2><p>Boundary Replay sends no telemetry. It writes scrubbed captures and bundles only to paths you choose.</p><h2>Browser data</h2><p>The demo uses session storage under a <code>demo:</code> key. Closing the tab removes it. A license token is stored in local storage after you paste it or return from checkout.</p><h2>License checks</h2><p>License verification sends the token to Sociobot at <code>api.sociobot.in</code> at most once per day. No capture content is sent.</p><h2>Contact</h2><p>Questions can go to <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p></main>${footer()}`;
}

function terms(): string {
  return `${header()}<main id="main" class="prose"><p class="eyebrow">Terms · 28 August 2026</p><h1 tabindex="-1">Use Boundary Replay on systems you control</h1><h2>Safe use</h2><p>You must have permission to capture each service boundary. Review redaction policies before handling production traffic.</p><h2>Free software</h2><p>The CLI is provided under the MIT License without warranty.</p><h2>Team Policy Pack</h2><p>The Team Policy Pack costs $49 once. Sociobot is the merchant of record. Refunds are handled by Sociobot and revoke the license.</p><h2>Limits</h2><p>Redaction rules reduce exposure but cannot identify every secret. You remain responsible for each exported bundle.</p></main>${footer()}`;
}

function notFound(): string {
  return `${header()}<main id="main" class="not-found"><p class="error-code">404 · NO MATCHING FIXTURE</p><h1 tabindex="-1">This route crossed the wrong boundary</h1><p>The page was not found. Return to the capture path.</p><a class="button primary" href="/" data-link>Return home</a></main>${footer()}`;
}

const routeMeta: Record<Route, [string, string]> = {
  '/': ['Boundary Replay — replay failed HTTP boundaries', 'Capture an opted-in HTTP exchange, scrub secrets before disk, and export a runnable local mock.'],
  '/demo': ['Demo — Boundary Replay', 'Inspect a sample failed webhook, its redactions, and its local mock response.'],
  '/privacy': ['Privacy — Boundary Replay', 'How Boundary Replay handles captures, demo state, and license tokens.'],
  '/terms': ['Terms — Boundary Replay', 'Terms for the Boundary Replay CLI and optional Team Policy Pack.'],
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
  void updateLicenseUI();
  syncNetworkState();
  if (focus) requestAnimationFrame(() => document.querySelector<HTMLElement>('h1')?.focus());
}

function navigate(path: string): void {
  history.pushState({}, '', path);
  window.scrollTo(0, 0);
  render();
}

function bindEvents(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach(link => link.addEventListener('click', event => {
    if (link.origin === location.origin) { event.preventDefault(); navigate(link.pathname + link.search + link.hash); }
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
  document.querySelector<HTMLButtonElement>('[data-show-license]')?.addEventListener('click', () => {
    const form = document.querySelector<HTMLFormElement>('.license-form')!; form.hidden = false; form.querySelector('input')?.focus();
  });
  document.querySelector<HTMLFormElement>('.license-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const token = new FormData(event.currentTarget as HTMLFormElement).get('license')?.toString().trim();
    if (!token) { setLicenseStatus('Paste a license token, then verify it.'); return; }
    setLicenseStatus('Checking this license…');
    localStorage.setItem(LICENSE_KEY, token); await verifyLicense(token, true); await updateLicenseUI();
  });
  document.querySelector<HTMLAnchorElement>('[data-team-download]')?.addEventListener('click', event => {
    event.preventDefault();
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as { valid?: boolean } | null;
    if (!verdict?.valid) { setLicenseStatus('Verify an active license before downloading the policy pack.'); return; }
    const url = URL.createObjectURL(new Blob([JSON.stringify(TEAM_PACK, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'boundary-replay-team-policies.json'; link.click(); URL.revokeObjectURL(url);
  });
}

function setLicenseStatus(message: string): void {
  const status = document.querySelector<HTMLElement>('.license-status'); if (status) status.textContent = message;
}

async function verifyLicense(token: string, force = false): Promise<boolean> {
  const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as { valid: boolean; checked: number } | null;
  if (!force && cached && Date.now() - cached.checked < 86_400_000) return cached.valid;
  try {
    const response = await fetch(`${API}/products/${PRODUCT}/verify?license=${encodeURIComponent(token)}`);
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checked: Date.now() }));
    if (!result.valid) setLicenseStatus('This license is no longer active. Buy a new license to restore the pack.');
    return result.valid;
  } catch {
    setLicenseStatus('The license check could not connect. Try again when you are online.');
    return cached?.valid ?? false;
  }
}

async function updateLicenseUI(): Promise<void> {
  const query = new URLSearchParams(location.search); const returned = query.get('license');
  if (returned) { localStorage.setItem(LICENSE_KEY, returned); query.delete('license'); history.replaceState({}, '', `${location.pathname}${query.size ? `?${query}` : ''}`); }
  const token = localStorage.getItem(LICENSE_KEY); if (!token) return;
  const valid = await verifyLicense(token, Boolean(returned));
  document.querySelector<HTMLElement>('.paid-download')?.toggleAttribute('hidden', !valid);
  if (valid) setLicenseStatus('License verified. The policy pack is ready.');
  else {
    const form = document.querySelector<HTMLFormElement>('.license-form');
    if (form) form.hidden = false;
    if (!document.querySelector<HTMLElement>('.license-status')?.textContent) setLicenseStatus('This license is not active. Paste another token or buy a license.');
  }
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
