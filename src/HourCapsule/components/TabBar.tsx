// Bottom tab bar — Field · Collect pill · Shelf. The Collect pill shows
// "Collect" + a small "1/hr" line when available; when on cooldown, it
// shows "Next" + the time remaining. Tap during cooldown opens the
// cooldown modal.
import { useEffect, useState } from 'react';
import { formatCountdown, msUntilNextCollect } from '../utils/day';

export type Tab = 'field' | 'altar';

interface Props {
  active: Tab;
  lastCollectAt?: number;
  onTab: (t: Tab) => void;
  onCollect: () => void;
}

export default function TabBar({ active, lastCollectAt, onTab, onCollect }: Props) {
  const [remaining, setRemaining] = useState(() => msUntilNextCollect(lastCollectAt));
  useEffect(() => {
    setRemaining(msUntilNextCollect(lastCollectAt));
    const t = setInterval(() => setRemaining(msUntilNextCollect(lastCollectAt)), 1000);
    return () => clearInterval(t);
  }, [lastCollectAt]);

  const exhausted = remaining > 0;
  const countdown = exhausted ? formatCountdown(remaining) : '';

  return (
    <div className="tsp-tabbar">
      <button
        className={`tsp-tabbar__btn${active === 'field' ? ' is-active' : ''}`}
        onPointerDown={() => onTab('field')}
      >
        <span className="glyph">⌖</span>
        Field
      </button>

      <button
        className={`tsp-tabbar__btn tsp-tabbar__press${exhausted ? ' is-exhausted' : ''}`}
        onPointerDown={onCollect}
      >
        {exhausted ? (
          <>
            <span className="label">Next in</span>
            <span className="quota">{countdown}</span>
          </>
        ) : (
          <span className="label label--ready">Collect</span>
        )}
      </button>

      <button
        className={`tsp-tabbar__btn${active === 'altar' ? ' is-active' : ''}`}
        onPointerDown={() => onTab('altar')}
      >
        <span className="glyph">◯</span>
        Shelf
      </button>
    </div>
  );
}
