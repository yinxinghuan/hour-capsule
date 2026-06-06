// Reveal + Seal — show the freshly-gen'd capsule and one ritual button.
// Every capsule is auto-public: confirming seals it into the Field and
// keeps a copy in your shelf.
//
// Two micro-polish details:
//   · The card image fades in + scales 0.95→1 for ~600ms ("just minted")
//   · The MFG stamp ticks each second so it reads as alive, like a real
//     production line clock — strengthens the "fresh from the press" feel
import { useEffect, useState } from 'react';
import type { Capsule } from '../types';
import { formatStampWithSeconds, formatSerial } from '../utils/day';

interface Props {
  capsule: Capsule;
  onSeal: () => void;
}

export default function Reveal({ capsule, onSeal }: Props) {
  const [tickStamp, setTickStamp] = useState(() => formatStampWithSeconds(Date.now()));
  useEffect(() => {
    const t = setInterval(() => setTickStamp(formatStampWithSeconds(Date.now())), 1000);
    return () => clearInterval(t);
  }, []);

  const metaTag = `${tickStamp} · ${formatSerial(capsule.serial)}`;

  return (
    <div className="tsp-reveal">
      <div className="tsp-reveal__eyebrow">your capsule · just now</div>
      <div className="tsp-reveal__cardwrap">
        <div className="tsp-reveal__card">
          <img src={capsule.imageUrl} alt={capsule.subject} draggable={false} />
        </div>
      </div>

      <div className="tsp-reveal__inscription">{capsule.subject}</div>
      <div className="tsp-reveal__meta">
        <span className="tsp-reveal__metatag">{metaTag}</span>
        {capsule.rarity && capsule.rarity !== 'common' && (
          <span className={`tsp-rarity tsp-rarity--${capsule.rarity}`}>
            {capsule.rarity}
          </span>
        )}
      </div>

      <div className="tsp-reveal__cast-title">seal it into the field</div>
      <div className="tsp-reveal__cast">
        <button
          className="tsp-cast tsp-cast--primary"
          onPointerDown={onSeal}
        >
          <span className="tsp-cast__glyph">⌖</span>
          <div className="tsp-cast__main">Seal it</div>
          <div className="tsp-cast__sub">Into the Field · everyone sees</div>
        </button>
      </div>
    </div>
  );
}
