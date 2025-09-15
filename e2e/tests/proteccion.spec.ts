import { test, expect } from '@playwright/test';

test('Simulación Step-down', async ({ page }) => {
  await page.goto('/proteccion');
  await page.getByText('Step-down').click();
  await expect(page.locator('#tir-post')).toBeVisible();
});

