import { useEffect, useMemo, useState } from 'react';
import { useGameSave } from '@shared/save';
import { useGameEvent } from '@shared/runtime';
import { telegramId } from '@shared/runtime/bridge';
import TopBar from './components/TopBar';
import TabBar, { type Tab } from './components/TabBar';
import Field from './components/Field';
import Pressing from './components/Pressing';
import Reveal from './components/Reveal';
import Altar from './components/Altar';
import SealDetail, { type DetailAuthor } from './components/SealDetail';
import Watermark from './components/Watermark';
import { useSelfProfile } from './hooks/useSelfProfile';
import { useBagGen } from './hooks/useBagGen';
import { useField, type FieldEntry } from './hooks/useField';
import { pickSubject } from './hooks/useSubjectPicker';
import { pickDomain } from './data/domains';
import {
  formatCountdown,
  formatStamp,
  msUntilNextCollect,
} from './utils/day';
import { worldNudge } from './utils/world';
import { fetchWorldEvents } from './utils/news';
import { preloadImage } from './utils/preload';
import { newId } from './utils/rng';
import type { Capsule, CapsuleSave, Phase } from './types';
import './HourCapsule.less';

const GAME_ID = 'hour-capsule';

export default function HourCapsule() {
  const { savedData, persist } = useGameSave<CapsuleSave>(GAME_ID);
  const profile = useSelfProfile();
  const bagGen = useBagGen();
  const field = useField();
  const events = useGameEvent();

  // Local mirror — useGameSave.savedData never updates after persist().
  const [mirror, setMirror] = useState<CapsuleSave | undefined>(undefined);
  useEffect(() => {
    if (mirror === undefined && savedData !== undefined) {
      setMirror({
        capsules: savedData?.capsules ?? [],
        likes: savedData?.likes ?? [],
        lastCollectAt: savedData?.lastCollectAt,
        collectsTotal: savedData?.collectsTotal ?? 0,
        recentDomains: savedData?.recentDomains ?? [],
        onboarded: savedData?.onboarded ?? false,
      });
    }
  }, [savedData, mirror]);

  // Hourly cooldown derived ONLY from local mirror (daily-lock-trap rule
  // applies to ANY per-time gate — never OR with platform aggregate stats).
  const cooldownRemaining =
    mirror ? msUntilNextCollect(mirror.lastCollectAt) : 0;
  const canCollect = cooldownRemaining <= 0;

  // The Field feed — server entries + your own optimistic locals.
  const fieldEntries = useMemo<FieldEntry[]>(() => {
    const mine: FieldEntry[] = (mirror?.capsules ?? [])
      .filter(c => c.imageUrl)
      .map(capsule => ({
        userId: telegramId || 'self',
        userName: profile?.name,
        userAvatarUrl: profile?.avatarUrl,
        capsule,
      }));
    const seen = new Set<string>();
    const merged: FieldEntry[] = [];
    for (const e of [...field.entries, ...mine]) {
      if (seen.has(e.capsule.id)) continue;
      seen.add(e.capsule.id);
      merged.push(e);
    }
    merged.sort((a, b) => (b.capsule.ts ?? 0) - (a.capsule.ts ?? 0));
    return merged;
  }, [field.entries, mirror?.capsules, profile?.name, profile?.avatarUrl]);

  // Per-capsule like state.
  const likeInfo = useMemo(() => {
    const myId = telegramId || 'self';
    const myLikes = new Set(mirror?.likes ?? []);
    const map = new Map<string, { count: number; liked: boolean }>();
    for (const e of fieldEntries) {
      const cid = e.capsule.id;
      const server = field.likesByCapsule.get(cid);
      let count = 0;
      if (server) for (const uid of server) if (uid !== myId) count++;
      const liked = myLikes.has(cid);
      if (liked) count++;
      map.set(cid, { count, liked });
    }
    return map;
  }, [fieldEntries, field.likesByCapsule, mirror?.likes]);

  // Phase machine — no input screen, collect is a single tap.
  const [phase, setPhase] = useState<Phase>('field');
  const [sealingStage, setSealingStage] = useState<'checking' | 'picking' | 'sealing'>('checking');
  const [sealingEvents, setSealingEvents] = useState<string[]>([]);
  const [sealingSubject, setSealingSubject] = useState<string>('');
  const [sealingDomain, setSealingDomain] = useState<string>('');
  const [activeCapsule, setActiveCapsule] = useState<Capsule | null>(null);
  const [error, setError] = useState<string>('');
  const [showCooldownModal, setShowCooldownModal] = useState(false);
  const [detail, setDetail] = useState<{ capsule: Capsule; author?: DetailAuthor } | null>(null);

  // Refresh tick — repaints the TopBar timestamp every minute so the
  // displayed "now" stays current without re-rendering anything heavy.
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  // Demo URL hooks
  const demo = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('demo');
  }, []);
  useEffect(() => {
    if (!demo || !mirror) return;
    if (demo === 'altar') setPhase('altar');
  }, [demo, mirror]);

  // ─── Actions ──────────────────────────────────────────────────

  const handleCollect = async () => {
    if (!mirror) return;
    if (!canCollect) {
      setShowCooldownModal(true);
      return;
    }

    setError('');
    setSealingEvents([]);
    setSealingSubject('');
    setSealingStage('checking');
    setPhase('sealing');

    try {
      // 1. Pull live world events (best-effort — returns [] on any failure).
      const worldEvents = await fetchWorldEvents();
      setSealingEvents(worldEvents);

      // 2. Pick subject via LLM, with avoid-lists from this hour's field
      //    and this user's recent history. Diversity is the first priority.
      setSealingStage('picking');
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const recentGlobal = fieldEntries
        .filter(e => (e.capsule.ts ?? 0) > oneHourAgo)
        .map(e => e.capsule.subject)
        .filter(Boolean);
      const recentSelf = mirror.capsules.slice(0, 12).map(c => c.subject).filter(Boolean);

      // Domain anchor — random pick excluding the user's last 6 domains.
      // Guarantees cross-call diversity even when avoid lists are empty
      // and external news fetch is blocked by the platform CSP.
      const domainHint = pickDomain(mirror.recentDomains ?? []);
      setSealingDomain(domainHint);

      const subject = await pickSubject({
        domainHint,
        worldNudge: worldNudge(),
        worldEvents,
        recentSelf,
        recentGlobal,
      });
      setSealingSubject(subject);

      // 3. Gen the bag image. Real timestamp + real owner stamp baked in.
      setSealingStage('sealing');
      const ts = Date.now();
      const serial = (mirror.collectsTotal ?? 0) + 1;
      const ownerName = profile?.name ?? 'guest';

      const result = await bagGen.generate({
        subject,
        mfgTs: ts,
        ownerName,
        ownerSerial: serial,
      });
      await preloadImage(result.imageUrl);

      const capsule: Capsule = {
        id: newId(),
        ts,
        subject,
        imageUrl: result.imageUrl,
        serial,
      };
      setActiveCapsule(capsule);
      setPhase('reveal');
    } catch {
      setError('The vacuum stalled. Try again — no capsule was used.');
      setPhase('field');
    }
  };

  // One ritual action: sealing it into the public Field and your shelf.
  const handleSeal = () => {
    if (!mirror || !activeCapsule) return;
    // Push the just-used domain into recentDomains, keep last 6.
    const nextRecentDomains = sealingDomain
      ? [sealingDomain, ...(mirror.recentDomains ?? []).filter(d => d !== sealingDomain)].slice(0, 6)
      : (mirror.recentDomains ?? []);
    const nextSave: CapsuleSave = {
      ...mirror,
      lastCollectAt: activeCapsule.ts,
      collectsTotal: activeCapsule.serial,
      capsules: [activeCapsule, ...mirror.capsules],
      recentDomains: nextRecentDomains,
    };
    setMirror(nextSave);
    persist(nextSave);

    events.trigger('capsule:sealed');

    // Optimistic inject so it shows in the Field instantly.
    field.injectLocal({
      userId: telegramId || 'self',
      userName: profile?.name,
      userAvatarUrl: profile?.avatarUrl,
      capsule: activeCapsule,
    });
    setTimeout(() => field.refresh(), 1500);

    setActiveCapsule(null);
    setPhase('field');
  };

  const handleDeleteCapsule = (capsuleId: string) => {
    if (!mirror) return;
    const nextSave: CapsuleSave = {
      ...mirror,
      capsules: mirror.capsules.filter(c => c.id !== capsuleId),
    };
    setMirror(nextSave);
    persist(nextSave);
    setDetail(null);
    field.removeLocal(capsuleId);
    setTimeout(() => field.refresh(), 1500);
  };

  const handleToggleLike = (capsuleId: string) => {
    if (!mirror) return;
    const current = mirror.likes ?? [];
    const liked = current.includes(capsuleId);
    const nextLikes = liked
      ? current.filter(id => id !== capsuleId)
      : [...current, capsuleId];
    const nextSave: CapsuleSave = { ...mirror, likes: nextLikes };
    setMirror(nextSave);
    persist(nextSave);
    if (!liked) events.trigger(`like:${capsuleId}`);
    setTimeout(() => field.refresh(), 1500);
  };

  const handleTab = (t: Tab) => {
    setPhase(t === 'field' ? 'field' : 'altar');
  };

  // Render
  if (!mirror) {
    return (
      <div className="tsp-root">
        <div className="tsp-boot">opening the vacuum…</div>
      </div>
    );
  }

  // Top-right label = current "now", same format as MFG stamp on bags.
  const nowLabel = formatStamp(Date.now());

  return (
    <div className="tsp-root">
      <TopBar rightLabel={nowLabel} />

      <div className="tsp-page">
        {phase === 'field' && (
          <Field
            entries={fieldEntries}
            loaded={field.loaded}
            likeInfo={likeInfo}
            onToggleLike={handleToggleLike}
            selfUserId={telegramId || undefined}
            onOpen={(entry) => setDetail({
              capsule: entry.capsule,
              author: {
                userId: entry.userId,
                userName: entry.userName,
                userAvatarUrl: entry.userAvatarUrl,
                isSelf: entry.userId === (telegramId || undefined),
              },
            })}
          />
        )}
        {phase === 'sealing' && (
          <>
            {error && <div className="tsp-toast">{error}</div>}
            <Pressing
              stage={sealingStage}
              events={sealingEvents}
              subject={sealingSubject}
            />
          </>
        )}
        {phase === 'reveal' && activeCapsule && (
          <Reveal capsule={activeCapsule} onSeal={handleSeal} />
        )}
        {phase === 'altar' && (
          <Altar
            capsules={mirror.capsules}
            onOpen={(capsule) => setDetail({ capsule })}
          />
        )}
      </div>

      {(phase === 'field' || phase === 'altar') && (
        <TabBar
          active={phase === 'field' ? 'field' : 'altar'}
          lastCollectAt={mirror.lastCollectAt}
          onTab={handleTab}
          onCollect={handleCollect}
        />
      )}

      {showCooldownModal && (
        <CooldownModal
          remaining={cooldownRemaining}
          onClose={() => setShowCooldownModal(false)}
        />
      )}

      {detail && (
        <SealDetail
          capsule={detail.capsule}
          author={detail.author}
          like={likeInfo.get(detail.capsule.id) ?? { count: 0, liked: false }}
          onToggleLike={() => handleToggleLike(detail.capsule.id)}
          onClose={() => setDetail(null)}
          onDelete={handleDeleteCapsule}
        />
      )}

      <Watermark />
    </div>
  );
}

function CooldownModal({ remaining, onClose }: { remaining: number; onClose: () => void }) {
  return (
    <div className="tsp-modal" onClick={onClose}>
      <div className="tsp-modal__card" onClick={e => e.stopPropagation()}>
        <div className="tsp-modal__eyebrow">HOURLY QUOTA</div>
        <h3 className="tsp-modal__title">One capsule per hour.</h3>
        <p className="tsp-modal__body">
          The vacuum re-pressurises in
          <strong> {formatCountdown(remaining)}</strong>.
        </p>
        <button className="tsp-modal__cta" onPointerDown={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
