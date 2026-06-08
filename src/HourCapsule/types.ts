// One vacuum-sealed bag the player collected. Subject is LLM-decided
// at collect time. Image is gen'd with the v8 prompt, baking subject
// + real MFG timestamp + owner stamp into the picture.

export type Phase =
  | 'field'      // landing tab — public wall
  | 'sealing'    // gen-image in flight
  | 'reveal'     // result + Seal-it confirm
  | 'altar'      // personal collection tab
  ;

export type Rarity = 'common' | 'uncommon' | 'rare';

export interface Capsule {
  id: string;
  ts: number;           // collect timestamp — printed as MFG stamp inside the image
  subject: string;      // LLM-chosen English noun phrase
  imageUrl: string;
  serial: number;       // per-user lifetime sequence — printed as #N stamp
  rarity?: Rarity;      // optional — older capsules may not have it (treated as 'common')
  /** World headlines fetched at seal time (HN: / World: / Featured: prefixed).
   *  Frozen with the capsule so the detail view can show the historical
   *  reading context the curator was sealing under. Older capsules don't
   *  have it (empty / undefined → section just doesn't render). */
  worldEvents?: string[];
}

export interface CapsuleSave {
  capsules: Capsule[];
  likes?: string[];
  /** ms timestamp of last collect — drives the 1-hour cooldown. NEVER OR
   *  with platform stats (daily-lock-trap rule applies to any per-time gate). */
  lastCollectAt?: number;
  /** Monotonic counter — next serial = collectsTotal + 1. */
  collectsTotal: number;
  /** Last few DOMAIN anchors used to seed the LLM picker. Excluded from
   *  the next random draw so consecutive pulls span different "kingdoms"
   *  (material / scale / context). Newest first, capped at 6. */
  recentDomains?: string[];
  /** Consecutive-hour collect streak. +1 if the next seal happens within
   *  GRACE_MS after the cooldown ended; resets to 1 if missed longer. */
  streak?: number;
  onboarded?: boolean;
}

/** Streak grace period — once the 1h cooldown ends, the player has this
 *  long to seal the next capsule before the streak resets. 1 hour. */
export const STREAK_GRACE_MS = 60 * 60 * 1000;

export const COLLECT_COOLDOWN_MS = 60 * 60 * 1000;   // 1 hour
