import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://bible-api.com/data/cuv/random', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        translation: {
          identifier: 'cuv',
          name: 'Chinese Union Version',
        },
        random_verse: {
          book_id: 'PSA',
          book: '詩篇',
          chapter: 85,
          verse: 13,
          text: '公義要行在他面前，叫他的腳蹤成為可走的路。',
        },
      }),
    });
  });
});

test('draws a Bible verse and returns to the initial screen', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('application', { name: 'Verse Draw' })).toBeVisible();
  const drawCard = page.getByRole('button', { name: '向下拖曳抽卡' });
  await expect(drawCard).toBeVisible();

  const box = await drawCard.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move(box.x + box.width / 2, box.y + 24);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 164);
  await page.mouse.up();

  const descendingCard = page.locator('.result-card--descending');
  await expect(descendingCard).toBeVisible();
  await expect(page.getByText('經文正在降下...')).toBeVisible();

  await expect(page.getByText('公義要行在他面前，叫他的腳蹤成為可走的路。 — 詩篇 85:13')).toBeVisible();
  await expect(page.getByRole('link', { name: '經文連結' })).toHaveAttribute(
    'href',
    'https://bible-api.com/PSA%2085%3A13?translation=cuv',
  );

  await page.getByRole('button', { name: '回到抽卡畫面' }).click();
  await expect(drawCard).toBeVisible();
});
