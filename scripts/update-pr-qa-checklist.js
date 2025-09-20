const https = require('https');
const { execSync } = require('child_process');

function parseRemote() {
  const remote = execSync('git remote get-url origin').toString().trim();
  // Examples:
  // https://x-access-token:TOKEN@github.com/owner/repo
  // https://x-access-token:TOKEN@github.com/owner/repo.git
  // git@github.com:owner/repo.git
  const httpsMatch = remote.match(/^https:\/\/x-access-token:([^@]+)@github.com\/(.+?)\/(.+?)(?:\.git)?$/);
  if (httpsMatch) {
    const token = httpsMatch[1];
    const owner = httpsMatch[2];
    const repo = httpsMatch[3];
    return { token, owner, repo };
  }
  const sshMatch = remote.match(/github.com:(.+?)\/(.+?)\.git$/);
  if (sshMatch) {
    const owner = sshMatch[1];
    const repo = sshMatch[2];
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!token) throw new Error('No GitHub token available in env for SSH remote.');
    return { token, owner, repo };
  }
  throw new Error('Unsupported remote URL format');
}

function ghRequest({ method, path, token, data }) {
  const options = {
    hostname: 'api.github.com',
    path,
    method,
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'pr-updater-script',
      'Accept': 'application/vnd.github+json',
    },
  };
  const body = data ? JSON.stringify(data) : undefined;
  if (body) options.headers['Content-Type'] = 'application/json';
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let chunks = '';
      res.on('data', (d) => (chunks += d));
      res.on('end', () => {
        const status = res.statusCode || 0;
        if (status >= 200 && status < 300) {
          try {
            resolve(chunks ? JSON.parse(chunks) : {});
          } catch {
            resolve({});
          }
        } else {
          reject(new Error(`GitHub API ${method} ${path} failed: ${status} ${chunks}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const prNumber = Number(process.argv[2] || '0');
  if (!prNumber) throw new Error('PR number is required as first argument');

  const { token, owner, repo } = parseRemote();

  const checklist = `\n\n### ✅ QA Checklist – Minimal Dark\n\n- [ ] **Vacíos/Errores**: Empty states y mensajes de error sin gradientes; ilustraciones/íconos no rompen contraste.  \n- [ ] **Responsive**:  \n  - Revisar en 1440/820/390 px → layouts sin recortes, sin overflow inesperado.  \n  - Botones “tappeables” en mobile (espaciado suficiente).  \n- [ ] **Accesibilidad**:  \n  - Navegación por teclado en flujos principales.  \n  - Labels/aria en formularios clave.  \n  - Contraste: textos secundarios legibles.  \n- [ ] **Visual & Lint**:  \n  - No se ven gradientes ni glass en pantallas principales.  \n  - \`grep "linear-gradient|backdrop-filter"\` no encuentra usos en UI minimal.  \n- [ ] **Rendimiento**:  \n  - Primer paint fluido, sin shimmer/animaciones brillantes residuales.  \n  - No hay animaciones que distorsionen lectura.  \n- [ ] **Regresiones**: Revisión rápida de rutas clave: \`/login\`, \`/dashboard\`, \`/clientes\`, \`/cotizador\`, \`/perfil\`, \`/documentos\`, \`/entregas\`, \`/configuracion\`.
`;

  const pr = await ghRequest({ method: 'GET', path: `/repos/${owner}/${repo}/pulls/${prNumber}`, token });
  const currentBody = typeof pr.body === 'string' ? pr.body : '';

  if (currentBody.includes('### ✅ QA Checklist – Minimal Dark')) {
    // Already appended; nothing to do
    return;
  }

  const newBody = (currentBody || '').trimEnd() + checklist;
  await ghRequest({ method: 'PATCH', path: `/repos/${owner}/${repo}/pulls/${prNumber}`, token, data: { body: newBody } });
}

main().catch((err) => {
  console.error('Failed to update PR description:', err.message || err);
  process.exit(1);
});

