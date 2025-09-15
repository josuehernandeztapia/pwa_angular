import { test, expect } from '@playwright/test';

test('Calcular PMT', async ({ page }) => {
  await page.goto('/cotizador');
  await page.fill('#enganche', '25%');
  await expect(page.locator('#pmt')).toHaveText(/34,336/);
});

