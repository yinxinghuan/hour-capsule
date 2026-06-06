// Domain anchor pool for the LLM subject picker.
//
// Each pull randomly draws ONE domain (excluding the user's last 6) and
// passes it to the picker as a hard anchor. The LLM must pick an object
// that clearly belongs to that domain. Even if news fetch is blocked and
// avoid lists are empty, this guarantees consecutive pulls live in
// completely different kingdoms — diversity by construction.
//
// First principle ([[platform-scroll-feed]] derivative): when you only
// get one capsule per hour, the surprise across pulls must be wide.
//
// Rarity tiers (added 2026-06-07):
//   · common    — most picks; standard plastic, white α
//   · uncommon  — ~15%; silver α + faint silver iridescent shimmer
//   · rare      — ~5%;  gold α + gold filigree along seal strips
// Tier picked FIRST (weighted by target percentage), then a domain is
// drawn from within that tier's bucket. Distribution is precise.

import type { Rarity } from '../types';

interface Domain {
  phrase: string;
  rarity: Rarity;
}

export const DOMAINS: Domain[] = [
  { phrase: 'a plant fragment — pressed leaf, seed pod, dried flower, root, mushroom', rarity: 'common' },
  { phrase: 'a small metal hardware piece — single screw, bent nail, hinge, washer, key teeth', rarity: 'common' },
  { phrase: 'a paper artifact — torn page, ticket stub, receipt, postcard, folded map', rarity: 'common' },
  { phrase: 'a fabric or textile fragment — frayed ribbon, soiled glove, scrap of velvet, dirty sock', rarity: 'common' },
  { phrase: 'a glass object — fragment, marble, shard from a bottle neck, snow globe', rarity: 'common' },
  { phrase: 'a ceramic or porcelain piece — broken figurine, teacup shard, glazed tile', rarity: 'common' },
  { phrase: 'a sealed vial of liquid — colored fluid, oil, ink, perfume', rarity: 'uncommon' },
  { phrase: 'an edible item, fresh or rotting — single piece of fruit, candy, baked thing, bone', rarity: 'common' },
  { phrase: 'an object that obviously belonged to a child — toy fragment, sticker, drawing, baby shoe', rarity: 'common' },
  { phrase: 'a kitchen object or food packet — utensil, spice sachet, broken plate, foil-wrapped thing', rarity: 'common' },
  { phrase: 'a religious or ritual object — prayer bead, candle stub, charm, talisman', rarity: 'uncommon' },
  { phrase: 'a medical or laboratory object — gauze, prescription bottle, slide, vial, syringe (clean)', rarity: 'common' },
  { phrase: 'an animal residue — feather, shed claw, eggshell, snake skin, single scale, single tooth', rarity: 'common' },
  { phrase: 'a pressed dead small creature — insect, butterfly wing, dried lizard, mouse skeleton', rarity: 'uncommon' },
  { phrase: 'a rubber or plastic object — band, deflated balloon, foam piece, toy fragment', rarity: 'common' },
  { phrase: 'an electronic component or fragment — wire bundle, dead battery, circuit chip, broken bulb', rarity: 'common' },
  { phrase: 'a small stone, crystal, or mineral — pebble, geode chip, raw crystal cluster, fossil sliver', rarity: 'common' },
  { phrase: 'an object from the sea — shell, dried starfish, sea glass, fishing lure, single barnacle', rarity: 'uncommon' },
  { phrase: 'a cosmetic or grooming item — half-used lipstick, broken comb, mirror sliver, hairpin', rarity: 'common' },
  { phrase: 'a small musical or sound-making object — guitar pick, tuning fork, broken reed, sheet music page', rarity: 'common' },
  { phrase: 'a game or chance object — single playing card, dice, marble, casino chip, mahjong tile', rarity: 'common' },
  { phrase: 'a photograph or printed image — single Polaroid, torn magazine page, postcard, contact sheet', rarity: 'common' },
  { phrase: 'a handwritten or signed paper — folded note, signed name on paper, diary page, telegram', rarity: 'uncommon' },
  { phrase: 'an aromatic or scented object — dried potpourri, herbal sachet, incense stub, perfumed letter', rarity: 'common' },
  { phrase: 'a soft tactile object — feather, cotton ball, sponge, pillow stuffing', rarity: 'common' },
  { phrase: 'a bound or knotted object — rope knot, hair tie, twine bundle, friendship bracelet', rarity: 'common' },
  { phrase: 'a burnt or charred object — match end, ash, scorched cloth, half-melted candle', rarity: 'common' },
  { phrase: 'a frozen or suspended thing — single water droplet, dew on a leaf, frozen insect', rarity: 'rare' },
  { phrase: 'a wrapped or sealed parcel — small twine bundle, tissue-wrapped item, sealed envelope', rarity: 'uncommon' },
  { phrase: 'an object aged with patina — verdigris coin, oxidized clasp, rusted small tool', rarity: 'common' },
  { phrase: 'a paired object missing its partner — one shoe, one earring, one cufflink, one chopstick', rarity: 'uncommon' },
  { phrase: 'a workshop tool or fragment — drill bit, paint chip, pencil stub, sanded wood block', rarity: 'common' },
  { phrase: 'a rural or agricultural object — hayseed, dried corn cob, farrier nail, sheep wool tuft', rarity: 'common' },
  { phrase: 'an urban detritus — bottle cap, subway token, parking ticket, cigarette butt, vending change', rarity: 'common' },
  { phrase: 'a travel souvenir — pressed flower, foreign coin, hotel matchbook, ticket stub from abroad', rarity: 'common' },
  { phrase: 'a dense heavy small object — single steel ball bearing, lead weight, mercury thermometer', rarity: 'common' },
  { phrase: 'a feather-light floating object — dandelion clock, soap bubble film, dragonfly wing', rarity: 'common' },
  { phrase: 'a sentimental human relic — single baby tooth, lock of hair, dried umbilical clamp', rarity: 'rare' },
  { phrase: 'a small culturally specific item — single mahjong tile, rosary bead, hanafuda card, joss paper', rarity: 'uncommon' },
  { phrase: 'an object that doesn\'t make sense out of context — single lone button on red thread, small key on a black tag', rarity: 'rare' },
];

// Tier probabilities. Tier first (precise %), then random domain inside the tier.
const TIER_PROBS: Array<{ tier: Rarity; p: number }> = [
  { tier: 'common',   p: 0.80 },
  { tier: 'uncommon', p: 0.15 },
  { tier: 'rare',     p: 0.05 },
];

export interface PickedDomain {
  phrase: string;
  rarity: Rarity;
}

/** Tier-weighted pick with recent-domain exclusion. */
export function pickDomain(recent: string[] = []): PickedDomain {
  const r = Math.random();
  let acc = 0;
  let tier: Rarity = 'common';
  for (const { tier: t, p } of TIER_PROBS) {
    acc += p;
    if (r < acc) { tier = t; break; }
  }
  const used = new Set(recent);
  const tierPool = DOMAINS.filter(d => d.rarity === tier);
  const fresh = tierPool.filter(d => !used.has(d.phrase));
  const choices = fresh.length > 0 ? fresh : tierPool;
  const picked = choices[Math.floor(Math.random() * choices.length)];
  return { phrase: picked.phrase, rarity: picked.rarity };
}
