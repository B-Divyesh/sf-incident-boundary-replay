import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { createHmac } from 'node:crypto';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const binary = resolve('target/debug/boundary-replay');

function tempFolder(): string {
  return mkdtempSync(join(tmpdir(), 'boundary-replay-test-'));
}

function makeDemo(root: string): string {
  const result = spawnSync(binary, ['demo', '--out', root, '--json'], { encoding: 'utf8' });
  expect(result.status, result.stderr).toBe(0);
  return join(root, 'payment-failure.bundle');
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

test('@claim:local-only-replay CLI refuses non-local binds and targets', () => {
  const bind = spawnSync(binary, ['serve', '--bundle', '/tmp/missing', '--listen', '0.0.0.0:9487'], { encoding: 'utf8' });
  expect(bind.status).not.toBe(0);
  expect(bind.stderr).toContain('refusing non-loopback address');
  const send = spawnSync(binary, ['send', '--bundle', '/tmp/missing', '--fixture', 'x', '--target', 'https://example.com/hook', '--signing-secret-env', 'TEST_SECRET'], { encoding: 'utf8' });
  expect(send.status).not.toBe(0);
  expect(send.stderr).toContain('refusing non-local target');
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

test('@claim:offline-demo reloads after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const shellCached = await page.evaluate(async () => {
    const cache = await caches.open('boundary-replay-v2');
    const assets = [...document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src], link[rel="stylesheet"]')]
      .map(element => element.src || element.href)
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

test('@claim:paid-policy-pack verifies once per day and reveals the download', async ({ page }) => {
  let checks = 0;
  await page.route('https://api.sociobot.in/**', route => { checks += 1; return route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }); });
  await page.goto('/?license=test_license_token');
  await expect(page.locator('.price')).toContainText('$49');
  const downloadLink = page.getByRole('link', { name: 'Download team policies' });
  await expect(downloadLink).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sb_license:incident-boundary-replay'))).toBe('test_license_token');
  const downloadEvent = page.waitForEvent('download');
  await downloadLink.click();
  const download = await downloadEvent;
  const policy = JSON.parse(readFileSync((await download.path())!, 'utf8'));
  expect(Object.keys(policy.policies)).toEqual(['payments', 'messaging', 'identity', 'support']);
  await page.reload();
  await expect(page.getByRole('link', { name: 'Download team policies' })).toBeVisible();
  expect(checks).toBe(1);
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

test('real routes update title, h1, history, and focus', async ({ page }) => {
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
});

test('SWA config keeps navigation fallback separate from the designed 404 response', async ({ page }) => {
  const config = JSON.parse(readFileSync('site/public/staticwebapp.config.json', 'utf8')) as {
    navigationFallback: { rewrite: string };
    routes: Array<Record<string, unknown>>;
    responseOverrides: Record<string, { rewrite?: string }>;
  };
  expect(config.navigationFallback.rewrite).toBe('/index.html');
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
