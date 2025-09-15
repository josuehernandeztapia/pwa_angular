import { test, expect } from '@playwright/test';

test('Delay muestra nuevo compromiso', async ({ page }) => {
  await page.goto('/entregas');
  await page.locator('#simulate-delay').click();
  await expect(page.locator('#nuevo-compromiso')).toBeVisible();
});

