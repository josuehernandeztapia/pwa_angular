#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function exists(p) { return fs.existsSync(p); }

function main() {
  const root = path.resolve(__dirname, '../../..');
  const dist = path.join(root, 'dist', 'conductores-pwa');
  const manifest = path.join(root, 'src', 'manifest.webmanifest');

  const checks = [];
  checks.push({ name: 'manifest.webmanifest present', ok: exists(manifest) });

  // Shortcut icons referenced
  const shortcuts = ['shortcut-new.png', 'shortcut-quote.png', 'shortcut-clients.png'];
  const missing = shortcuts.filter(fn => !exists(path.join(root, 'src', 'assets', 'icons', fn)));
  checks.push({ name: 'shortcut icons present', ok: missing.length === 0, missing });

  // Service worker config present
  checks.push({ name: 'ngsw-config.json present', ok: exists(path.join(root, 'src', 'ngsw-config.json')) });

  // After build, service worker and manifest should be in dist
  checks.push({ name: 'dist exists (build required)', ok: exists(dist) });

  const failed = checks.filter(c => !c.ok);
  if (failed.length) {
    // eslint-disable-next-line no-console
    console.error('PWA checklist failed:', failed);
    process.exitCode = 1;
  } else {
    // eslint-disable-next-line no-console
    console.log('PWA checklist passed');
  }
}

main();

