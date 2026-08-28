import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { createHmac } from 'node:crypto';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync, spawn, spawnSync } from 'node:child_process';

const binary = resolve('target/debug/boundary-replay');

function tempFolder(): string {
  return mkdtempSync(join(tmpdir(), 'boundary-replay-test-'));
}

function makeDemo(root: string): string {
  const result = spawnSync(binary, ['demo', '--out', root, '--json'], { encoding: 'utf8' });
  expect(result.status, result.stderr).toBe(0);
  return join(root, 'payment-failure.bundle');
}

function runBinary(args: string[], env: NodeJS.ProcessEnv = process.env): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise(resolveRun => {
    const child = spawn(binary, args, { env });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('close', code => resolveRun({ code, stdout, stderr }));
  });
}

async function freeLoopbackPort(): Promise<number> {
  const server = createServer();
  await new Promise<void>(resolveListen => server.listen(0, '127.0.0.1', resolveListen));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('could not reserve a loopback port');
  await new Promise<void>(resolveClose => server.close(() => resolveClose()));
  return address.port;
}

test('@claim:redact-before-disk capture sidecar writes only scrubbed data', async () => {
  const root = tempFolder();
  const upstream = createServer((request, response) => {
    request.resume();
    request.on('end', () => {
      response.writeHead(502, { 'content-type': 'application/json', 'set-cookie': 'session=private' });
      response.end(JSON.stringify({ code: 'declined', email: 'ops@example.com' }));
    });
  });
  await new Promise<void>(resolveListen => upstream.listen(0, '127.0.0.1', resolveListen));
  const address = upstream.address();
  if (!address || typeof address === 'string') throw new Error('upstream has no port');
  const sidecar = spawn(binary, ['capture', '--listen', '127.0.0.1:18787', '--upstream', `http://127.0.0.1:${address.port}`, '--out', root], { stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await new Promise<void>((resolveReady, reject) => {
      const timeout = setTimeout(() => reject(new Error('capture sidecar did not start')), 5000);
      sidecar.stdout.on('data', chunk => { if (chunk.toString().includes('capturing opted-in traffic')) { clearTimeout(timeout); resolveReady(); } });
      sidecar.on('exit', code => reject(new Error(`capture sidecar stopped with ${code}`)));
    });
    const response = await fetch('http://127.0.0.1:18787/webhooks/payment', {
      method: 'POST',
      headers: { authorization: 'Bearer private-token', 'content-type': 'application/json', 'x-trace-id': 'trace-test-1' },
      body: JSON.stringify({ event: 'payment.failed', customer_email: 'maya.chen@example.com', card_number: '4242424242424242' })
    });
    expect(response.status).toBe(502);
    const captures = readdirSync(root);
    expect(captures).toHaveLength(1);
    const saved = readFileSync(join(root, captures[0]), 'utf8');
    expect(saved).toContain('[REDACTED]');
    expect(saved).not.toContain('maya.chen@example.com');
    expect(saved).not.toContain('4242424242424242');
    expect(saved).not.toContain('private-token');
    expect(saved).not.toContain('session=private');
    expect(saved).not.toContain('ops@example.com');
  } finally {
    sidecar.kill('SIGINT');
    await new Promise<void>(resolveClose => upstream.close(() => resolveClose()));
    rmSync(root, { recursive: true, force: true });
  }
});

test('@claim:local-only-replay never follows 301, 302, 303, 307, or 308 redirects', async () => {
  const bind = spawnSync(binary, ['serve', '--bundle', '/tmp/missing', '--listen', '0.0.0.0:9487'], { encoding: 'utf8' });
  expect(bind.status).not.toBe(0);
  expect(bind.stderr).toContain('refusing non-loopback address');
  const nonLocal = spawnSync(binary, ['send', '--bundle', '/tmp/missing', '--fixture', 'x', '--target', 'https://example.com/hook', '--signing-secret-env', 'TEST_SECRET'], { encoding: 'utf8' });
  expect(nonLocal.status).not.toBe(0);
  expect(nonLocal.stderr).toContain('refusing non-local target');
  const root = tempFolder();
  const bundle = makeDemo(root);
  const redirectedBodies: string[] = [];
  const receiver = createServer((request, response) => {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => { redirectedBodies.push(body); response.writeHead(202); response.end('unexpected'); });
  });
  await new Promise<void>(resolveListen => receiver.listen(0, '127.0.0.1', resolveListen));
  const receiverAddress = receiver.address();
  if (!receiverAddress || typeof receiverAddress === 'string') throw new Error('redirect receiver has no port');
  const redirector = createServer((request, response) => {
    const status = Number(request.url?.slice(1));
    response.writeHead(status, { location: `http://127.0.0.1:${receiverAddress.port}/outside-boundary` });
    response.end('redirect denied');
  });
  await new Promise<void>(resolveListen => redirector.listen(0, '127.0.0.1', resolveListen));
  const redirectAddress = redirector.address();
  if (!redirectAddress || typeof redirectAddress === 'string') throw new Error('redirector has no port');
  const sidecarPort = await freeLoopbackPort();
  const sidecar = spawn(binary, ['capture', '--listen', `127.0.0.1:${sidecarPort}`, '--upstream', `http://127.0.0.1:${redirectAddress.port}`, '--out', join(root, 'captured')], { stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await new Promise<void>((resolveReady, reject) => {
      const timeout = setTimeout(() => reject(new Error('capture sidecar did not start')), 5000);
      sidecar.stdout.on('data', chunk => { if (chunk.toString().includes('capturing opted-in traffic')) { clearTimeout(timeout); resolveReady(); } });
      sidecar.on('exit', code => reject(new Error(`capture sidecar stopped with ${code}`)));
    });
    for (const status of [301, 302, 303, 307, 308]) {
      const capture = await fetch(`http://127.0.0.1:${sidecarPort}/${status}`, { method: 'POST', body: `raw-secret-${status}`, redirect: 'manual' });
      expect(capture.status).toBe(status);
      const result = await runBinary(['send', '--bundle', bundle, '--fixture', 'payment-webhook', '--target', `http://127.0.0.1:${redirectAddress.port}/${status}`, '--signing-secret-env', 'TEST_SIGNING_SECRET', '--json'], { ...process.env, TEST_SIGNING_SECRET: 'test-secret' });
      expect(result.code, result.stderr).toBe(0);
      expect(JSON.parse(result.stdout).status).toBe(status);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(redirectedBodies).toEqual([]);
  } finally {
    sidecar.kill('SIGINT');
    await Promise.all([
      new Promise<void>(resolveClose => redirector.close(() => resolveClose())),
      new Promise<void>(resolveClose => receiver.close(() => resolveClose()))
    ]);
    rmSync(root, { recursive: true, force: true });
  }
});

test('@claim:cli-demo-isolation refuses non-empty output folders and never changes their captures', () => {
  const root = tempFolder();
  const captures = join(root, 'captures');
  const existing = join(captures, 'payment-webhook.json');
  mkdirSync(captures, { recursive: true });
  writeFileSync(existing, '{"invoice_id":"preexisting-private-id"}');
  const before = readFileSync(existing, 'utf8');
  try {
    const result = spawnSync(binary, ['demo', '--out', root, '--json'], { encoding: 'utf8' });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('is not empty');
    expect(readFileSync(existing, 'utf8')).toBe(before);
    expect(readdirSync(root)).toEqual(['captures']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('@claim:runnable-local-mock exported bundle returns its recorded failure', async () => {
  const root = tempFolder();
  const port = 19487;
  const bundle = makeDemo(root);
  const server = spawn(binary, ['serve', '--bundle', bundle, '--listen', `127.0.0.1:${port}`], { stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await new Promise<void>((resolveReady, reject) => {
      const timeout = setTimeout(() => reject(new Error('mock did not start')), 5000);
      server.stdout.on('data', chunk => { if (chunk.toString().includes('serving 1 fixture')) { clearTimeout(timeout); resolveReady(); } });
      server.on('exit', code => reject(new Error(`mock stopped with ${code}`)));
    });
    const response = await fetch(`http://127.0.0.1:${port}/webhooks/payment`, { method: 'POST' });
    expect(response.status).toBe(503);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('retry-after')).toBe('30');
    await expect(response.json()).resolves.toEqual({ code: 'upstream_timeout', retryable: true });
  } finally { server.kill('SIGINT'); rmSync(root, { recursive: true, force: true }); }
});

test('@claim:signed-local-webhook send creates a fresh signature', async () => {
  const root = tempFolder();
  const bundle = makeDemo(root);
  const secret = 'test-local-secret';
  let receivedSignature = '';
  let receivedBody = '';
  const receiver = createServer((request, response) => {
    receivedSignature = request.headers['x-boundary-replay-signature']?.toString() || '';
    request.on('data', chunk => { receivedBody += chunk; });
    request.on('end', () => { response.writeHead(202); response.end('accepted'); });
  });
  await new Promise<void>(resolveListen => receiver.listen(0, '127.0.0.1', resolveListen));
  const address = receiver.address();
  if (!address || typeof address === 'string') throw new Error('local receiver has no port');
  try {
    const result = await new Promise<{ code: number | null; stderr: string }>((resolveRun) => {
      const child = spawn(binary, ['send', '--bundle', bundle, '--fixture', 'payment-webhook', '--target', `http://127.0.0.1:${address.port}/hooks`, '--signing-secret-env', 'TEST_SIGNING_SECRET'], { env: { ...process.env, TEST_SIGNING_SECRET: secret } });
      let stderr = ''; child.stderr.on('data', chunk => { stderr += chunk; }); child.on('close', code => resolveRun({ code, stderr }));
    });
    expect(result.code, result.stderr).toBe(0);
    const match = receivedSignature.match(/^t=(\d+),v1=([a-f0-9]{64})$/);
    expect(match).not.toBeNull();
    const digest = createHmac('sha256', secret).update(`${match![1]}.${receivedBody}`).digest('hex');
    expect(match![2]).toBe(digest);
    expect(receivedSignature).not.toContain('prod-signature');
    expect(receivedBody).toContain('[REDACTED]');
  } finally { await new Promise<void>(resolveClose => receiver.close(() => resolveClose())); rmSync(root, { recursive: true, force: true }); }
});

test('@claim:private-demo uses isolated sample state and same-origin requests', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Inspect a scrubbed payment failure');
  const storage = await page.evaluate(() => ({ session: Object.keys(sessionStorage), local: Object.keys(localStorage) }));
  expect(storage.session).toEqual(['demo:incident-boundary-replay:state']);
  expect(storage.local).toEqual([]);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual(['demo:incident-boundary-replay:state']);
  expect(requests.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:telemetry-free keeps the local browser and CLI demo flow local', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page.getByRole('heading', { name: 'Inspect a scrubbed payment failure' })).toBeVisible();
  expect(requests.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  const root = tempFolder();
  const guard = tempFolder();
  try {
    const guardLibrary = join(guard, 'deny-connect.so');
    const connectLog = join(guard, 'connect.log');
    execFileSync('gcc', ['-shared', '-fPIC', '-O2', '-o', guardLibrary, 'tests/connect-guard.c']);
    const result = spawnSync(binary, ['demo', '--out', root, '--json'], {
      encoding: 'utf8',
      env: { ...process.env, LD_PRELOAD: guardLibrary, BOUNDARY_REPLAY_CONNECT_LOG: connectLog }
    });
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({ demo: true, fixtures: 1, saved: true });
    expect(existsSync(connectLog) ? readFileSync(connectLog, 'utf8') : '').toBe('');
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(guard, { recursive: true, force: true });
  }
});

test('@claim:chosen-output-paths keeps captured and exported data inside named folders', async () => {
  const root = tempFolder();
  const captureFolder = join(root, 'capture-folder');
  const bundleFolder = join(root, 'bundle-folder');
  const upstream = createServer((request, response) => {
    request.resume();
    request.on('end', () => { response.writeHead(503, { 'content-type': 'application/json' }); response.end('{"ok":false}'); });
  });
  await new Promise<void>(resolveListen => upstream.listen(0, '127.0.0.1', resolveListen));
  const address = upstream.address();
  if (!address || typeof address === 'string') throw new Error('upstream has no port');
  const port = await freeLoopbackPort();
  const sidecar = spawn(binary, ['capture', '--listen', `127.0.0.1:${port}`, '--upstream', `http://127.0.0.1:${address.port}`, '--out', captureFolder], { stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await new Promise<void>((resolveReady, reject) => {
      const timeout = setTimeout(() => reject(new Error('capture sidecar did not start')), 5000);
      sidecar.stdout.on('data', chunk => { if (chunk.toString().includes('capturing opted-in traffic')) { clearTimeout(timeout); resolveReady(); } });
      sidecar.on('exit', code => reject(new Error(`capture sidecar stopped with ${code}`)));
    });
    expect((await fetch(`http://127.0.0.1:${port}/only-here`, { method: 'POST', body: '{"token":"private"}' })).status).toBe(503);
    const exported = spawnSync(binary, ['export', '--captures', captureFolder, '--out', bundleFolder, '--json'], { encoding: 'utf8' });
    expect(exported.status, exported.stderr).toBe(0);
    expect(JSON.parse(exported.stdout)).toMatchObject({ bundle: bundleFolder, fixtures: 1 });
    expect(readdirSync(root).sort()).toEqual(['bundle-folder', 'capture-folder']);
    expect(readdirSync(bundleFolder).sort()).toEqual(['fixtures', 'manifest.json']);
  } finally {
    sidecar.kill('SIGINT');
    await new Promise<void>(resolveClose => upstream.close(() => resolveClose()));
    rmSync(root, { recursive: true, force: true });
  }
});

test('@claim:empty-output-folders export refuses a populated destination without changing it', () => {
  const root = tempFolder();
  const bundle = makeDemo(root);
  const out = join(root, 'existing-bundle');
  const privateFixture = join(out, 'fixtures', 'stale-private.json');
  mkdirSync(join(out, 'fixtures'), { recursive: true });
  writeFileSync(privateFixture, '{"email":"maya.chen@example.com","card":"4242424242424242"}');
  const before = readFileSync(privateFixture, 'utf8');
  try {
    const demo = spawnSync(binary, ['demo', '--out', root, '--json'], { encoding: 'utf8' });
    expect(demo.status).not.toBe(0);
    expect(demo.stderr).toContain('is not empty');
    const result = spawnSync(binary, ['export', '--captures', join(root, 'captures'), '--out', out, '--json'], { encoding: 'utf8' });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('is not empty');
    expect(readFileSync(privateFixture, 'utf8')).toBe(before);
    expect(readdirSync(out).sort()).toEqual(['fixtures']);
    expect(existsSync(join(out, 'manifest.json'))).toBe(false);
    expect(existsSync(bundle)).toBe(true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('@claim:cli-json-and-errors gives scripts JSON on success and stderr plus a non-zero exit on errors', () => {
  const root = tempFolder();
  try {
    const demo = spawnSync(binary, ['demo', '--out', root, '--json'], { encoding: 'utf8' });
    expect(demo.status, demo.stderr).toBe(0);
    expect(JSON.parse(demo.stdout)).toMatchObject({ demo: true, fixtures: 1, saved: true });
    const exportedRoot = tempFolder();
    try {
      const exported = spawnSync(binary, ['export', '--captures', join(root, 'captures'), '--out', exportedRoot, '--json'], { encoding: 'utf8' });
      expect(exported.status, exported.stderr).toBe(0);
      expect(JSON.parse(exported.stdout)).toMatchObject({ bundle: exportedRoot, fixtures: 1 });
    } finally { rmSync(exportedRoot, { recursive: true, force: true }); }
    const failed = spawnSync(binary, ['send', '--bundle', join(root, 'payment-failure.bundle'), '--fixture', 'payment-webhook', '--target', 'https://example.com/hooks', '--signing-secret-env', 'TEST_SECRET', '--json'], { encoding: 'utf8' });
    expect(failed.status).not.toBe(0);
    expect(failed.stdout).toBe('');
    expect(failed.stderr).toContain('refusing non-local target');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('@claim:capture-opt-in starts capturing only after the sidecar is launched', async () => {
  const root = tempFolder();
  const port = await freeLoopbackPort();
  await expect(fetch(`http://127.0.0.1:${port}/not-running`)).rejects.toThrow();
  const upstream = createServer((request, response) => { request.resume(); response.writeHead(204); response.end(); });
  await new Promise<void>(resolveListen => upstream.listen(0, '127.0.0.1', resolveListen));
  const address = upstream.address();
  if (!address || typeof address === 'string') throw new Error('upstream has no port');
  const sidecar = spawn(binary, ['capture', '--listen', `127.0.0.1:${port}`, '--upstream', `http://127.0.0.1:${address.port}`, '--out', root], { stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await new Promise<void>((resolveReady, reject) => {
      const timeout = setTimeout(() => reject(new Error('capture sidecar did not start')), 5000);
      sidecar.stdout.on('data', chunk => { if (chunk.toString().includes('capturing opted-in traffic')) { clearTimeout(timeout); resolveReady(); } });
      sidecar.on('exit', code => reject(new Error(`capture sidecar stopped with ${code}`)));
    });
    expect((await fetch(`http://127.0.0.1:${port}/running`)).status).toBe(204);
    expect(readdirSync(root)).toHaveLength(1);
  } finally {
    sidecar.kill('SIGINT');
    await new Promise<void>(resolveClose => upstream.close(() => resolveClose()));
    rmSync(root, { recursive: true, force: true });
  }
});

test('@claim:offline-demo reloads after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const shellCached = await page.evaluate(async () => {
    const cache = await caches.open('boundary-replay-v2');
    const assets = [...document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src], link[rel="stylesheet"]')]
      .map(element => element instanceof HTMLScriptElement ? element.src : element.href)
      .filter(Boolean);
    return Promise.all(assets.map(asset => cache.match(asset).then(Boolean)));
  });
  expect(shellCached.every(Boolean)).toBe(true);
  await context.setOffline(true);
  await expect(page.getByText('Offline — the saved shell remains available')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Inspect a scrubbed payment failure' })).toBeVisible();
  await expect(page.getByText('503 response')).toBeVisible();
});

test('@claim:sample-export downloads one scrubbed fixture', async ({ page }) => {
  await page.goto('/demo');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export sample bundle' }).click();
  const download = await downloadEvent;
  const path = await download.path();
  const data = JSON.parse(readFileSync(path!, 'utf8'));
  expect(data.manifest.fixture_count).toBe(1);
  expect(data.fixtures[0].response.status).toBe(503);
  expect(data.fixtures[0].request.body.customer_email).toBe('[REDACTED]');
});

test('@claim:free-local-exporter exports without a stored license', async ({ page }) => {
  await page.goto('/demo');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:incident-boundary-replay'))).toBeNull();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export sample bundle' }).click();
  const download = await downloadEvent;
  const bundle = JSON.parse(readFileSync(await download.path()!, 'utf8'));
  expect(bundle.manifest.fixture_count).toBe(1);
  expect(bundle.fixtures[0].id).toBe('payment-webhook');
});

test('site structure, keyboard path, mobile layout, and accessibility', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page).toHaveTitle('Boundary Replay — replay failed HTTP boundaries');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('img:not([alt])')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
  expect(errors).toEqual([]);
});

test('390px keeps required product text at the 16px body-text floor and exposes its visible wordmark name', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'BR Boundary Replay home' })).toBeVisible();
  const sizes = await page.locator('nav a, .hero-actions > span, .facts, .section-index, .steps li > span, .landscape figcaption, .terminal-bar, footer').evaluateAll(elements =>
    elements.map(element => Number.parseFloat(getComputedStyle(element).fontSize))
  );
  expect(sizes.every(size => size >= 16)).toBe(true);
});

test('desktop first read keeps the demo action and facts in view', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const action = await page.getByRole('link', { name: 'Try it with sample data' }).boundingBox();
    const facts = await page.locator('.facts').boundingBox();
    expect(action).not.toBeNull();
    expect(facts).not.toBeNull();
    expect(action!.y + action!.height).toBeLessThanOrEqual(viewport.height);
    expect(facts!.y + facts!.height).toBeLessThanOrEqual(viewport.height);
  }
});

test('demo banner stays available and leaving demo discards sample state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await page.evaluate(() => window.scrollTo(0, 1430));
  const banner = await page.locator('.demo-banner').boundingBox();
  expect(banner).not.toBeNull();
  expect(banner!.y).toBeGreaterThanOrEqual(0);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('/');
  expect(await page.evaluate(() => sessionStorage.getItem('demo:incident-boundary-replay:state'))).toBeNull();
});

test('200% reflow and standalone 404 keep content and targets in the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 195, height: 422 });
  for (const route of ['/', '/demo', '/privacy', '/404.html']) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/404.html');
  for (const target of [page.getByRole('link', { name: 'Boundary Replay home' }), page.getByRole('navigation').getByRole('link'), page.locator('footer a')]) {
    for (const box of await target.evaluateAll(elements => elements.map(element => {
      const rect = element.getBoundingClientRect(); return { width: rect.width, height: rect.height };
    }))) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test('390px touch targets keep mobile navigation, demo controls, and footer links at 44px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const landingTargets = [
    page.getByRole('link', { name: 'Boundary Replay home' }),
    page.getByRole('navigation').getByRole('link'),
    page.locator('footer a')
  ];
  for (const targets of landingTargets) {
    for (const box of await targets.evaluateAll(elements => elements.map(element => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }))) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }

  await page.goto('/demo');
  for (const target of [
    page.getByRole('button', { name: 'Reset demo' }),
    page.getByRole('link', { name: 'Start for real' })
  ]) {
    const box = await target.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test('real routes update title, h1, history, focus, and cross-route hash navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveURL('/privacy');
  await expect(page).toHaveTitle('Privacy — Boundary Replay');
  await expect(page.locator('h1')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL('/');
  await page.goto('/missing-route');
  await expect(page.getByText('404 · NO MATCHING FIXTURE')).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  await page.goto('/demo');
  await page.getByRole('link', { name: 'How it works' }).click();
  await expect(page).toHaveURL('/#how');
  await expect(page.locator('#how')).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
});

test('SWA config rewrites only known client routes and preserves a real 404 response', async ({ page }) => {
  const config = JSON.parse(readFileSync('site/public/staticwebapp.config.json', 'utf8')) as {
    routes: Array<Record<string, unknown>>;
    responseOverrides: Record<string, { rewrite?: string }>;
  };
  expect('navigationFallback' in config).toBe(false);
  expect(config.routes.filter(route => route.rewrite === '/index.html').map(route => route.route)).toEqual(['/demo', '/privacy', '/terms']);
  expect(config.routes.every(route => !('rewrite' in route && 'statusCode' in route))).toBe(true);
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  expect(existsSync('site/public/404.html')).toBe(true);
  const worker = readFileSync('dist/site/sw.js', 'utf8');
  expect(worker).toContain('boundary-replay-v2');
  expect(worker).toMatch(/"\/assets\/index-[^"]+\.js"/);
  expect(worker).toMatch(/"\/assets\/index-[^"]+\.css"/);

  await page.goto('/404.html');
  await expect(page).toHaveTitle('Not found — Boundary Replay');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This route crossed the wrong boundary');
  await expect(page.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
});
