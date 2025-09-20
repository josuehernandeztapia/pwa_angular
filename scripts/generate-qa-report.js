/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const RESULTS_FILE = path.resolve(process.cwd(), 'reports', 'qa', 'final-qa-results.json');
const REPORT_FILE = path.resolve(process.cwd(), 'QA-REPORT.md');

function loadResults() {
  if (!fs.existsSync(RESULTS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8')) || [];
  } catch (e) {
    console.error('Error leyendo resultados:', e);
    return [];
  }
}

function toBadge(ok) {
  return ok ? 'OK' : 'FALLA';
}

function formatScreenshots(result) {
  const light = result.screenshots.find(s => /-light\.png$/.test(s)) || result.screenshots.find(s => /(desktop|tablet|mobile)\.png$/.test(s)) || result.screenshots[0] || '';
  const dark = result.screenshots.find(s => /-dark\.png$/.test(s)) || '';
  const link = p => (p ? `[${path.basename(p)}](${p})` : '');
  return { light: link(light), dark: link(dark) };
}

function group(results) {
  const coreNames = new Set([
    'login','dashboard','clientes','cotizador','perfil','oportunidad','edomex-colectivo','proteccion',
    'avi-go','avi-review','avi-nogo','documentos-pendiente','documentos-validado','entregas','config-cotizador','config-simulador','usage'
  ]);
  const core = [];
  const nonCore = [];
  for (const r of results) {
    if (coreNames.has(r.module)) core.push(r); else nonCore.push(r);
  }
  return { core, nonCore };
}

function renderSection(title, rows) {
  const header = `| Módulo | Screenshot Light | Screenshot Dark | Helpers \`.ui-*\` | Accesibilidad AA | Estado |\n|--------|------------------|-----------------|-----------------|------------------|--------|`;
  const lines = rows.map(r => {
    const shots = formatScreenshots(r);
    const helpers = r.helpersPresent ? 'Sí' : 'No';
    const a11y = r.accessibility?.violations === 0 ? 'OK' : `Violaciones: ${r.accessibility?.violations || 0}`;
    return `| ${r.module} | ${shots.light} | ${shots.dark} | ${helpers} | ${a11y} | ${r.state} |`;
  });
  return [`\n### ${title}\n`, header, ...lines, ''].join('\n');
}

function buildReport(results) {
  const { core, nonCore } = group(results);
  const intro = `## QA Final E2E (Core + No-Core)\n\nFecha: ${new Date().toISOString()}\n\nCriterios: sin gradientes/shimmer, helpers .ui-* presentes, dark mode consistente, AA cumplido.`;
  const coreSec = renderSection('Core', core.sort((a,b)=>a.module.localeCompare(b.module)));
  const nonCoreSec = renderSection('No-Core', nonCore.sort((a,b)=>a.module.localeCompare(b.module)));
  const summaryCounts = {
    total: results.length,
    pasa: results.filter(r => r.state === 'PASA').length,
    falla: results.filter(r => r.state === 'FALLA').length,
  };
  const summary = `\n**Resumen**: ${summaryCounts.pasa}/${summaryCounts.total} PASA, ${summaryCounts.falla} FALLA.`;
  return [intro, coreSec, nonCoreSec, summary, ''].join('\n');
}

function main() {
  const results = loadResults();
  if (!results.length) {
    console.warn('No se encontraron resultados en', RESULTS_FILE);
  }
  const report = buildReport(results);
  fs.writeFileSync(REPORT_FILE, report);
  console.log('Reporte generado en', REPORT_FILE);
}

main();

