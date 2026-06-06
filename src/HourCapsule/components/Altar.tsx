// Personal collection — every capsule you've collected. 2-col grid,
// newest first.
import { relativeAgo } from '../utils/day';
import type { Capsule } from '../types';

interface Props {
  capsules: Capsule[];
  onOpen: (capsule: Capsule) => void;
}

export default function Altar({ capsules, onOpen }: Props) {
  if (capsules.length === 0) {
    return (
      <div className="tsp-altar tsp-altar--empty">
        <h3>Your shelf is empty.</h3>
        <p>Collect your first capsule. Each one is kept here and joins the Field for everyone to see.</p>
      </div>
    );
  }
  return (
    <div className="tsp-altar">
      <div className="tsp-altar__hd">
        <h2 className="tsp-altar__title">Your shelf</h2>
        <div className="tsp-altar__count">{capsules.length} CAPSULES</div>
      </div>
      <div className="tsp-altar__rule" />

      <div className="tsp-altar__grid">
        {capsules.map((capsule) => (
          <div className="tsp-altar__cell" key={capsule.id} onClick={() => onOpen(capsule)} role="button">
            <div className="tsp-altar__face">
              <img src={capsule.imageUrl} alt={capsule.subject} draggable={false} />
            </div>
            <div className="tsp-altar__inscription">{capsule.subject}</div>
            <div className="tsp-altar__date">{relativeAgo(capsule.ts, 'en')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
