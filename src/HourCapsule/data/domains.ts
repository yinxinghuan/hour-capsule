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

export const DOMAINS: string[] = [
  'a plant fragment — pressed leaf, seed pod, dried flower, root, mushroom',
  'a small metal hardware piece — single screw, bent nail, hinge, washer, key teeth',
  'a paper artifact — torn page, ticket stub, receipt, postcard, folded map',
  'a fabric or textile fragment — frayed ribbon, soiled glove, scrap of velvet, dirty sock',
  'a glass object — fragment, marble, shard from a bottle neck, snow globe',
  'a ceramic or porcelain piece — broken figurine, teacup shard, glazed tile',
  'a sealed vial of liquid — colored fluid, oil, ink, perfume',
  'an edible item, fresh or rotting — single piece of fruit, candy, baked thing, bone',
  'an object that obviously belonged to a child — toy fragment, sticker, drawing, baby shoe',
  'a kitchen object or food packet — utensil, spice sachet, broken plate, foil-wrapped thing',
  'a religious or ritual object — prayer bead, candle stub, charm, talisman',
  'a medical or laboratory object — gauze, prescription bottle, slide, vial, syringe (clean)',
  'an animal residue — feather, shed claw, eggshell, snake skin, single scale, single tooth',
  'a pressed dead small creature — insect, butterfly wing, dried lizard, mouse skeleton',
  'a rubber or plastic object — band, deflated balloon, foam piece, toy fragment',
  'an electronic component or fragment — wire bundle, dead battery, circuit chip, broken bulb',
  'a small stone, crystal, or mineral — pebble, geode chip, raw crystal cluster, fossil sliver',
  'an object from the sea — shell, dried starfish, sea glass, fishing lure, single barnacle',
  'a cosmetic or grooming item — half-used lipstick, broken comb, mirror sliver, hairpin',
  'a small musical or sound-making object — guitar pick, tuning fork, broken reed, sheet music page',
  'a game or chance object — single playing card, dice, marble, casino chip, mahjong tile',
  'a photograph or printed image — single Polaroid, torn magazine page, postcard, contact sheet',
  'a handwritten or signed paper — folded note, signed name on paper, diary page, telegram',
  'an aromatic or scented object — dried potpourri, herbal sachet, incense stub, perfumed letter',
  'a soft tactile object — feather, cotton ball, sponge, pillow stuffing',
  'a bound or knotted object — rope knot, hair tie, twine bundle, friendship bracelet',
  'a burnt or charred object — match end, ash, scorched cloth, half-melted candle',
  'a frozen or suspended thing — single water droplet, dew on a leaf, frozen insect',
  'a wrapped or sealed parcel — small twine bundle, tissue-wrapped item, sealed envelope',
  'an object aged with patina — verdigris coin, oxidized clasp, rusted small tool',
  'a paired object missing its partner — one shoe, one earring, one cufflink, one chopstick',
  'a workshop tool or fragment — drill bit, paint chip, pencil stub, sanded wood block',
  'a rural or agricultural object — hayseed, dried corn cob, farrier nail, sheep wool tuft',
  'an urban detritus — bottle cap, subway token, parking ticket, cigarette butt, vending change',
  'a travel souvenir — pressed flower, foreign coin, hotel matchbook, ticket stub from abroad',
  'a dense heavy small object — single steel ball bearing, lead weight, mercury thermometer',
  'a feather-light floating object — dandelion clock, soap bubble film, dragonfly wing',
  'a sentimental human relic — single baby tooth, lock of hair, dried umbilical clamp',
  'a small culturally specific item — single mahjong tile, rosary bead, hanafuda card, joss paper',
  'an object that doesn\'t make sense out of context — single lone button on red thread, small key on a black tag',
];

/** Pick one domain at random, excluding any already used recently. */
export function pickDomain(recent: string[] = []): string {
  const used = new Set(recent);
  const pool = DOMAINS.filter(d => !used.has(d));
  const choices = pool.length > 0 ? pool : DOMAINS;
  return choices[Math.floor(Math.random() * choices.length)];
}
