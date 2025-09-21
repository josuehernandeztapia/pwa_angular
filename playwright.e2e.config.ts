/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [
    ['list'],
    ['html']
  ],
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: {
    command: 'npm run serve:test',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 600 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
  timeout: 60 * 1000,
  outputDir: './test-results/e2e',
});

