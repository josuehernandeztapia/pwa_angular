#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const RESULTS_PATH = path.resolve('test-results/final-qa-results.json');
const OUT_PATH = path.resolve('QA-REPORT.md');

function link(p) {
  return p.replace(/\\/g, '/');
}

function render(results) {
  const lines = [];
  lines.push('# PR#239 – QA Visual Final + Accesibilidad');
  lines.push('');
  lines.push('Validación de PWA tras refactorización OpenAI-style.');
  lines.push('');
  lines.push('## Artefactos');
  lines.push('- tests/screenshots/ (capturas)');
  lines.push('- test-results/final-qa-results.json');
  lines.push('');
  lines.push('## Checklist');
  lines.push('- [ ] Sin gradientes ni shimmer en ninguna vista');
  lines.push('- [ ] Todos los componentes usan .ui-card, .ui-btn, .ui-input');
  lines.push('- [ ] Dark mode perfecto en todas las capturas');
  lines.push('- [ ] Accesibilidad AA (labels, contraste, alt)');
  lines.push('');
  lines.push('## Resultados por módulo');
  lines.push('');
  for (const r of results.results) {
    const grad = r.gradientViolations?.length || 0;
    const shim = r.shimmerViolations?.length || 0;
    const ui = r.uiClassViolations?.length || 0;
    const a11y = r.a11y?.violations?.length || 0;
    const dark = r.darkModeVerified === undefined ? 'n/a' : (r.darkModeVerified ? 'ok' : 'fail');
    lines.push(`### ${r.title} (${r.route})`);
    if (Array.isArray(r.screenshots) && r.screenshots.length) {
      for (const s of r.screenshots) {
        lines.push(`- Screenshot: ${link(s)}`);
      }
    }
    lines.push(`- Gradients: ${grad}`);
    lines.push(`- Shimmer: ${shim}`);
    lines.push(`- UI classes missing: ${ui}`);
    lines.push(`- Dark mode: ${dark}`);
    if (a11y > 0) {
      lines.push(`- A11y violations (${a11y}):`);
      for (const v of r.a11y.violations.slice(0, 10)) {
        lines.push(`  - ${v.id} (${v.impact || 'n/a'}): ${v.description} — nodos: ${v.nodes}`);
      }
    } else {
      lines.push('- A11y violations: 0');
    }
    lines.push('');
  }
  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(RESULTS_PATH)) {
    console.error(`Resultados no encontrados: ${RESULTS_PATH}`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf-8'));
  const md = render(data);
  fs.writeFileSync(OUT_PATH, md);
  console.log(`QA report generado en ${OUT_PATH}`);
}

main();

