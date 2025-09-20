import { test, expect } from '@playwright/test';

test('UI Minimal Dark validation', async ({ page }) => {
  // Login
  await page.goto('http://localhost:4200/login');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(11, 15, 20)');
  const primaryBtn = page.locator('.btn-primary').first();
  if (await primaryBtn.count()) {
    await expect(primaryBtn).toHaveCSS('background-color', 'rgb(6, 182, 212)');
    await expect(primaryBtn).not.toHaveCSS('background-image', /gradient/ as any);
  }

  // Dashboard
  await page.goto('http://localhost:4200/dashboard');
  const uiCard = page.locator('.ui-card').first();
  if (await uiCard.count()) {
    await expect(uiCard).toHaveCSS('background-color', 'rgb(31, 41, 55)');
    await expect(uiCard).not.toHaveCSS('backdrop-filter', /blur/ as any);
  }

  // Icons (monochrome)
  const monoIcon = page.locator('app-premium-icon i').first();
  if (await monoIcon.count()) {
    await expect(monoIcon).toHaveCSS('color', 'rgb(243, 244, 246)');
  }

  // Status tags (optional presence)
  const ok = page.locator('.status.ok');
  if (await ok.count()) {
    await expect(ok).toHaveCSS('color', 'rgb(16, 185, 129)');
  }
  const warn = page.locator('.status.warn');
  if (await warn.count()) {
    await expect(warn).toHaveCSS('color', 'rgb(245, 158, 11)');
  }
  const err = page.locator('.status.err');
  if (await err.count()) {
    await expect(err).toHaveCSS('color', 'rgb(239, 68, 68)');
  }
});

