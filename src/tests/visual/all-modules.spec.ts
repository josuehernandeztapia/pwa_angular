import { expect, Page, test } from '@playwright/test';

async function mockAuth(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'demo_jwt_token_' + Date.now());
    localStorage.setItem('refresh_token', 'demo_refresh_token_' + Date.now());
    localStorage.setItem('current_user', JSON.stringify({ id: '1', name: 'Asesor Demo', email: 'demo@conductores.com', role: 'asesor', permissions: [] }));
  });
}

const routes = [
  { path: '/dashboard', tag: '@dashboard', heading: '📊' },
  { path: '/nueva-oportunidad', tag: '@nueva-oportunidad', heading: '➕ Nueva Oportunidad' },
  { path: '/clientes', tag: '@clientes-list', heading: '👥 Gestión de Clientes' },
  { path: '/clientes/nuevo', tag: '@cliente-form', heading: '🧾' },
  { path: '/cotizador', tag: '@cotizador-main', heading: '🧮 Simulador de Soluciones' },
  { path: '/cotizador/ags-individual', tag: '@ags-individual', heading: 'AGS' },
  { path: '/cotizador/edomex-colectivo', tag: '@edomex-colectivo', heading: 'EdoMex' },
  { path: '/simulador', tag: '@simulador-main', heading: 'Simulador' },
  { path: '/simulador/ags-ahorro', tag: '@ags-ahorro', heading: 'Ahorro' },
  { path: '/simulador/edomex-individual', tag: '@edomex-individual', heading: 'Edomex' },
  { path: '/simulador/tanda-colectiva', tag: '@tanda-colectiva', heading: 'Tanda' },
  { path: '/onboarding', tag: '@onboarding', heading: 'Configuración Inicial' },
  { path: '/document-upload', tag: '@document-upload', heading: 'Carga de Documentos' },
  { path: '/oportunidades', tag: '@opportunities', heading: 'Pipeline' },
  { path: '/expedientes', tag: '@expedientes', heading: '📂 Expedientes' },
  { path: '/ops/deliveries', tag: '@ops-deliveries', heading: 'Entregas' },
  { path: '/ops/triggers', tag: '@triggers', heading: 'Triggers' },
  { path: '/reportes', tag: '@reportes', heading: 'Reportes' },
  { path: '/productos', tag: '@productos', heading: 'Productos' },
  { path: '/proteccion', tag: '@proteccion', heading: '🛡️ Sistema de Protección' },
  { path: '/perfil', tag: '@perfil', heading: 'Perfil' },
];

test.describe('Premium visual across modules', () => {
  for (const r of routes) {
    test(`${r.tag} should render premium container and take snapshot`, async ({ page }: { page: Page }) => {
      await mockAuth(page);
      await page.goto(r.path);
      // Check that a container exists and has background applied
      const container = page.locator('div[class*="container"], .premium-container');
      await expect(container.first()).toBeVisible();
      // Basic header presence if known
      if (r.heading) {
        await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
      }
      await expect(page).toHaveScreenshot();
    });
  }
});

