import { test, expect } from '@playwright/test';

test.describe('QA Visual – Minimal Dark', () => {
  test('Botones primarios y secundarios usan tokens', async ({ page }) => {
    await page.goto('http://localhost:4200/login');

    const btnPrimary = page.locator('.btn-primary');
    await expect(btnPrimary.first()).toHaveCSS('background-color', 'rgb(6, 182, 212)');

    const btnSecondary = page.locator('.btn-secondary');
    await expect(btnSecondary.first()).toHaveCSS('background-color', 'rgb(31, 41, 55)');
  });

  test('Inputs y cards oscuros sin blur', async ({ page }) => {
    await page.goto('http://localhost:4200/dashboard');

    const input = page.locator('.ui-input').first();
    await expect(input).toHaveCSS('border-color', 'rgb(55, 65, 81)');

    const card = page.locator('.ui-card').first();
    await expect(card).toHaveCSS('background-color', 'rgb(31, 41, 55)');
  });

  test('Textos secundarios con contraste suficiente', async ({ page }) => {
    await page.goto('http://localhost:4200/dashboard');

    const textSecondary = page.locator('.text-secondary').first();
    await expect(textSecondary).toHaveCSS('color', 'rgb(229, 231, 235)');
  });

  test('No quedan colores hardcodeados peligrosos', async ({ page }) => {
    await page.goto('http://localhost:4200');

    const bodyText = await page.locator('body').innerHTML();
    expect(bodyText).not.toMatch(/#3b82f6|#3182ce/);
  });
});

