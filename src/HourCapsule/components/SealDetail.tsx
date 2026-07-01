// Read-only detail overlay for a collected capsule. Opened by tapping
// a card in the Field (with author chip) or a cell in the shelf (own).
// No actions besides Like and (own-only) Discard. Close via X or backdrop.
import { useEffect, useRef, useState } from 'react';
import { formatStamp, formatSerial } from '../utils/day';
import { openAigramProfile, isInAigram } from '@shared/runtime/bridge';
import { timeAgo, type GuestMessage } from '@shared/social/guestbook';
import { playLike, playUnlike, hapticTap } from '../utils/sound';
import { saveCapsuleImage } from '../utils/download';
import type { Capsule } from '../types';

const ALTERU_APP_URL = 'https://apps.apple.com/app/id6769646546';

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
  /** Public notes on this capsule (wall ∪ my own, oldest-first). */
  thread: GuestMessage[];
  selfUserId?: string;
  onToggleLike: () => void;
  onSendNote: (text: string) => void;
  onClose: () => void;
  onDelete: (capsuleId: string) => void;
}

export default function SealDetail({ capsule, author, like, thread, selfUserId, onToggleLike, onSendNote, onClose, onDelete }: Props) {
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

  const handleSave = async () => {
    const fname = `hour-capsule-${formatSerial(capsule.serial).replace('#', '')}.png`;
    await saveCapsuleImage(capsule.imageUrl, fname);
  };

  return (
    <div className="tsp-detail" onClick={onClose}>
      <div className="tsp-detail__card" onClick={e => e.stopPropagation()}>
        <button className="tsp-detail__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div
          className="tsp-detail__img"
          onClick={onClose}
          role="button"
          aria-label="Close"
        >
          <img src={capsule.imageUrl} alt={capsule.subject} draggable={false} />
        </div>

        {capsule.subject && (
          <div className="tsp-detail__inscription">{capsule.subject}</div>
        )}

        {/* Author chip moves up to right under the subject — cross-user
            capsules read "by whom" instantly instead of buried below the
            wire list. Styled as a single slim caps line, not boxed. */}
        <div className="tsp-detail__byline">
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
            <span className="tsp-detail__name tsp-detail__name--self">YOU</span>
          )}
        </div>

        <div className="tsp-detail__metatag">
          {metaTag}
          {capsule.rarity && capsule.rarity !== 'common' && (
            <span className={`tsp-rarity tsp-rarity--${capsule.rarity}`}>
              {capsule.rarity}
            </span>
          )}
        </div>

        {/* Today's anchor — the single headline event the picker chose to
            represent. Bridges the wire list and the object. Shows only when
            the picker actually anchored on a headline (skipped on empty-wire
            fallback). Sits above the wire list as a louder eyebrow. */}
        {capsule.anchor && (
          <div className="tsp-detail__anchor">
            <span className="tsp-detail__anchor-eyebrow">— today ·</span>
            <span className="tsp-detail__anchor-body">{capsule.anchor}</span>
          </div>
        )}

        {/* Frozen-at-seal-time world headlines. Clean italic ledger —
            no boxes, no rotation, no film overlay. The quiet typography
            is the artifact-feel, not the decoration. */}
        {capsule.worldEvents && capsule.worldEvents.length > 0 && (
          <div className="tsp-detail__wire">
            <div className="tsp-detail__wire-eyebrow">— sealed with —</div>
            <ul className="tsp-detail__wire-list">
              {capsule.worldEvents.map((line, i) => {
                const m = line.match(/^(HN|World|Featured):\s*(.+)$/);
                const tag = m ? m[1] : '';
                const body = m ? m[2] : line;
                return (
                  <li key={i} className="tsp-detail__wire-row">
                    {tag && <span className="tsp-detail__wire-tag">{tag}</span>}
                    <span className="tsp-detail__wire-body">{body}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Public guestbook — notes left on this capsule, with a compose box.
            Best-effort cross-user display + author ping (see @shared/social). */}
        <div className="tsp-notes">
          <div className="tsp-notes__eyebrow">
            — notes{thread.length > 0 ? ` · ${thread.length}` : ''} —
          </div>
          {thread.length > 0 ? (
            <ul className="tsp-notes__list">
              {thread.map(m => (
                <NoteRow key={m.id} msg={m} selfUserId={selfUserId} />
              ))}
            </ul>
          ) : (
            <div className="tsp-notes__empty">No notes yet — be the first.</div>
          )}
          {isInAigram ? (
            <Compose onSend={onSendNote} />
          ) : (
            <div className="tsp-notes__empty tsp-notes__download">
              <span>Open in AlterU to leave a note.</span>
              <a href={ALTERU_APP_URL} target="_blank" rel="noopener noreferrer">
                Get AlterU on the App Store
              </a>
            </div>
          )}
        </div>

        <button
          className={`tsp-detail__like${like.liked ? ' is-liked' : ''}${bursting ? ' is-bursting' : ''}`}
          onClick={handleLikeTap}
          data-no-feedback
        >
          <span className="tsp-detail__like-glyph">{like.liked ? '♥' : '♡'}</span>
          <span className="tsp-detail__like-count">
            {like.count > 0
              ? `${like.count} ${like.count === 1 ? 'like' : 'likes'}`
              : 'Be the first to like'}
          </span>
        </button>

        <button
          className="tsp-detail__save"
          onClick={handleSave}
        >
          Save image
        </button>

        {/* Discard demoted to a small ghost link — same two-tap confirm
            logic, but visual weight matches the danger. No longer reads
            as equal-status with Save. */}
        {canDelete && (
          <button
            className={`tsp-detail__discard${confirming ? ' is-confirming' : ''}`}
            onClick={() => (confirming ? onDelete(capsule.id) : setConfirming(true))}
          >
            {confirming ? 'Tap again to destroy' : 'discard this capsule'}
          </button>
        )}
      </div>
    </div>
  );
}

// One note: author chip (tappable → profile, self shows "YOU"), text, time.
function NoteRow({ msg, selfUserId }: { msg: GuestMessage; selfUserId?: string }) {
  const mine = !!msg.fromUserId && msg.fromUserId === selfUserId;
  const name = mine ? 'YOU' : (msg.userName || 'someone');
  const initial = (msg.userName || '?').charAt(0).toUpperCase();
  const tappable = !mine && !!msg.fromUserId && isInAigram;
  const head = (
    <span className="tsp-note__head">
      {msg.userAvatarUrl
        ? <img className="tsp-note__avatar" src={msg.userAvatarUrl} alt="" draggable={false} />
        : <span className="tsp-note__avatar">{initial}</span>}
      <span className={`tsp-note__name${mine ? ' tsp-note__name--self' : ''}`}>{name}</span>
      <span className="tsp-note__time">{timeAgo(msg.ts, 'en')}</span>
    </span>
  );
  return (
    <li className="tsp-note">
      {tappable ? (
        <button className="tsp-note__chip" onClick={() => openAigramProfile(msg.fromUserId!)}>
          {head}
        </button>
      ) : head}
      <p className="tsp-note__text">{msg.text}</p>
    </li>
  );
}

// Compose box — controlled input + send; clicks don't bubble to the backdrop.
function Compose({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };
  return (
    <div className="tsp-compose" onClick={e => e.stopPropagation()}>
      <input
        className="tsp-compose__input"
        value={text}
        maxLength={140}
        placeholder="Leave a note…"
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); }}
      />
      <button
        className="tsp-compose__send"
        disabled={!text.trim()}
        onClick={submit}
      >
        Send
      </button>
    </div>
  );
}
