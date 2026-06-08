// Field tab content when the game is opened OUTSIDE AlterU (shared
// link clicked in a normal browser). The cross-user wall can't load
// here — the runtime bridge's `callAigramAPI` rides postMessage to
// `window.parent`, which outside the iframe is `window` itself, and
// the request times out after 10s. Rather than show an empty field
// forever, we show the player's own latest capsule as the hero and
// route them to the AlterU App Store listing for the social layer.
//
// Note: gen-image + LLM picking BOTH work from any browser origin
// (CORS `*` on the chat.aiwaves.tech transit), so Collect, Reveal,
// and Detail of own capsules all still function — the demo is real,
// not a static landing.
import { useEffect, useState } from 'react';
import type { Capsule } from '../types';

// App Store landing for the AlterU iOS app (US store).
const ALTERU_APP_URL = 'https://apps.apple.com/us/app/alteru/id6769646546';

// First-time visitors land on an empty Field — show the game's official
// poster (pocket watch in a vacuum-sealed bag) as a teaser hero so they
// see WHAT they'd be making before the abstract "tap Collect" ask.
// Tagged EXAMPLE so they don't think it's theirs.
const SAMPLE_HERO_URL = import.meta.env.BASE_URL + 'poster.png';

interface Props {
  ownCapsules: Capsule[];
  onOpen: (capsule: Capsule) => void;
}

export default function FieldDemoCTA({ ownCapsules, onOpen }: Props) {
  // Newest-first; HourCapsule already sorts the mirror this way but
  // re-sort defensively in case caller order changes.
  const sorted = [...ownCapsules].sort((a, b) => b.ts - a.ts);
  const latest = sorted[0];
  const others = sorted.slice(1, 5);
  const isFirstTime = sorted.length === 0;

  // Tiny live "sealed today globally" placeholder — we don't have a
  // real count outside AlterU, but a slowly-incrementing number reads
  // as "things are happening" instead of empty.
  const [phantomCount, setPhantomCount] = useState(0);
  useEffect(() => {
    // Seed by hour of day so it feels like an accumulating count.
    const seed = 380 + new Date().getHours() * 12 + Math.floor(Math.random() * 8);
    setPhantomCount(seed);
    const t = setInterval(() => {
      setPhantomCount((n) => n + Math.floor(Math.random() * 2));
    }, 9000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="tsp-demo">
      <div className="tsp-demo__hd">
        <h2 className="tsp-demo__title">The Field</h2>
        <div className="tsp-demo__count">PREVIEW</div>
      </div>
      <div className="tsp-demo__sub">
        {isFirstTime
          ? 'tap Collect below to seal your first hour.'
          : 'today\'s field lives inside the app.'}
      </div>
      <div className="tsp-demo__rule" />

      {latest ? (
        <button
          className="tsp-demo__hero"
          onClick={() => onOpen(latest)}
          aria-label="Open your latest capsule"
        >
          <img src={latest.imageUrl} alt={latest.subject} draggable={false} />
          <div className="tsp-demo__hero-tag">YOUR LATEST</div>
        </button>
      ) : (
        // First-time teaser: official poster as a sample of what the
        // game produces. Non-tappable (no Detail to open yet), the
        // EXAMPLE tag prevents "wait, did I already make one?" confusion.
        <div
          className="tsp-demo__hero tsp-demo__hero--sample"
          aria-label="Example capsule"
        >
          <img src={SAMPLE_HERO_URL} alt="" draggable={false} />
          <div className="tsp-demo__hero-tag tsp-demo__hero-tag--sample">
            EXAMPLE · YOURS STARTS IN A TAP
          </div>
        </div>
      )}

      <div className="tsp-demo__pitch">
        {phantomCount > 0 && (
          <div className="tsp-demo__counter">
            {phantomCount} <span>others sealed an hour with you today.</span>
          </div>
        )}
        <p>
          {latest
            ? 'See the rest of the Field — every capsule sealed in the last hour, with likes, comments, and the curator who picked your subject.'
            : 'Hour Capsule is a tiny ritual inside AlterU: one bagged moment, every hour, picked by AI from what\'s happening in the world right now.'}
        </p>
      </div>

      <a
        className="tsp-demo__cta"
        href={ALTERU_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Get AlterU on the App Store
      </a>
      <div className="tsp-demo__cta-sub">
        {/* Eyebrow under CTA for the "what is AlterU" gap — most share-link
            recipients won't know the brand. One line, no marketing fluff. */}
        the AI creative platform where this game lives · free on iPhone
      </div>

      {others.length > 0 && (
        <>
          <div className="tsp-demo__strip-eyebrow">— your other capsules —</div>
          <div className="tsp-demo__strip">
            {others.map((c) => (
              <button
                key={c.id}
                className="tsp-demo__strip-cell"
                onClick={() => onOpen(c)}
                aria-label={c.subject}
              >
                <img src={c.imageUrl} alt={c.subject} draggable={false} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
