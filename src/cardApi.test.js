import { afterEach, describe, expect, test, vi } from 'vitest';
import { fetchBibleCard } from './cardApi';

describe('fetchBibleCard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('returns a formatted Bible verse card from the random CUV Bible API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          translation: {
            identifier: 'cuv',
            name: 'Chinese Union Version',
          },
          random_verse: {
            book_id: 'JHN',
            book: '約翰福音',
            chapter: 3,
            verse: 16,
            text: '神愛世人，甚至將他的獨生子賜給他們。',
          },
        }),
      })),
    );

    await expect(fetchBibleCard()).resolves.toEqual({
      description: '神愛世人，甚至將他的獨生子賜給他們。 — 約翰福音 3:16',
      link: 'https://bible-api.com/JHN%203%3A16?translation=cuv',
      isFallback: false,
    });

    expect(fetch).toHaveBeenCalledWith('https://bible-api.com/data/cuv/random');
  });

  test('throws a readable error when the API request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 503,
      })),
    );

    await expect(fetchBibleCard()).rejects.toThrow('抽卡資料讀取失敗');
  });

  test('returns a local fallback card when the API host cannot be reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );

    await expect(fetchBibleCard()).resolves.toEqual({
      description: '耶和華是我的牧者，我必不致缺乏。 — 詩篇 23:1',
      link: 'https://bible-api.com/PSA%2023%3A1?translation=cuv',
      isFallback: true,
    });
  });
});
