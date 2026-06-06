// Read-only detail overlay for a collected capsule. Opened by tapping
// a card in the Field (with author chip) or a cell in the shelf (own).
// No actions besides Like and (own-only) Discard. Close via X or backdrop.
import { useEffect, useRef, useState } from 'react';
import { relativeAgo, formatStamp, formatSerial } from '../utils/day';
import { openAigramProfile, isInAigram } from '@shared/runtime/bridge';
import { playLike, playUnlike, hapticTap } from '../utils/sound';
import type { Capsule } from '../types';

export interface DetailAuthor {
  userId?: string;
  userName?: string;
  userAvatarUrl?: string;
  isSelf: boolean;
}

interface Props {
  capsule: Capsule;
  author?: DetailAuthor;
  like: { count: number; liked: boolean };
  onToggleLike: () => void;
  onClose: () => void;
  onDelete: (capsuleId: string) => void;
}

export default function SealDetail({ capsule, author, like, onToggleLike, onClose, onDelete }: Props) {
  const canDelete = !author || author.isSelf;
  const [confirming, setConfirming] = useState(false);
  const metaTag = `${formatStamp(capsule.ts)} · ${formatSerial(capsule.serial)}`;

  const initial = (author?.userName || '?').charAt(0).toUpperCase();
  const handleAuthorTap = () => {
    if (!author || author.isSelf || !isInAigram || !author.userId) return;
    openAigramProfile(author.userId);
  };

  const [bursting, setBursting] = useState(false);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (burstTimer.current) clearTimeout(burstTimer.current); }, []);
  const handleLikeTap = () => {
    if (like.liked) playUnlike(); else playLike();
    hapticTap();
    setBursting(true);
    if (burstTimer.current) clearTimeout(burstTimer.current);
    burstTimer.current = setTimeout(() => setBursting(false), 520);
    onToggleLike();
  };

  return (
    <div className="tsp-detail" onClick={onClose}>
      <div className="tsp-detail__card" onClick={e => e.stopPropagation()}>
        <button className="tsp-detail__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="tsp-detail__img">
          <img src={capsule.imageUrl} alt={capsule.subject} draggable={false} />
        </div>

        {capsule.subject && (
          <div className="tsp-detail__inscription">{capsule.subject}</div>
        )}

        <div className="tsp-detail__metatag">
          {metaTag}
          {capsule.rarity && capsule.rarity !== 'common' && (
            <span className={`tsp-rarity tsp-rarity--${capsule.rarity}`}>
              {capsule.rarity}
            </span>
          )}
        </div>

        <div className="tsp-detail__foot">
          {author && !author.isSelf ? (
            <button
              className="tsp-detail__author"
              onClick={handleAuthorTap}
              disabled={!isInAigram}
            >
              {author.userAvatarUrl
                ? <img className="tsp-detail__avatar" src={author.userAvatarUrl} alt="" draggable={false} />
                : <span className="tsp-detail__avatar">{initial}</span>}
              <span className="tsp-detail__name">{author.userName || '—'}</span>
            </button>
          ) : (
            <span className="tsp-detail__name tsp-detail__name--self">
              {author ? 'YOU' : 'YOUR CAPSULE'}
            </span>
          )}
          <span className="tsp-detail__ago">{relativeAgo(capsule.ts, 'en')}</span>
        </div>

        <button
          className={`tsp-detail__like${like.liked ? ' is-liked' : ''}${bursting ? ' is-bursting' : ''}`}
          onClick={handleLikeTap}
        >
          <span className="tsp-detail__like-glyph">{like.liked ? '♥' : '♡'}</span>
          <span className="tsp-detail__like-count">
            {like.count > 0
              ? `${like.count} ${like.count === 1 ? 'like' : 'likes'}`
              : 'Be the first to like'}
          </span>
        </button>

        {canDelete && (
          <button
            className={`tsp-detail__discard${confirming ? ' is-confirming' : ''}`}
            onClick={() => (confirming ? onDelete(capsule.id) : setConfirming(true))}
          >
            {confirming ? 'Tap again to destroy' : 'Discard this capsule'}
          </button>
        )}
      </div>
    </div>
  );
}
