import { ExternalLink, RotateCcw, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { fetchBibleCard } from './cardApi';

const DRAW_DISTANCE = 120;

const initialCard = {
  description: '',
  link: '',
};

function DrawScene({ status, onDraw }) {
  const [dragOffset, setDragOffset] = useState(0);
  const startYRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  const isBusy = status === 'drawing' || status === 'revealing';

  function triggerDraw() {
    if (isBusy || hasTriggeredRef.current) {
      return;
    }

    hasTriggeredRef.current = true;
    setDragOffset(DRAW_DISTANCE);
    onDraw();
  }

  function handlePointerDown(event) {
    if (isBusy) {
      return;
    }

    event.currentTarget.setPointerCapture?.(event.pointerId);
    startYRef.current = event.clientY;
    hasTriggeredRef.current = false;
  }

  function handlePointerMove(event) {
    if (startYRef.current === null || isBusy) {
      return;
    }

    const nextOffset = Math.max(0, Math.min(event.clientY - startYRef.current, DRAW_DISTANCE));
    setDragOffset(nextOffset);

    if (nextOffset >= DRAW_DISTANCE) {
      triggerDraw();
    }
  }

  function handlePointerUp() {
    if (!hasTriggeredRef.current) {
      setDragOffset(0);
    }

    startYRef.current = null;
  }

  return (
    <section className="draw-scene" aria-label="抽卡起始畫面">
      <div className="scene-glow" />
      <div className="deck-frame">
        <div className="deck-label">
          <Sparkles aria-hidden="true" size={18} />
          <span>向下抽取經文</span>
        </div>
        <button
          className={`draw-card ${isBusy ? 'draw-card--drawing' : ''}`}
          type="button"
          aria-label="向下拖曳抽卡"
          disabled={isBusy}
          onClick={triggerDraw}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ transform: `translate3d(0, ${dragOffset}px, 0)` }}
        >
          <span className="draw-card__sigil">VD</span>
          <span className="draw-card__title">Verse Draw</span>
        </button>
        <div className="drop-zone" aria-hidden="true">
          {isBusy ? '抽取中' : '拖到這裡'}
        </div>
      </div>
    </section>
  );
}

function RevealScene({ status, card, onReset }) {
  const isRevealed = status === 'revealed';

  function handleSceneClick(event) {
    if (event.target.closest('a')) {
      return;
    }

    onReset();
  }

  return (
    <section
      className={`reveal-scene reveal-scene--${status}`}
      aria-label="抽卡結果"
      onClick={handleSceneClick}
    >
      <article className={`result-card ${isRevealed ? 'result-card--revealed' : ''}`}>
        <div className="result-card__back">VERSE</div>
        <div className="result-card__front">
          <div className="result-card__badge">{card.isFallback ? '備用經文' : '今日經文'}</div>
          <p className="result-card__description">
            {isRevealed ? card.description : '資料讀取中...'}
          </p>
          {isRevealed && card.link ? (
            <a className="result-card__link" href={card.link} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" size={16} />
              經文連結
            </a>
          ) : null}
          <button className="result-card__hint" type="button" aria-label="回到抽卡畫面" onClick={onReset}>
            <RotateCcw aria-hidden="true" size={15} />
            點擊畫面再抽一次
          </button>
        </div>
      </article>
    </section>
  );
}

function ErrorScene({ onReset }) {
  return (
    <section className="error-scene" aria-label="抽卡錯誤">
      <div className="error-panel">
        <p>抽卡資料讀取失敗，請再試一次。</p>
        <button type="button" onClick={onReset}>
          再抽一次
        </button>
      </div>
    </section>
  );
}

export default function App() {
  const [status, setStatus] = useState('idle');
  const [card, setCard] = useState(initialCard);

  async function handleDraw() {
    if (status !== 'idle') {
      return;
    }

    setStatus('drawing');

    try {
      const nextCard = await fetchBibleCard();
      setCard(nextCard);
      setStatus('revealing');
      window.setTimeout(() => {
        setStatus('revealed');
      }, 350);
    } catch {
      setStatus('error');
    }
  }

  function handleReset() {
    setStatus('idle');
    setCard(initialCard);
  }

  return (
    <main className="app-shell" role="application" aria-label="Verse Draw">
      <div className="phone-stage">
        {status === 'idle' || status === 'drawing' ? (
          <DrawScene status={status} onDraw={handleDraw} />
        ) : null}
        {status === 'revealing' || status === 'revealed' ? (
          <RevealScene status={status} card={card} onReset={handleReset} />
        ) : null}
        {status === 'error' ? <ErrorScene onReset={handleReset} /> : null}
      </div>
    </main>
  );
}
