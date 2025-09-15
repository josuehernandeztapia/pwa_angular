import { test, expect } from '@playwright/test';

test('Evasivo nervioso con admisión = HIGH', async ({ page }) => {
  await page.goto('/avi');
  // mock respuesta evasiva con admisión
  await expect(page.locator('#decision')).toHaveText('HIGH');
});

