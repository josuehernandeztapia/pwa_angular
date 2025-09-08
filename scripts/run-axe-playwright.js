/* eslint-disable no-console */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const waitOn = require('wait-on');
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;

const DIST_DIR = path.resolve(__dirname, '..', 'dist', 'conductores-pwa');
const REPORTS_DIR = path.resolve(__dirname, '..', 'reports', 'accessibility');
const REPORT_JSON = path.join(REPORTS_DIR, 'results.json');
const SERVER_PORT = process.env.PORT || 4200;
const BASE_URL = `http://localhost:${SERVER_PORT}`;

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Build output not found at', DIST_DIR);
    process.exit(1);
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const urls = [
    '/simulador',
    '/simulador/ags-ahorro',
    '/simulador/edomex-individual',
    '/simulador/tanda-colectiva',
    '/cotizador',
    '/cotizador/ags-individual',
    '/cotizador/edomex-colectivo',
    '/productos',
    '/ops/triggers',
    '/ops/deliveries',
    '/document-upload',
    '/nueva-oportunidad',
    '/onboarding',
    '/expedientes',
    '/perfil',
    '/reportes',
    '/404'
  ].map((p) => `${BASE_URL}${p}`);

  console.log('▶️  Starting static server on port', SERVER_PORT);
  const server = spawn(
    path.resolve('node_modules/.bin/http-server'),
    [DIST_DIR, '-p', String(SERVER_PORT), '-s', '--silent'],
    { stdio: 'inherit' }
  );

  try {
    await waitOn({ resources: [BASE_URL], timeout: 30000, interval: 250 });
  } catch (err) {
    console.error('❌ Server did not start in time:', err?.message || err);
    try { server.kill(); } catch {}
    process.exit(1);
  }

  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];
  for (const url of urls) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      // Small extra wait for fonts/animations to settle
      await page.waitForTimeout(300);
      const builder = new AxeBuilder({ page }).include('body');
      const analysis = await builder.analyze();
      results.push({ url, ...analysis });
      console.log('✔️  Axe scanned', url, 'violations:', analysis.violations?.length || 0);
    } catch (e) {
      console.warn('⚠️  Failed to scan', url, '-', e.message);
      results.push({ url, error: e.message, violations: [] });
    }
  }

  await browser.close();
  try { server.kill(); } catch {}

  fs.writeFileSync(REPORT_JSON, JSON.stringify(results, null, 2), 'utf8');
  console.log('✅ Saved axe results to', REPORT_JSON);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});

