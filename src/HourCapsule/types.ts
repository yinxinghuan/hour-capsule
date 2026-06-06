// One vacuum-sealed bag the player collected. Subject is LLM-decided
// at collect time. Image is gen'd with the v8 prompt, baking subject
// + real MFG timestamp + owner stamp into the picture.

export type Phase =
  | 'field'      // landing tab — public wall
  | 'sealing'    // gen-image in flight
  | 'reveal'     // result + Seal-it confirm
  | 'altar'      // personal collection tab
  ;

export interface Capsule {
  id: string;
  ts: number;           // collect timestamp — printed as MFG stamp inside the image
  subject: string;      // LLM-chosen English noun phrase
  imageUrl: string;
  serial: number;       // per-user lifetime sequence — printed as #N stamp
}

export interface CapsuleSave {
  capsules: Capsule[];
  likes?: string[];
  /** ms timestamp of last collect — drives the 1-hour cooldown. NEVER OR
   *  with platform stats (daily-lock-trap rule applies to any per-time gate). */
  lastCollectAt?: number;
  /** Monotonic counter — next serial = collectsTotal + 1. */
  collectsTotal: number;
  onboarded?: boolean;
}

export const COLLECT_COOLDOWN_MS = 60 * 60 * 1000;   // 1 hour
