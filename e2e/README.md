# Playwright E2E Pack (Staging)

Run tests:

```bash
cd e2e
npm i -D @playwright/test
npx playwright install --with-deps
E2E_BASE_URL=https://staging.conductores.lat npx playwright test
```
