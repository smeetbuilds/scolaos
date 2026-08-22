import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;
const dataDirectory = `.cache/playwright-e2e-${process.pid}-${Date.now()}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  ...(isCI ? { workers: 1 } : {}),
  reporter: isCI
    ? [['line'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : 'list',
  outputDir: 'test-results',
  webServer: {
    command: 'pnpm --filter @scolaos/server build && node apps/server/dist/index.js',
    url: `${baseURL}/health`,
    reuseExistingServer: !isCI,
    timeout: 30_000,
    env: {
      HOST: '127.0.0.1',
      PORT: String(port),
      SCOLA_DATA_DIR: dataDirectory,
    },
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
