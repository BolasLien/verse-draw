import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import App from './App';

const apiCard = {
  description: '神愛世人，甚至將他的獨生子賜給他們。 — 約翰福音 3:16',
  link: 'https://bible-api.com/JHN%203%3A16?translation=cuv',
};

function mockSuccessfulCard() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({
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
}

describe('App draw flow', () => {
  beforeEach(() => {
    mockSuccessfulCard();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('starts on the playable draw screen', () => {
    render(<App />);

    expect(screen.getByRole('application', { name: 'Verse Draw' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '向下拖曳抽卡' })).toBeInTheDocument();
    expect(screen.getByText('向下抽取經文')).toBeInTheDocument();
  });

  test('dragging the card fetches data, reveals the result, and allows drawing again', async () => {
    const user = userEvent.setup();
    render(<App />);

    const drawCard = screen.getByRole('button', { name: '向下拖曳抽卡' });
    drawCard.focus();
    await user.keyboard('{Enter}');

    expect(fetch).toHaveBeenCalledWith('https://bible-api.com/data/cuv/random');

    expect(await screen.findByText(apiCard.description)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: '經文連結' });
    expect(link).toHaveAttribute('href', apiCard.link);

    await user.click(screen.getByRole('button', { name: '回到抽卡畫面' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '向下拖曳抽卡' })).toBeInTheDocument();
    });
  });

  test('pulling the card past the drop threshold starts the draw flow', async () => {
    render(<App />);

    const drawCard = screen.getByRole('button', { name: '向下拖曳抽卡' });
    fireEvent.pointerDown(drawCard, { pointerId: 1, clientY: 100 });
    fireEvent.pointerMove(drawCard, { pointerId: 1, clientY: 230 });
    fireEvent.pointerUp(drawCard, { pointerId: 1, clientY: 230 });

    expect(fetch).toHaveBeenCalledWith('https://bible-api.com/data/cuv/random');
    expect(await screen.findByText(apiCard.description)).toBeInTheDocument();
  });

  test('shows a retryable error state when fetching the card fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 500,
      })),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '向下拖曳抽卡' }));

    expect(await screen.findByText('抽卡資料讀取失敗，請再試一次。')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '再抽一次' }));

    expect(screen.getByRole('button', { name: '向下拖曳抽卡' })).toBeInTheDocument();
  });

  test('reveals a fallback card when the API host is unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '向下拖曳抽卡' }));

    expect(await screen.findByText('耶和華是我的牧者，我必不致缺乏。 — 詩篇 23:1')).toBeInTheDocument();
    expect(screen.getByText('備用經文')).toBeInTheDocument();
  });
});
