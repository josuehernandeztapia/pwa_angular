#!/usr/bin/env node
/*
  Weekly reminder script (Phase 1 minimal):
  - Reads current requirements config for market (edomex by default)
  - Evaluates critical docs and expiry using simple rules
  - Emits a JSON and Markdown summary under reports/weekly/
*/
const fs = require('fs');
const path = require('path');

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getArgs() {
  const args = process.argv.slice(2);
  const out = { market: 'edomex', flow: '*' };
  for (const a of args) {
    const [k, v] = a.replace(/^--/, '').split('=');
    if (k && v) out[k] = v;
  }
  return out;
}

function computeExpiryState(doc) {
  const now = new Date();
  if (doc.expirationDate) {
    const exp = new Date(doc.expirationDate);
    const diff = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return 'expired';
    if (diff <= 14) return 'warning';
    return 'ok';
  }
  if (doc.uploadedAt && doc.windowDays) {
    const up = new Date(doc.uploadedAt);
    const elapsed = Math.floor((now.getTime() - up.getTime()) / (1000 * 60 * 60 * 24));
    const remaining = doc.windowDays - elapsed;
    if (remaining <= 0) return 'expired';
    if (remaining <= 14) return 'warning';
    return 'ok';
  }
  return undefined;
}

function main() {
  const args = getArgs();
  const root = path.resolve(__dirname, '../../..');
  const reportsDir = path.join(root, 'reports', 'weekly');
  ensureDir(reportsDir);

  // Minimal dataset: demo clients list (replace with API in real impl)
  const demoClients = [
    {
      id: 'client-001',
      name: 'Juan Pérez',
      market: args.market,
      flow: 'VentaPlazo',
      documents: [
        { name: 'INE Vigente', status: 'Aprobado' },
        { name: 'Comprobante de domicilio', status: 'Pendiente' },
        { name: 'Carta Aval de Ruta', status: 'Aprobado', expirationDate: new Date(Date.now() + 10*24*3600*1000).toISOString() }
      ]
    }
  ];

  const criticals = ['INE Vigente', 'Comprobante de domicilio', 'Carta Aval de Ruta'];

  const findings = demoClients.map(c => {
    const missing = criticals.filter(n => !c.documents.some(d => d.name === n && d.status === 'Aprobado'));
    const expiries = c.documents
      .filter(d => d.name === 'Carta Aval de Ruta')
      .map(d => ({ name: d.name, expiry: computeExpiryState(d) }));
    return { clientId: c.id, name: c.name, missing, expiries };
  });

  const date = new Date().toISOString().slice(0, 10);
  const base = path.join(reportsDir, `weekly-${args.market}-${date}`);
  fs.writeFileSync(`${base}.json`, JSON.stringify({ market: args.market, results: findings }, null, 2));
  const md = [
    `# Weekly Reminder - ${args.market} - ${date}`,
    '',
    ...findings.map(f => `- ${f.name} (${f.clientId}): missing=${f.missing.join(', ') || 'none'}; cartaAval=${(f.expiries[0]||{}).expiry || 'n/a'}`)
  ].join('\n');
  fs.writeFileSync(`${base}.md`, md);

  // Console summary
  // eslint-disable-next-line no-console
  console.log(`Weekly reminder generated at ${base}.json/.md`);
}

main();

