import { test, expect, Page } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

async function mockAuth(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'demo_jwt_token_' + Date.now());
    localStorage.setItem('refresh_token', 'demo_refresh_token_' + Date.now());
    localStorage.setItem('current_user', JSON.stringify({ id: '1', name: 'Asesor Demo', email: 'demo@conductores.com', role: 'asesor', permissions: [] }));
  });
}

async function stabilize(page: Page) {
  await page.addStyleTag({ content: `
    html, body, * { scroll-behavior: auto !important; }
    *::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }
    * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
    input, textarea, [contenteditable="true"] { caret-color: transparent !important; }
    [data-dynamic], time, .counter, canvas, video { visibility: hidden !important; }
  ` });
}

function ensureScreenshotsDir(): string {
  const dir = path.resolve('tests/screenshots/no-core');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

test.describe('No-Core QA Suite (PR#14–PR#18)', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await stabilize(page);
  });

  test('Postventa (wizard) validations and screenshots', async ({ page }) => {
    const shots = ensureScreenshotsDir();

    // Go to wizard
    await page.goto('/postventa/wizard', { waitUntil: 'networkidle' });

    // Basic UI primitives
    await expect(page.locator('.ui-card').first()).toBeVisible();
    await expect(page.locator('.ui-btn').first()).toBeVisible();
    await expect(page.locator('.ui-input').first()).toBeVisible();

    // Start flow
    const startBtn = page.getByRole('button', { name: /iniciar/i }).first();
    if (await startBtn.isVisible()) await startBtn.click();

    // After starting, upload should be enabled
    const upload = page.locator('[data-cy="postventa-upload"]').first();
    await expect(upload).toBeVisible();

    // Take screenshot of fotos step card
    await page.screenshot({ path: path.join(shots, 'postventa-fotos.png'), fullPage: true });

    // OCR status shows Pendiente initially
    const ocr = page.locator('[data-cy="postventa-ocr"]').first();
    await expect(ocr).toContainText(/Pendiente/i);
    await page.screenshot({ path: path.join(shots, 'postventa-ocr.png') });

    // Nudge OCR results to be deterministic OK (override randomness)
    await page.evaluate(() => { (Math as any).random = () => 0.95; });

    // Upload 3 required steps to reach Validado
    const inputs = page.locator('[data-cy="postventa-upload"]');
    const count = await inputs.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      const input = inputs.nth(i);
      // Use a tiny data file as placeholder; content is ignored by app
      await input.setInputFiles({ name: 'photo.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') });
      // Allow processing
      await page.waitForTimeout(500);
    }

    // Expect OCR summary to flip to Validado once all are good
    await expect(ocr).toContainText(/Validado/i, { timeout: 10000 });

    // Refacciones table rendered when feature flag on
    const refTable = page.locator('[data-cy="postventa-refacciones"]');
    if (await refTable.count()) {
      await expect(refTable.first()).toBeVisible();
    }

    // A11y
    await injectAxe(page);
    await checkA11y(page, undefined, { includedImpacts: ['critical', 'serious'] });
  });

  test('GNV panel shows table and statuses + screenshots', async ({ page }) => {
    const shots = ensureScreenshotsDir();
    await page.goto('/ops/gnv-health', { waitUntil: 'networkidle' });

    await expect(page.locator('.ui-card').first()).toBeVisible();
    await expect(page.locator('.ui-btn').first()).toBeVisible();
    await expect(page.locator('.ui-input').first()).toBeVisible();

    await expect(page.locator('[data-cy="gnv-table"]')).toBeVisible({ timeout: 15000 });
    // Status texts
    await expect(page.getByText('OK')).toBeVisible();
    await expect(page.getByText('Degradado')).toBeVisible();
    await expect(page.getByText('Offline')).toBeVisible();

    await page.screenshot({ path: path.join(shots, 'gnv-salud.png'), fullPage: true });
    await page.screenshot({ path: path.join(shots, 'gnv-csv.png') });

    await injectAxe(page);
    await checkA11y(page, undefined, { includedImpacts: ['critical', 'serious'] });
  });

  test('Integraciones Externas (Odoo/Neon/Callbacks) validations + screenshots', async ({ page }) => {
    const shots = ensureScreenshotsDir();
    const targets = [
      { path: '/integraciones/odoo', key: 'odoo' },
      { path: '/integraciones/neon', key: 'neon' },
      { path: '/integraciones/callbacks', key: 'callbacks' },
    ];

    for (const t of targets) {
      await test.step(`Visit ${t.key}`, async () => {
        await page.goto(t.path, { waitUntil: 'networkidle' });
        // UI primitives
        await expect(page.locator('.ui-card').first()).toBeVisible();
        await expect(page.locator('.ui-btn').first()).toBeVisible();
        await expect(page.locator('.ui-input').first()).toBeVisible();
        // Request card exists
        await expect(page.locator(`.ui-card[data-cy="${t.key}-request"]`)).toBeVisible();
        // Status text shows one of expected values
        const status = page.locator(`[data-cy="${t.key}-status"]`).first();
        await expect(status).toContainText(/Pendiente|Completado|Error/);
        await page.screenshot({ path: path.join(shots, `${t.key}.png`) });
        await injectAxe(page);
        await checkA11y(page, undefined, { includedImpacts: ['critical', 'serious'] });
      });
    }
  });

  test('Administración/Usuarios table and columns + screenshot', async ({ page }) => {
    const shots = ensureScreenshotsDir();
    await page.goto('/usuarios', { waitUntil: 'networkidle' });
    // UI primitives
    await expect(page.locator('.ui-card').first()).toBeVisible();
    await expect(page.locator('.ui-btn').first()).toBeVisible();
    await expect(page.locator('.ui-input').first()).toBeVisible();
    await expect(page.locator('[data-cy="usuarios-table"]')).toBeVisible();
    await expect(page.getByText('Nombre')).toBeVisible();
    await expect(page.getByText('Rol')).toBeVisible();
    await expect(page.getByText('Estado')).toBeVisible();
    await page.screenshot({ path: path.join(shots, 'usuarios.png'), fullPage: true });
    await injectAxe(page);
    await checkA11y(page, undefined, { includedImpacts: ['critical', 'serious'] });
  });

  test('Responsive (desktop/tablet/mobile) + Offline redirect + screenshots', async ({ page, browserName }) => {
    const shots = ensureScreenshotsDir();

    // Desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-cy="sidebar-desktop"]')).toBeVisible();
    await page.screenshot({ path: path.join(shots, 'responsive-desktop.png') });

    // Tablet
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-cy="sidebar-desktop"]')).toBeVisible();
    // Mobile sidebar should not be visible on tablet breakpoint
    await expect(page.locator('[data-cy="sidebar-mobile"]')).toBeHidden();
    await page.screenshot({ path: path.join(shots, 'responsive-tablet.png') });

    // Mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    const mobileToggle = page.locator('[data-cy="mobile-menu-toggle"]');
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click();
    }
    // Overlay active
    const overlay = page.locator('[data-cy="overlay"]');
    await expect(overlay).toHaveClass(/fixed/);
    await page.screenshot({ path: path.join(shots, 'responsive-mobile.png') });

    // Dark mode sanity (toggle via DOM class)
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await injectAxe(page);
    await checkA11y(page, undefined, { includedImpacts: ['critical', 'serious'] });

    // Offline simulation -> should go to offline page
    await page.context().setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    // Give router time to redirect
    await page.waitForTimeout(300);
    await expect(page.locator('[data-cy="offline-page"]')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: path.join(shots, 'offline.png'), fullPage: true });
    await page.context().setOffline(false);
  });
});

