import { test, expect } from '@playwright/test';

test('Timeline entrega', async ({ page }) => {
  await page.goto('/tanda');
  await page.fill('#aportes', '5000');
  await expect(page.locator('#te-toca')).toContainText('Mes');
});

