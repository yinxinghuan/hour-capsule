// Reveal + Seal — show the freshly-gen'd capsule and one ritual button.
// Every capsule is auto-public: confirming seals it into the Field and
// keeps a copy in your shelf.
import type { Capsule } from '../types';
import { formatStamp, formatSerial } from '../utils/day';

interface Props {
  capsule: Capsule;
  onSeal: () => void;
}

export default function Reveal({ capsule, onSeal }: Props) {
  const metaTag = `${formatStamp(capsule.ts)} · ${formatSerial(capsule.serial)}`;

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
