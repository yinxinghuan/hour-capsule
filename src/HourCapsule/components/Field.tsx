// The Field — single-column feed of vacuum-sealed capsules from all
// players. Each card: avatar + name + ago + image + subject + Like.
// Tap avatar/name → open user's Aigram profile.
//
// Rules in play:
//   · scroll-vs-click: list rows use onClick (NOT onPointerDown) so
//     the page can scroll past them.
//   · cross-user-avatar: every cross-user surface shows avatar + name.
//   · cross-user-profile-tap: avatar+name opens the user's profile.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { openAigramProfile, isInAigram } from '@shared/runtime/bridge';
import { relativeAgo } from '../utils/day';
import { playLike, playUnlike, hapticTap } from '../utils/sound';
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

// Persist the feed scroll position so a platform-driven remount of the game
// iframe (the game is one screen in the host's vertical scroll-feed) doesn't
// dump the user back at the first capsule. localStorage + a freshness window
// survives a full iframe re-create; stale positions (returning much later) are
// ignored so the user still lands at the top on a genuinely new session.
const SCROLL_KEY = 'hc_field_scroll';
const SCROLL_FRESH_MS = 5 * 60 * 1000;

function saveScroll(top: number) {
  try { localStorage.setItem(SCROLL_KEY, JSON.stringify({ top, ts: Date.now() })); } catch { /* ignore */ }
}
function readScroll(): number {
  try {
    const raw = localStorage.getItem(SCROLL_KEY);
    if (!raw) return 0;
    const { top, ts } = JSON.parse(raw) as { top: number; ts: number };
    if (!top || Date.now() - ts > SCROLL_FRESH_MS) return 0;
    return top;
  } catch { return 0; }
}

export default function Field({ entries, loaded, likeInfo, onToggleLike, selfUserId, onOpen }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // Restore the saved position once, after the feed has real content. Cards
  // carry a fixed aspect-ratio image box, so scrollHeight is correct the
  // moment they mount — no need to wait for images to decode. useLayoutEffect
  // sets scrollTop before paint, so there's no visible jump.
  useLayoutEffect(() => {
    if (restoredRef.current || !loaded || entries.length === 0) return;
    const el = scrollerRef.current;
    if (!el) return;
    const saved = readScroll();
    if (saved > 0) el.scrollTop = saved;
    restoredRef.current = true;
  }, [loaded, entries.length]);

  useEffect(() => () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); }, []);

  const handleScroll = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = scrollerRef.current;
      if (el) saveScroll(el.scrollTop);
    });
  };

  const empty = !loaded || entries.length === 0;
  return (
    <div
      ref={scrollerRef}
      onScroll={handleScroll}
      className={`tsp-field${empty ? ' tsp-field--empty' : ''}`}
    >
      {!loaded ? (
        <em>opening the field…</em>
      ) : entries.length === 0 ? (
        <>
          <h3>The field is quiet this hour.</h3>
          <p>Collect the first capsule — it appears here for everyone.</p>
        </>
      ) : (
        <>
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

          <div className="tsp-field__end">
            <span className="tsp-field__end-mark">✦</span>
            <p className="tsp-field__end-note">You're all caught up.</p>
            <p className="tsp-field__end-sub">
              The field keeps the latest capsules from recent collectors. Fresh
              ones seal in at the top each hour.
            </p>
          </div>
        </>
      )}
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

  const [bursting, setBursting] = useState(false);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (burstTimer.current) clearTimeout(burstTimer.current); }, []);
  const handleLikeTap = () => {
    if (like.liked) playUnlike(); else playLike();
    hapticTap();
    setBursting(true);
    if (burstTimer.current) clearTimeout(burstTimer.current);
    burstTimer.current = setTimeout(() => setBursting(false), 520);
    onLike();
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
          className={`tsp-seal__act${like.liked ? ' is-liked' : ''}${bursting ? ' is-bursting' : ''}`}
          onClick={handleLikeTap}
          data-no-feedback
        >
          <span className="glyph">{like.liked ? '♥' : '♡'}</span>
          {like.count > 0 ? like.count : 'Like'}
        </button>
      </div>
    </div>
  );
}
