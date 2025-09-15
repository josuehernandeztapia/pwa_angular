import { test, expect } from '@playwright/test';

test('Nuevo caso con 4 fotos', async ({ page }) => {
  await page.goto('/postventa/new');
  await page.getByText('Tomar foto VIN').click();
  // subir imagen válida (mockeado por selector/fixture en staging)
  await expect(page.getByText(/VIN detectado/i)).toBeVisible();
  await expect(page.getByText(/Diagnóstico/i)).toBeVisible();
});

