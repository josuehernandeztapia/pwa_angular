/* eslint-disable no-console */
const { spawn, execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const waitOn = require('wait-on');

const DIST_DIR = path.resolve(__dirname, '..', 'dist', 'conductores-pwa');
const REPORTS_DIR = path.resolve(__dirname, '..', 'reports', 'accessibility');
const REPORT_JSON = path.join(REPORTS_DIR, 'results.json');
const SERVER_PORT = process.env.PORT || 4200;
const BASE_URL = `http://localhost:${SERVER_PORT}`;

function findPlaywrightChrome() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const pwCache = path.join(process.env.HOME || '/home/ubuntu', '.cache', 'ms-playwright');
  try {
    const entries = fs.readdirSync(pwCache).filter((d) => d.startsWith('chromium-'));
    for (const dir of entries) {
      const chrome = path.join(pwCache, dir, 'chrome-linux', 'chrome');
      if (fs.existsSync(chrome)) return chrome;
    }
  } catch {}
  return null;
}

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Build output not found at', DIST_DIR);
    process.exit(1);
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const chromePath = findPlaywrightChrome();
  if (!chromePath) {
    console.error('❌ Could not locate a Chrome binary for axe. Set CHROME_PATH env.');
    process.exit(1);
  }

  const urls = [
    // Simuladores
    '/simulador',
    '/simulador/ags-ahorro',
    '/simulador/edomex-individual',
    '/simulador/tanda-colectiva',
    // Cotizadores
    '/cotizador',
    '/cotizador/ags-individual',
    '/cotizador/edomex-colectivo',
    // Catálogo
    '/productos',
    // Ops
    '/ops/triggers',
    '/ops/deliveries',
    // Document upload
    '/document-upload',
    // Nueva oportunidad
    '/nueva-oportunidad',
    // Onboarding
    '/onboarding',
    // Otros
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

  let serverClosed = false;
  server.on('close', () => { serverClosed = true; });

  try {
    await waitOn({ resources: [BASE_URL], timeout: 30000, interval: 250 });
  } catch (err) {
    console.error('❌ Server did not start in time:', err?.message || err);
    try { server.kill(); } catch {}
    process.exit(1);
  }

  console.log('🔎 Running axe on', urls.length, 'URLs...');
  const axeArgs = [
    'axe',
    ...urls,
    '--stdout',
    '--chrome-path',
    chromePath,
    '--show-errors=false'
  ];

  execFile('npx', axeArgs, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
    try {
      if (err) {
        console.error('❌ Axe run failed:', err.message);
        if (stderr) console.error(stderr);
        process.exitCode = 1;
        return;
      }
      // stdout should be JSON array/object
      fs.writeFileSync(REPORT_JSON, stdout || '[]', 'utf8');
      console.log('✅ Saved axe results to', REPORT_JSON);
    } catch (writeErr) {
      console.error('❌ Failed to write results:', writeErr.message);
      process.exitCode = 1;
    } finally {
      try { server.kill(); } catch {}
      // If server already closed for any reason, ignore
      setTimeout(() => process.exit(process.exitCode || 0), 200);
    }
  });
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});

