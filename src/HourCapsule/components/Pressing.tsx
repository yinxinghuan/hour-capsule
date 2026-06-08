// Vacuum-seal placeholder while LLM picks subject + gen-image runs.
// Progressive disclosure to soften the wait:
//   · 'checking' → a couple of world-event fragments tick past, hinting
//     at the curator's reading material
//   · 'picking'  → the same fragments stay visible, "the curator is
//     choosing..." copy
//   · 'sealing'  → the chosen subject is revealed in italics, so the
//     user has 10-20s of anticipation about what's coming out of the bag
import { useEffect, useState } from 'react';

interface Props {
  stage: 'checking' | 'picking' | 'sealing';
  /** A few world-event lines being read by the curator (best-effort).
   *  Shown as a quiet ticker during 'checking' + 'picking'. */
  events?: string[];
  /** Filled once pickSubject() returns. Shown during 'sealing' so the
   *  user knows WHAT is being sealed before the image arrives. */
  subject?: string;
}

const TICKER_INTERVAL_MS = 2200;
const COUNTDOWN_START_S = 30;

// Quiet whispers of what's happening behind the curtain during the
// sealing wait — gen-image, stamping, vacuum, archiving. Rotated so the
// 10-20s of dead air feels like the bag is being actively built.
const SEALING_WHISPERS = [
  'calibrating vacuum pressure',
  'inking the mfg timestamp',
  'filing your owner serial',
  'pressing the seal strips',
  'measuring the bag — 1024 micron film',
  'dusting with sterile light',
  'logging this hour to the archive',
  'matching the α tag to its domain',
  'spinning down the centrifuge',
  'checking the bag for pinholes',
];

type TickerItem = { kind: 'event' | 'whisper'; text: string };

export default function Pressing({ stage, events = [], subject }: Props) {
  // Pool the ticker draws from.
  //   · checking / picking  → world events only (curator's reading list)
  //   · sealing             → world events FIRST + ALL of them, then a
  //                           couple of process whispers as filler. Real
  //                           headlines are the more interesting content,
  //                           so they get primacy + a brighter style.
  const tickerPool: TickerItem[] =
    stage === 'sealing'
      ? [
          ...events.map(e => ({ kind: 'event' as const, text: e })),
          ...SEALING_WHISPERS.map(w => ({ kind: 'whisper' as const, text: w })),
        ]
      : events.map(e => ({ kind: 'event' as const, text: e }));

  const [tickerIdx, setTickerIdx] = useState(0);
  useEffect(() => {
    setTickerIdx(0);
    if (tickerPool.length === 0) return;
    const t = setInterval(
      () => setTickerIdx(i => (i + 1) % tickerPool.length),
      TICKER_INTERVAL_MS,
    );
    return () => clearInterval(t);
  }, [stage, tickerPool.length]);

  const tickerItem = tickerPool.length > 0 ? tickerPool[tickerIdx % tickerPool.length] : null;

  // Live countdown — starts at 30, resets on every stage change. When it
  // bottoms out and the result still isn't here, copy switches to
  // "almost done…" so the wait doesn't feel stuck.
  const [seconds, setSeconds] = useState(COUNTDOWN_START_S);
  useEffect(() => {
    setSeconds(COUNTDOWN_START_S);
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [stage]);
  const countdownLabel = seconds > 0 ? `~ ${seconds}s` : 'almost there…';

  let headline: string;
  let footLabel: string;
  if (stage === 'checking') {
    headline = '— reading the world —';
    footLabel = 'checking';
  } else if (stage === 'picking') {
    headline = '— the curator is choosing —';
    footLabel = 'picking';
  } else {
    headline = subject
      ? '— sealing —'
      : '— vacuum-sealing your capsule —';
    footLabel = 'sealing';
  }

  return (
    <div className="tsp-pressing">
      <div className="tsp-pressing__centre">
        <div className="tsp-kiln">
          <div className="tsp-kiln__mark">
            <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M170.98 80.6864C175.826 80.3379 179.093 82.8464 180.922 87.1309C184.554 95.5742 179.373 98.9845 175.515 105.325C163.859 124.48 165.503 149.557 163.744 170.582C161.932 192.259 154.492 222.584 132.269 231.923C124.974 234.989 114.517 234.372 107.397 231.013C70.2537 212.926 93.1286 160.103 105.525 133.265C109.335 126.098 112.98 118.784 117.907 112.277C121.491 107.547 127.748 104.724 132.998 108.827C135.386 110.694 136.494 114.684 135.563 117.517C133.513 123.752 129.105 129.175 126.136 135.017C117.204 151.711 107.57 173.577 108.149 192.736C108.648 197.729 110.443 203.949 114.709 207.163C121.717 212.44 129.246 209.446 133.613 202.772C139.289 194.091 141.378 184.867 142.431 174.855C143.583 164.684 143.524 154.864 144.04 144.611C144.994 125.736 146.094 103.972 158.412 88.4443C161.509 84.5388 165.905 81.2324 170.98 80.6864Z"/>
              <path d="M86.9111 55.8511C87.5972 55.021 88.2531 54.3294 88.9727 53.5417C91.25 52.4699 98.6717 56.4898 104.848 54.7181C114.926 51.8253 124.216 44.6228 133.929 32.5885C137.352 28.3472 139.875 23.9207 143.53 19.8896C144.863 19.2069 144.275 19.3179 145.281 19.7403C145.408 20.3861 145.647 21.0867 144.974 22.1183C129.708 45.5149 124.762 63.0491 135.86 73.3957C137.561 74.9843 140.36 76.5377 141.933 78.4606L140.234 80.9976C139.451 81.6669 139.143 82.0962 138.465 81.9081C133.792 80.6128 129.85 79.3599 124.485 79.4064C114.232 79.4902 104.957 91.2197 95.9169 103.826C93.848 106.711 90.2527 112.469 87.8923 114.692C86.2512 115.246 86.8375 115.356 85.9333 114.646C86.1422 111.648 90.6859 105.295 92.5935 101.966C103.729 82.5318 103.185 67.3286 93.9942 61.1122C92.4408 60.0674 87.4627 58.0224 86.9111 55.8511Z"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="tsp-pressing__inscription tsp-pressing__inscription--blind">
        {headline}
      </div>

      {/* During sealing, the chosen subject is shown so the user knows
          what's coming — kills dead-air anxiety while the image renders. */}
      {stage === 'sealing' && subject && (
        <div className="tsp-pressing__subject">{subject}</div>
      )}

      {/* Ticker: world events get primacy + a brighter style; process
          whispers are filler so the ticker never goes blank. */}
      {tickerItem && (
        <div
          key={`${tickerItem.kind}-${tickerIdx}`}
          className={
            'tsp-pressing__ticker' +
            (tickerItem.kind === 'event' ? ' tsp-pressing__ticker--event' : '')
          }
        >
          {tickerItem.kind === 'event' && stage === 'sealing' && (
            <span className="tsp-pressing__ticker-tag">from the wire · </span>
          )}
          {tickerItem.text}
        </div>
      )}

      <div className="tsp-pressing__foot">
        <em>{footLabel} your capsule</em>
        <div className="tsp-loader"><span /><span /><span /></div>
        <div className="tsp-pressing__est">{countdownLabel}</div>
      </div>
    </div>
  );
}
