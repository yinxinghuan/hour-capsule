// The Field — single-column feed of vacuum-sealed capsules from all
// players. Each card: avatar + name + ago + image + subject + Like.
// Tap avatar/name → open user's Aigram profile.
//
// Rules in play:
//   · scroll-vs-click: list rows use onClick (NOT onPointerDown) so
//     the page can scroll past them.
//   · cross-user-avatar: every cross-user surface shows avatar + name.
//   · cross-user-profile-tap: avatar+name opens the user's profile.

import { useEffect, useState } from 'react';
import { openAigramProfile, isInAigram } from '@shared/runtime/bridge';
import { relativeAgo } from '../utils/day';
import type { FieldEntry } from '../hooks/useField';

export interface LikeState { count: number; liked: boolean; }

interface Props {
  entries: FieldEntry[];
  loaded: boolean;
  likeInfo: Map<string, LikeState>;
  onToggleLike: (capsuleId: string) => void;
  selfUserId?: string;
  onOpen: (entry: FieldEntry) => void;
}

export default function Field({ entries, loaded, likeInfo, onToggleLike, selfUserId, onOpen }: Props) {
  if (!loaded) {
    return (
      <div className="tsp-field tsp-field--empty">
        <em>opening the field…</em>
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <div className="tsp-field tsp-field--empty">
        <h3>The field is quiet this hour.</h3>
        <p>Collect the first capsule — it appears here for everyone.</p>
      </div>
    );
  }
  return (
    <div className="tsp-field">
      <div className="tsp-field__hd">
        <h2 className="tsp-field__title">The Field</h2>
        <div className="tsp-field__count">{entries.length} CAPSULES</div>
      </div>
      <div className="tsp-field__sub">Every capsule sealed today — scroll the field.</div>
      <div className="tsp-field__rule" />

      <div className="tsp-field__feed">
        {entries.map((entry) => (
          <FieldCard
            key={entry.capsule.id}
            entry={entry}
            isSelf={entry.userId === selfUserId}
            like={likeInfo.get(entry.capsule.id) ?? { count: 0, liked: false }}
            onLike={() => onToggleLike(entry.capsule.id)}
            onOpen={() => onOpen(entry)}
          />
        ))}
      </div>
    </div>
  );
}

function FieldCard({
  entry, isSelf, like, onLike, onOpen,
}: {
  entry: FieldEntry; isSelf: boolean; like: LikeState; onLike: () => void; onOpen: () => void;
}) {
  const { capsule, userName, userAvatarUrl, userId } = entry;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const ago = relativeAgo(capsule.ts, 'en');
  void now;

  const initial = (userName || '?').charAt(0).toUpperCase();
  const handleAuthorTap = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    if (!isInAigram || isSelf || !userId) return;
    openAigramProfile(userId);
  };

  return (
    <div className="tsp-seal">
      <div className="tsp-seal__author">
        {isSelf ? (
          <>
            <span className="tsp-seal__avatar tsp-seal__avatar--self">{initial}</span>
            <span className="tsp-seal__name tsp-seal__name--self">YOU</span>
          </>
        ) : (
          <button
            className="tsp-seal__author-btn"
            onClick={handleAuthorTap}
            disabled={!isInAigram}
          >
            {userAvatarUrl
              ? <img className="tsp-seal__avatar" src={userAvatarUrl} alt="" draggable={false} />
              : <span className="tsp-seal__avatar">{initial}</span>}
            <span className="tsp-seal__name">{userName || '—'}</span>
          </button>
        )}
        <span className="tsp-seal__ago">{ago}</span>
      </div>

      <div className="tsp-seal__img" onClick={onOpen} role="button">
        <img src={capsule.imageUrl} alt={capsule.subject} draggable={false} />
      </div>

      <div className="tsp-seal__inscription" onClick={onOpen}>{capsule.subject}</div>

      <div className="tsp-seal__actions">
        <button
          className={`tsp-seal__act${like.liked ? ' is-liked' : ''}`}
          onClick={onLike}
        >
          <span className="glyph">{like.liked ? '♥' : '♡'}</span>
          {like.count > 0 ? like.count : 'Like'}
        </button>
      </div>
    </div>
  );
}
