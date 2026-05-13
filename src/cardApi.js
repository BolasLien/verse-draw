const BIBLE_CARD_ENDPOINT = 'https://bible-api.com/data/cuv/random';
const BIBLE_PASSAGE_ENDPOINT = 'https://bible-api.com';
const FALLBACK_CARD = {
  description: '耶和華是我的牧者，我必不致缺乏。 — 詩篇 23:1',
  link: 'https://bible-api.com/PSA%2023%3A1?translation=cuv',
  isFallback: true,
};

function formatBibleCard(data) {
  const verse = data.random_verse;

  if (!verse) {
    throw new Error('抽卡資料格式錯誤');
  }

  const reference = `${verse.book} ${verse.chapter}:${verse.verse}`;
  const apiReference = `${verse.book_id} ${verse.chapter}:${verse.verse}`;

  return {
    description: `${verse.text.trim()} — ${reference}`,
    link: `${BIBLE_PASSAGE_ENDPOINT}/${encodeURIComponent(apiReference)}?translation=cuv`,
    isFallback: false,
  };
}

export async function fetchBibleCard() {
  let response;

  try {
    response = await fetch(BIBLE_CARD_ENDPOINT);
  } catch (error) {
    if (error instanceof TypeError) {
      return FALLBACK_CARD;
    }

    throw error;
  }

  if (!response.ok) {
    throw new Error('抽卡資料讀取失敗');
  }

  const data = await response.json();

  return formatBibleCard(data);
}

export { BIBLE_CARD_ENDPOINT };
