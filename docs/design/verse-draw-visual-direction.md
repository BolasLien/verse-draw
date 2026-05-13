# Verse Draw Visual Direction

## Direction

`Verse Draw` 採用「安靜靈修卡」風格。畫面應該像每天抽出一張可沉澱閱讀的經文卡，而不是遊戲化占卜、華麗卡牌或強烈宗教裝飾。

## Product Feel

- 安靜、溫和、專注。
- 第一眼要知道這是抽經文，不是抽獎或占卜。
- 互動保留「抽卡」的儀式感，但節奏要克制。
- 經文是主角，裝飾只服務閱讀與氛圍。

## Visual Language

### Color

- 主背景：溫暖的深色或柔和米白，不使用高飽和霓虹色。
- 卡片：溫白、淡金、低彩度藍灰或柔和石色。
- 重點色：淡金或暖琥珀，用於抽卡提示、經文連結、焦點狀態。
- 避免整體變成單一深藍/紫色調，也避免過度羊皮紙復古感。

### Typography

- 中文經文需要高可讀性，優先使用系統 sans-serif。
- 經文文字可以稍微放大，但不要 hero-size。
- 章節出處應清楚但比經文低一階。
- 不使用過度裝飾性的字體。

### Layout

- 手機優先，桌機置中呈現一個直式閱讀/抽卡舞台。
- 初始畫面直接呈現可互動卡片，不做 landing page。
- 結果卡片需要給經文足夠行距與留白。
- 卡片與操作文字不可重疊；長經文需要能自然換行。

### Card

- 卡片形狀保持簡潔，圓角不超過 8px。
- 卡背可以使用簡單符號或 `VERSE`，不需要複雜插圖。
- 卡面包含：
  - 狀態 badge，例如「今日經文」或「備用經文」
  - 經文內容
  - 經文出處
  - 經文連結
  - 返回/再抽提示

### Motion

- 拖曳抽卡保留。
- 翻卡動畫保留，但速度要平穩，不要過度彈跳或誇張放大。
- reveal 之後經文淡入即可。
- fallback 狀態不需要強烈警示，應像一張正常備用經文卡。

## Copy Direction

- App name: `Verse Draw`
- 中文描述可用「抽一段經文」或「向下抽取經文」。
- 結果連結文案用「經文連結」。
- fallback badge 用「備用經文」。
- 避免過度說明功能、快捷鍵或技術細節。

## Implementation Notes

- Keep the current React interaction flow intact:
  - initial draw screen
  - drag/click to draw
  - reveal animation
  - Bible verse display
  - scripture link
  - click to reset
- Use existing React + CSS structure unless a small split improves clarity.
- Avoid adding a UI or animation library unless the current CSS becomes insufficient.
- Validate desktop and mobile viewports with Chrome DevTools MCP after implementation.

## Acceptance Criteria

- The first screen feels calm and devotional.
- The user can immediately understand how to draw a verse.
- The result screen prioritizes reading the verse.
- Long Chinese verses remain readable without overlapping UI.
- The app still passes `npm run test` and `npm run build`.
