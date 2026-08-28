import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const site = resolve('dist/site');
const workerPath = join(site, 'sw.js');
const marker = '/* __BOUNDARY_REPLAY_ASSETS__ */ []';
const assetPaths = readdirSync(join(site, 'assets'))
  .filter(name => /\.(?:css|js|woff2?|webp|svg)$/u.test(name))
  .map(name => `/assets/${name}`)
  .sort();
const worker = readFileSync(workerPath, 'utf8');

if (!worker.includes(marker)) throw new Error('service worker asset marker was not found');
writeFileSync(workerPath, worker.replace(marker, `/* __BOUNDARY_REPLAY_ASSETS__ */ ${JSON.stringify(assetPaths)}`));
