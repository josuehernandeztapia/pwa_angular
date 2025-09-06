#!/usr/bin/env node
/**
 * Weekly EdoMex Critical Documents Reminder
 *
 * - Scans EdoMex clients and compiles pending/expiring critical documents (Carta Aval, Carta Antigüedad)
 * - For Crédito Colectivo: also checks "Padrón de Socios Actualizado"
 * - Includes KYC gating (INE + Comprobante) status overview
 * - Outputs Markdown + JSON reports under reports/weekly/
 * - Optional Slack notification via webhook (SLACK_WEBHOOK_URL)
 *
 * Env / Args:
 *   API_URL           Base API URL (default: from environment.ts or http://localhost:3000)
 *   AUTH_TOKEN        Bearer token (optional)
 *   MARKET            Market filter (default: edomex)
 *   OUT_DIR           Output dir (default: reports/weekly)
 *   SLACK_WEBHOOK_URL Slack Incoming Webhook URL (optional)
 *
 * Usage:
 *   node scripts/weekly-edomex-reminder.js
 *   API_URL=https://api.conductores-pwa.com/v1 AUTH_TOKEN=xxx SLACK_WEBHOOK_URL=... node scripts/weekly-edomex-reminder.js
 */

const fs = require('fs');
const path = require('path');

const MARKET = process.env.MARKET || 'edomex';
const OUT_DIR = process.env.OUT_DIR || path.join(__dirname, '..', 'reports', 'weekly');
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';

// Try to infer API URL from env files if not provided
let API_URL = process.env.API_URL || '';
if (!API_URL) {
  try {
    const envProd = fs.readFileSync(path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts'), 'utf8');
    const m = envProd.match(/apiUrl:\s*'([^']+)'/);
    if (m) API_URL = m[1].replace(/\/$/, '');
  } catch {}
}
if (!API_URL) API_URL = 'http://localhost:3000';

const AUTH_TOKEN = process.env.AUTH_TOKEN || '';

async function httpGet(url) {
  const headers = AUTH_TOKEN ? { 'Authorization': `Bearer ${AUTH_TOKEN}` } : {};
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function daysSince(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function analyzeClient(client) {
  const docs = client.documents || [];
  const byName = (name) => docs.find(d => (d.name || '').toLowerCase().includes(name.toLowerCase()));

  const out = {
    clientId: client.id,
    name: client.name,
    flow: client.flow,
    market: client.market,
    advisor: client.assignedAdvisor || client.assignedUser || 'N/A',
    pending: [],
    expiring: [],
    kycGate: {
      ineApproved: false,
      comprobanteApproved: false,
      kycApproved: false
    }
  };

  // KYC gating
  const ine = byName('INE Vigente') || byName('INE');
  const comprobante = byName('Comprobante de domicilio');
  const kyc = docs.find(d => (d.name || '').toLowerCase().includes('verificación biométrica'));
  out.kycGate.ineApproved = ine?.status === 'Aprobado';
  out.kycGate.comprobanteApproved = comprobante?.status === 'Aprobado';
  out.kycGate.kycApproved = kyc?.status === 'Aprobado';

  // EdoMex criticals
  if ((client.market || '').toLowerCase() === 'edomex') {
    const criticals = [
      { name: 'Carta Aval de Ruta', window: 180 },
      { name: 'Carta de Antigüedad', window: 90 }
    ];
    for (const c of criticals) {
      const d = byName(c.name);
      if (!d || d.status !== 'Aprobado') {
        out.pending.push(`Falta documento crítico: ${c.name}`);
        continue;
      }
      // Priorizar expirationDate; fallback a uploadedAt + ventana
      if (d.expirationDate) {
        const exp = new Date(d.expirationDate);
        const remaining = Math.floor((exp.getTime() - Date.now()) / (1000*60*60*24));
        if (remaining <= 0) out.pending.push(`${c.name} vencido: subir actualizado`);
        else if (remaining <= 14) out.expiring.push(`${c.name} por expirar (${remaining} días)`);
        continue;
      }
      if (d.uploadedAt) {
        const elapsed = daysSince(d.uploadedAt);
        if (elapsed != null) {
          const remaining = c.window - elapsed;
          if (remaining <= 0) out.pending.push(`${c.name} vencido: subir actualizado`);
          else if (remaining <= 14) out.expiring.push(`${c.name} por expirar (${remaining} días)`);
        }
      }
    }
    // Colectivo: padrón
    if (String(client.flow).includes('Crédito Colectivo')) {
      const padron = byName('Padrón de Socios Actualizado');
      if (!padron || padron.status !== 'Aprobado') out.pending.push('Falta Padrón de Socios Actualizado');
    }
  }

  return out;
}

function buildMarkdown(dateISO, results) {
  const lines = [];
  lines.push(`# Recordatorio Semanal EdoMex — ${dateISO}`);
  lines.push('');
  if (!results.length) {
    lines.push('No se encontraron pendientes críticos esta semana.');
    return lines.join('\n');
  }
  for (const r of results) {
    lines.push(`## ${r.name} (${r.clientId}) — ${r.flow}`);
    lines.push(`- Asesor: ${r.advisor}`);
    lines.push(`- KYC: INE=${r.kycGate.ineApproved ? '✓' : '✗'}, Comprobante=${r.kycGate.comprobanteApproved ? '✓' : '✗'}, Biométrico=${r.kycGate.kycApproved ? '✓' : '✗'}`);
    if (r.pending.length) {
      lines.push('- Pendientes:');
      r.pending.forEach(p => lines.push(`  - ${p}`));
    }
    if (r.expiring.length) {
      lines.push('- Por expirar:');
      r.expiring.forEach(e => lines.push(`  - ${e}`));
    }
    lines.push('');
  }
  return lines.join('\n');
}

async function postToSlack(markdown) {
  if (!SLACK_WEBHOOK_URL) return false;
  const text = markdown
    .replace(/^# (.*)$/gm, '*$1*')
    .replace(/^## (.*)$/gm, '*$1*');
  try {
    const res = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  ensureDir(OUT_DIR);
  const dateISO = new Date().toISOString().slice(0, 10);

  // Try standard endpoint patterns
  const bases = [API_URL.replace(/\/$/, ''), API_URL.replace(/\/$/, '') + '/v1'];
  let clients = [];
  let lastErr = null;
  for (const base of bases) {
    try {
      const url = `${base}/clients?market=${encodeURIComponent(MARKET)}`;
      clients = await httpGet(url);
      if (Array.isArray(clients)) break;
      if (clients && Array.isArray(clients.items)) { clients = clients.items; break; }
    } catch (e) {
      lastErr = e;
    }
  }

  if (!Array.isArray(clients) || clients.length === 0) {
    console.warn('No se pudo obtener la lista de clientes. Intenta establecer API_URL/AUTH_TOKEN o pasar una lista manual.');
    clients = [];
  }

  const results = [];
  // If clients array has minimal info, fetch documents per client
  for (const c of clients) {
    let client = c;
    if (!client.documents) {
      // Try to fetch documents
      const basesDocs = [API_URL.replace(/\/$/, ''), API_URL.replace(/\/$/, '') + '/v1'];
      for (const base of basesDocs) {
        try {
          const url = `${base}/clients/${encodeURIComponent(c.id)}/documents`;
          const docs = await httpGet(url);
          if (Array.isArray(docs)) {
            client = { ...c, documents: docs };
            break;
          } else if (docs && Array.isArray(docs.items)) {
            client = { ...c, documents: docs.items };
            break;
          }
        } catch {}
      }
    }
    // Skip if not EdoMex just in case
    if ((client.market || '').toLowerCase() !== 'edomex') continue;
    results.push(analyzeClient(client));
  }

  // Filter with actual pending or expiring
  const actionable = results.filter(r => r.pending.length || r.expiring.length);

  const md = buildMarkdown(dateISO, actionable);
  const json = JSON.stringify({ date: dateISO, total: actionable.length, items: actionable }, null, 2);

  const mdPath = path.join(OUT_DIR, `weekly-edomex-${dateISO}.md`);
  const jsonPath = path.join(OUT_DIR, `weekly-edomex-${dateISO}.json`);
  fs.writeFileSync(mdPath, md);
  fs.writeFileSync(jsonPath, json);
  console.log('Reporte generado en:');
  console.log('-', path.relative(process.cwd(), mdPath));
  console.log('-', path.relative(process.cwd(), jsonPath));

  // Dejar huella en backend (auditoría)
  const AUDIT_URL = process.env.AUDIT_URL || (API_URL.replace(/\/$/, '') + '/v1/audit/weekly-edomex-reminder');
  const PER_CLIENT = String(process.env.AUDIT_PER_CLIENT || 'false').toLowerCase() === 'true';
  try {
    // Summary audit
    await fetch(AUDIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(AUTH_TOKEN ? { 'Authorization': `Bearer ${AUTH_TOKEN}` } : {}) },
      body: JSON.stringify({ date: dateISO, market: MARKET, total: actionable.length, items: actionable })
    });
    console.log('Auditoría summary enviada a backend:', AUDIT_URL);
  } catch (e) {
    console.warn('No se pudo enviar auditoría summary:', e.message);
  }

  if (PER_CLIENT) {
    for (const item of actionable) {
      const url = process.env.AUDIT_CLIENT_URL || (API_URL.replace(/\/$/, '') + `/v1/clients/${encodeURIComponent(item.clientId)}/audits`);
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(AUTH_TOKEN ? { 'Authorization': `Bearer ${AUTH_TOKEN}` } : {}) },
          body: JSON.stringify({
            type: 'weekly-edomex-reminder',
            date: dateISO,
            pending: item.pending,
            expiring: item.expiring,
            kycGate: item.kycGate
          })
        });
      } catch {}
    }
    console.log('Auditoría por cliente enviada (si endpoints disponibles).');
  }

  // Optional Slack (desactivado por defecto)
  if (SLACK_WEBHOOK_URL) {
    const ok = await postToSlack(md);
    console.log(ok ? 'Notificación Slack enviada' : 'Falló notificación Slack');
  }
}

// Node 18+ fetch
const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

main().catch(err => {
  console.error(err);
  process.exit(1);
});
