#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function exists(p) { try { return fs.existsSync(p); } catch { return false; } }
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function findInHtml(html, pattern) {
  return pattern.test(html);
}

function rel(p, root) { return path.relative(root, p) || '.'; }

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const distRoot = path.join(projectRoot, 'dist', 'conductores-pwa', 'browser');
  const reportDir = path.join(projectRoot, 'reports', 'pwa');
  ensureDir(reportDir);

  const report = {
    target: rel(distRoot, projectRoot),
    ok: true,
    errors: [],
    warnings: [],
    info: []
  };

  // Basic files
  const indexPath = path.join(distRoot, 'index.html');
  const manifestPath = path.join(distRoot, 'manifest.webmanifest');
  const swJsonPath = path.join(distRoot, 'ngsw.json');
  const swWorkerPath = path.join(distRoot, 'ngsw-worker.js');

  if (!exists(distRoot)) report.errors.push(`Dist folder not found: ${rel(distRoot, projectRoot)}`);
  if (!exists(indexPath)) report.errors.push('Missing index.html');
  if (!exists(manifestPath)) report.errors.push('Missing manifest.webmanifest');
  if (!exists(swJsonPath)) report.errors.push('Missing ngsw.json (service worker config output)');
  if (!exists(swWorkerPath)) report.errors.push('Missing ngsw-worker.js');

  // index.html checks
  if (exists(indexPath)) {
    const html = fs.readFileSync(indexPath, 'utf8');
    if (!findInHtml(html, /<link[^>]+rel=["']manifest["'][^>]+>/i)) {
      report.errors.push('index.html: link rel="manifest" not found');
    }
    if (!findInHtml(html, /<meta[^>]+name=["']theme-color["'][^>]+>/i)) {
      report.warnings.push('index.html: meta name="theme-color" not found');
    }
  }

  // manifest checks
  let manifest;
  if (exists(manifestPath)) {
    try {
      manifest = readJson(manifestPath);
    } catch (e) {
      report.errors.push(`Invalid manifest.webmanifest JSON: ${e.message}`);
    }
  }

  if (manifest) {
    const requiredFields = ['name','short_name','display','start_url','scope'];
    for (const f of requiredFields) {
      if (!manifest[f]) report.errors.push(`Manifest: missing field "${f}"`);
    }
    if (manifest.display !== 'standalone') {
      report.warnings.push(`Manifest: display is "${manifest.display}", expected "standalone"`);
    }
    if (!manifest.theme_color) report.warnings.push('Manifest: missing theme_color');
    if (!manifest.background_color) report.warnings.push('Manifest: missing background_color');

    // Icons existence (only check png paths under assets/icons when present)
    if (Array.isArray(manifest.icons)) {
      const needed = [
        'assets/icons/icon-192x192.png',
        'assets/icons/icon-512x512.png'
      ];
      for (const need of needed) {
        const existsIcon = exists(path.join(distRoot, need));
        if (!existsIcon) report.warnings.push(`Icon missing in dist: ${need}`);
      }
    } else {
      report.warnings.push('Manifest: icons array missing');
    }

    // Shortcuts icons
    if (Array.isArray(manifest.shortcuts)) {
      for (const sc of manifest.shortcuts) {
        const name = sc.name || sc.short_name || 'shortcut';
        if (Array.isArray(sc.icons) && sc.icons.length) {
          // Prefer png entry
          const png = sc.icons.find(i => (i.type||'').includes('png')) || sc.icons[0];
          if (png && png.src) {
            const p = path.join(distRoot, png.src);
            if (!exists(p)) report.warnings.push(`Shortcut icon not found in dist (${name}): ${png.src}`);
          }
        } else {
          report.warnings.push(`Shortcut without icons: ${name}`);
        }
      }
    }
  }

  // ngsw.json checks
  if (exists(swJsonPath)) {
    try {
      const sw = readJson(swJsonPath);
      // Simple sanity checks
      if (!sw.assetGroups || !Array.isArray(sw.assetGroups)) {
        report.warnings.push('ngsw.json: assetGroups missing or invalid');
      }
      if (!sw.navigationUrls || !Array.isArray(sw.navigationUrls)) {
        report.warnings.push('ngsw.json: navigationUrls missing or invalid');
      }
    } catch (e) {
      report.errors.push(`Invalid ngsw.json JSON: ${e.message}`);
    }
  }

  // Final status
  if (report.errors.length) report.ok = false;

  const jsonPath = path.join(reportDir, 'checklist.json');
  const mdPath = path.join(reportDir, 'checklist.md');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  // Markdown summary
  const md = [
    `# PWA Checklist Report`,
    `Target: ${report.target}`,
    `Status: ${report.ok ? 'OK' : 'FAILED'}`,
    `\n## Errors`,
    ...(report.errors.length ? report.errors.map(e => `- ${e}`) : ['- None']),
    `\n## Warnings`,
    ...(report.warnings.length ? report.warnings.map(w => `- ${w}`) : ['- None']),
    `\n## Info`,
    ...(report.info.length ? report.info.map(i => `- ${i}`) : ['- None'])
  ].join('\n');
  fs.writeFileSync(mdPath, md);

  console.log(`PWA checklist written to:\n- ${rel(jsonPath, projectRoot)}\n- ${rel(mdPath, projectRoot)}`);
  if (!report.ok) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });

