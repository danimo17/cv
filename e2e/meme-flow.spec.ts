import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import ca from '../i18n/locales/ca.json' with { type: 'json' }

const GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

const MEMES = [
  { id: 'm1', title: 'Cat typing', preview: GIF, full: GIF, width: 480, height: 480 },
  { id: 'm2', title: 'Dog coding', preview: GIF, full: GIF, width: 480, height: 480 },
  { id: 'm3', title: 'Monday mood', preview: GIF, full: GIF, width: 480, height: 480 },
]

/** En mode dev la hidratació arriba després de `load`: esperem xarxa quieta abans d'interactuar. */
async function visit(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/giphy/search**', (route) =>
    route.fulfill({ json: { items: MEMES, total: MEMES.length } })
  )
})

test('home renders CV sections', async ({ page }) => {
  await visit(page, '/')
  await expect(page.locator('h1')).toHaveText('Daniel Morales')
  for (const id of ['about', 'experience', 'stack', 'education', 'contact']) {
    await expect(page.locator(`#${id}`)).toBeVisible()
  }
  await expect(page.getByTestId('hero-image')).toBeVisible()

  const banner = page.getByTestId('source-banner')
  await expect(banner).toBeVisible()
  await expect(banner.getByRole('link', { name: 'danimo17/cv' }).first()).toHaveAttribute(
    'href',
    'https://github.com/danimo17/cv'
  )
})

test('search, pick and wear a meme', async ({ page }) => {
  await visit(page, '/meme')
  await page.fill('#meme-query', 'cat')
  await page.click('[data-testid="meme-search-submit"]')

  const cards = page.locator('[data-testid="meme-card"]')
  await expect(cards).toHaveCount(3)
  await cards.first().click()
  await expect(page.getByTestId('meme-preview')).toBeVisible()

  await page.getByTestId('meme-use').click()
  const success = page.getByTestId('meme-success')
  await expect(success).toBeVisible()
  await success.getByRole('link').click()

  await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/)
  const hero = page.getByTestId('hero-image')
  await expect(hero).toHaveAttribute('src', MEMES[0].full)
  await expect(page.getByTestId('hero-reset')).toBeVisible()

  // The store is in memory on purpose (decisió 004): a reload brings the real face back.
  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(hero).toBeVisible()
  await expect(hero).not.toHaveAttribute('src', MEMES[0].full)
  await expect(page.getByTestId('hero-reset')).toBeHidden()
})

test('theme toggle persists', async ({ page }) => {
  await visit(page, '/')
  await page.getByTestId('theme-toggle').click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('locale switch', async ({ page }) => {
  await visit(page, '/')
  await page.getByTestId('locale-ca').click()
  await expect(page).toHaveURL(/\/ca\/?$/)
  await expect(page.getByRole('heading', { level: 2, name: ca.about.title })).toBeVisible()
})

test('server route validates the query', async ({ request }) => {
  const missing = await request.get('/api/giphy/search')
  expect(missing.status()).toBe(400)

  const tooLong = await request.get('/api/giphy/search?q=' + 'a'.repeat(51))
  expect(tooLong.status()).toBe(400)

  const badLimit = await request.get('/api/giphy/search?q=cat&limit=99')
  expect(badLimit.status()).toBe(400)
})
