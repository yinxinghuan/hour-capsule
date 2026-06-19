// Field reader — across-user collected capsules.
//
// Pattern: each user's save (via useGameSave) is a CapsuleSave object
// containing their `capsules` array. `get/data/list` returns the 6 most
// recent users' latest saves for this session, so we flatten across
// them to build the public Field feed.
//
// Memory rule (throttle-at-input): don't cap input — flatten all
// capsules from all returned users, then sort newest first, then cap
// display count. Don't drop entries silently at the data layer.

import { useEffect, useMemo, useState } from 'react';
import { callAigramAPI, type AigramResponse } from '@shared/runtime/bridge';
import { getGameUuid } from '@shared/runtime/game-id';
import type { Capsule, CapsuleSave } from '../types';

interface SaveRow {
  user_id: string;
  time: string;
  resource_data: string;
}

interface ProfileData {
  name?: string;
  head_url?: string;
}

export interface FieldEntry {
  userId: string;
  userName?: string;
  userAvatarUrl?: string;
  capsule: Capsule;
}

interface UseFieldResult {
  entries: FieldEntry[];
  /** capsuleId → set of userIds who liked it, aggregated across returned
   *  users. The caller folds in their OWN likes (this read may exclude
   *  the caller's save, same as the wall itself). */
  likesByCapsule: Map<string, Set<string>>;
  loaded: boolean;
  refresh: () => Promise<void>;
  /** Optimistically show a just-collected capsule in the feed immediately,
   *  bridging the platform save → get/data/list replication lag. */
  injectLocal: (entry: FieldEntry) => void;
  /** Drop an optimistic entry (e.g. the user discards it same-session). */
  removeLocal: (capsuleId: string) => void;
}

const MAX_DISPLAY = 60;

export function useField(): UseFieldResult {
  const [serverEntries, setServerEntries] = useState<FieldEntry[]>([]);
  const [localEntries, setLocalEntries] = useState<FieldEntry[]>([]);
  const [likesByCapsule, setLikesByCapsule] = useState<Map<string, Set<string>>>(new Map());
  const [loaded, setLoaded] = useState(false);
  const sessionId = getGameUuid();

  const entries = useMemo(() => {
    const seen = new Set<string>();
    const merged: FieldEntry[] = [];
    for (const e of [...serverEntries, ...localEntries]) {
      if (seen.has(e.capsule.id)) continue;
      seen.add(e.capsule.id);
      merged.push(e);
    }
    merged.sort((a, b) => (b.capsule.ts ?? 0) - (a.capsule.ts ?? 0));
    return merged.slice(0, MAX_DISPLAY);
  }, [serverEntries, localEntries]);

  const injectLocal = (entry: FieldEntry) => {
    setLocalEntries(prev =>
      prev.some(e => e.capsule.id === entry.capsule.id) ? prev : [entry, ...prev]);
  };

  const removeLocal = (capsuleId: string) => {
    setLocalEntries(prev => prev.filter(e => e.capsule.id !== capsuleId));
  };

  const refresh = async () => {
    if (!sessionId) { setServerEntries([]); setLikesByCapsule(new Map()); setLoaded(true); return; }
    // Do NOT blank the feed on re-fetch. `loaded` only gates the very first
    // paint ("opening the field…"); once true it stays true so that the
    // refreshes fired after every like/seal/delete swap data in place
    // (cards keyed by capsule.id, stable <img src> → React reconciles in
    // place, no reload) instead of flashing the whole list empty.
    try {
      const res = await callAigramAPI<AigramResponse<SaveRow[]>>(
        `/note/aigram/ai/game/get/data/list?session_id=${encodeURIComponent(sessionId)}`,
        'GET',
      );
      const rows: SaveRow[] = Array.isArray(res?.data) ? res.data : [];

      const pairs: Array<{ userId: string; capsule: Capsule }> = [];
      const likes = new Map<string, Set<string>>();
      for (const row of rows) {
        if (!row.user_id || !row.resource_data) continue;
        try {
          const save = JSON.parse(row.resource_data) as CapsuleSave;
          for (const capsule of save.capsules || []) {
            if (capsule && capsule.imageUrl) {
              pairs.push({ userId: row.user_id, capsule });
            }
          }
          for (const likedId of save.likes || []) {
            if (!likes.has(likedId)) likes.set(likedId, new Set());
            likes.get(likedId)!.add(row.user_id);
          }
        } catch { /* skip corrupt row */ }
      }
      setLikesByCapsule(likes);
      pairs.sort((a, b) => (b.capsule.ts ?? 0) - (a.capsule.ts ?? 0));
      const limited = pairs.slice(0, MAX_DISPLAY);

      const uniqueIds = Array.from(new Set(limited.map(p => p.userId)));
      const profileEntries = await Promise.all(
        uniqueIds.map(async uid => {
          try {
            const r = await callAigramAPI<AigramResponse<ProfileData>>(
              `/note/telegram/user/get/info/by/telegram_id?telegram_id=${encodeURIComponent(uid)}`,
              'GET',
            );
            return [uid, r?.data ?? null] as const;
          } catch {
            return [uid, null as ProfileData | null] as const;
          }
        }),
      );
      const profileMap = new Map<string, ProfileData | null>(profileEntries);

      setServerEntries(
        limited.map(({ userId, capsule }) => {
          const p = profileMap.get(userId) || null;
          return {
            userId,
            userName: p?.name,
            userAvatarUrl: p?.head_url,
            capsule,
          };
        }),
      );
    } catch {
      setServerEntries([]);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  return { entries, likesByCapsule, loaded, refresh, injectLocal, removeLocal };
}
