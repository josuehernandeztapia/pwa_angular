import { expect, test } from '@playwright/test';

test('UI Minimal Dark validation', async ({ page }) => {
  // Login
  await page.goto('http://localhost:4200/login');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(11, 15, 20)');
  const uiInput = page.locator('.ui-input').first();
  if (await uiInput.count()) {
    await expect(uiInput).toHaveCSS('border-color', 'rgb(55, 65, 81)');
  }
  const primaryBtn = page.locator('.btn-primary').first();
  if (await primaryBtn.count()) {
    await expect(primaryBtn).toHaveCSS('background-color', 'rgb(6, 182, 212)');
    // assertion de gradiente eliminada según lineamientos Minimal Dark
  }

  // Visual snapshot - Login
  await expect(page).toHaveScreenshot('login-minimal-dark.png');

  // Dashboard
  await page.goto('http://localhost:4200/dashboard');
  const uiCard = page.locator('.ui-card').first();
  if (await uiCard.count()) {
    await expect(uiCard).toHaveCSS('background-color', 'rgb(31, 41, 55)');
    // assertion de backdrop-filter eliminada según lineamientos Minimal Dark
  }

  // Visual snapshot - Dashboard
  await expect(page).toHaveScreenshot('dashboard-minimal-dark.png');

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

