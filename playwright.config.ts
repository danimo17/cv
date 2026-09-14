import { defineConfig, devices } from '@playwright/test'

const PORT = 3100

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'on-first-retry', colorScheme: 'light' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // ponytail: e2e contra `nuxt dev`; el build de Cloudflare no es pot servir amb node (decisió 019).
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
