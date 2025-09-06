#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const waitOn = require('wait-on');

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts });
    p.on('error', reject);
    p.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const distDir = path.join(projectRoot, 'dist', 'conductores-pwa');
  const port = process.env.LHCI_PORT || '4200';

  console.log('▶️  Building production bundle...');
  await run('npm', ['run', 'build:prod'], { cwd: projectRoot, shell: true });

  console.log('▶️  Starting static server for LHCI...');
  const httpServerBin = require.resolve('http-server/bin/http-server');
  const server = spawn(process.execPath, [httpServerBin, distDir, '-p', port, '-s'], {
    cwd: projectRoot,
    stdio: 'inherit'
  });

  const cleanup = () => {
    if (!server.killed) {
      try { server.kill(); } catch {}
    }
  };
  process.on('SIGINT', () => { cleanup(); process.exit(1); });
  process.on('SIGTERM', () => { cleanup(); process.exit(1); });

  try {
    await waitOn({ resources: [`http://localhost:${port}`], timeout: 30000 });
    console.log('✅ Server ready, running LHCI...');
    const lhciBin = require.resolve('@lhci/cli/src/cli.js');
    await run(process.execPath, [lhciBin, 'autorun', '--config=.lighthouserc.js'], { cwd: projectRoot });
  } finally {
    cleanup();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

