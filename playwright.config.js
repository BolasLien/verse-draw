import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:5175/verse-draw/',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --port 5175',
    url: 'http://127.0.0.1:5175/verse-draw/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
