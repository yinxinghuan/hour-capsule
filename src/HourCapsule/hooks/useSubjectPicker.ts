// LLM subject + anchor picker for the next Hour Capsule.
//
// Direct fetch to the platform's stateless game-chat endpoint
// (https://chat.aiwaves.tech/aigram/api/game-chat), OpenAI-format messages.
// We don't use the runtime useChat hook because each pick is one-shot and
// must NOT accumulate history.
//
// Output: {anchor, subject} JSON.
//   · anchor  — the single headline event today's capsule is "really
//     about", 4-10 word English phrase. Null when wire is empty.
//   · subject — the photographable noun phrase that goes into the bag.
//     Belongs to the domain anchor. When a wire anchor is chosen, the
//     subject is a PERIPHERAL object found at the scene of that event
//     (not the event's central headline object). When wire is empty,
//     the subject is a fresh non-default fallback.
//
// SealDetail surfaces the anchor above the wire list as "today · {anchor}"
// so the player can read why this object exists for today.

const CHAT_URL = 'https://chat.aiwaves.tech/aigram/api/game-chat';

const SYSTEM = `You are picking what to vacuum-seal as today's Hour Capsule. You will read today's news headlines and pick ONE event today should be remembered for, then pick ONE concrete photographable object that names or comes from that event.

🚨 BE DIRECT, NOT SYMBOLIC. The connection between the event and the object must be readable in 2 seconds — players will see the wire + the capsule side-by-side and should immediately think "oh, that's today." Literal echoes are WELCOMED. If today has a cricket final, a cricket ball is welcome. If today has a wildfire, a charred matchstick is welcome. If today has a vaccine breakthrough, a small glass vial is welcome.

You receive:
  · TODAY'S HEADLINES (5-10 items from HN top + Wikipedia featured) — may be empty.
  · A DOMAIN ANCHOR (the object must fit this category).
  · AVOID lists (recent global + recent self picks — don't repeat in spirit).

Your job (two parts, both in one JSON output):

1. ANCHOR: pick ONE headline that today is "really about" — the one most worth representing. Output a short 4-10 word English phrase naming the event. Specific event, not generic mood. Examples:
   · "IPL cricket final in Bengaluru"
   · "Mindanao earthquake landslide aftermath"
   · "Open source project crosses 10M users"
   The anchor should be specific enough that the player understands which headline you chose.

2. SUBJECT: pick ONE concrete object that comes from, names, or is the kind of thing you'd find at the scene of the anchor event. The object MUST fit the domain anchor. Be specific — material, scale, age, condition all specified.

🚨 CRITICAL — SUBJECT IS PERIPHERAL, NOT THE EVENT'S COVER OBJECT.
Pick something you'd find at the SCENE of the anchor event, not the iconic central thing the headline is ABOUT.
   · Peace treaty signed → NOT the treaty document itself. A single grain of rice from the signing banquet. A folded place card.
   · Election result → NOT a ballot. A coffee-stained polling-station volunteer's name tag.
   · Earthquake landslide → NOT a rescue blanket. A cracked household teacup pulled from the rubble; a torn evacuation notice; a broken twig from an uprooted tree.
   · Cricket final → NOT the trophy. A worn cricket ball with loosening seams; a torn ticket stub; a single grass blade from the pitch.
   · Vaccine breakthrough → NOT a syringe. A small glass vial with a printed lot number; a folded clinic appointment slip.
The peripheral object reads as evidence the player was THERE in spirit, rather than handed the news photo. Picking the cover object reads like a newswire stock photo — avoid.

EXAMPLES OF GOOD (anchor, domain → subject) TRIPLES:
   · anchor "IPL cricket final" + domain "small everyday tool" → "a worn red leather cricket ball, seams loosening at the equator"
   · anchor "Mindanao earthquake landslide" + domain "single piece of paper" → "a torn evacuation notice from a coastal township, edges water-stained"
   · anchor "Mindanao earthquake landslide" + domain "organic plant material" → "a small clump of red-clay soil with a single broken root, still damp"
   · anchor "Open source 10M-user milestone" + domain "small everyday tool" → "a worn mechanical keyboard keycap, edges polished from years of use"

If today's headlines are tonally noisy (mix of triumph, tragedy, oddities), pick whichever single headline is the most STRIKING / GRAPHIC — the one that has the most visual texture for an object to reference. Don't average.

🚨 EMPTY WIRE FALLBACK. If no headlines are provided, output anchor = null and pick a FRESH, specific object that fits the domain anchor — must NOT be a tired default. Tier-1 forbidden (never output these, even in fallback):
   · a lotus seed pod (any variation)
   · a sewing thimble (any variation) — even if "small tool" implies sewing, pick a darning needle, a wooden spool of thread, a pair of embroidery scissors, a button card
   · a handwritten condolence letter / note / sympathy card
   · a corkscrew, a bottle opener — even if context implies celebration, pick a stack of cocktail napkins, an enamel pin, a hand-rolled candle
   · a concert ticket stub / event ticket / theater ticket
   · a faded postcard
   · dried poppy / eucalyptus / lavender (only if a SPECIFIC wire event names it)
Fallback picks should be specific: material, scale, age, condition. Examples — "a well-worn wooden-handled vegetable peeler with a slightly rusted blade", "a yellowed library checkout card stamped with June 1987 dates", "a curled fern frond with hints of gold dust".

OUTPUT FORMAT: a single JSON object on one line, no markdown fence, no prose around it:
  {"anchor": "<4-10 word event phrase, or null>", "subject": "<6-14 word object noun phrase>"}

AVOID in subject:
  · abstract concepts ("a memory of...")
  · vague plurals ("some leaves")
  · multi-object scenes ("a desk with X and Y")
  · brand names (describe category — say "a smartphone" not "an iPhone")
  · offensive / sexual / overtly partisan material`;

export interface PickArgs {
  /** Hard anchor — picked object MUST live in this domain. Source of truth
   *  for cross-call diversity even when avoid lists / events are empty. */
  domainHint: string;
  worldNudge: string;
  /** Best-effort live world-events strings (HN top + Wikipedia news).
   *  May be empty if both sources failed — picker still works fine. */
  worldEvents?: string[];
  /** This user's last subjects, newest-first. Avoid repeating these. */
  recentSelf: string[];
  /** All cross-user subjects pulled in the last hour, newest-first. Avoid repeating. */
  recentGlobal: string[];
}

export interface PickResult {
  /** 4-10 word English phrase naming today's headline event. Null when
   *  wire was empty / unavailable — SealDetail then skips the anchor row. */
  anchor: string | null;
  /** Photographable English noun phrase to vacuum-seal. */
  subject: string;
}

/** Pull the first balanced {...} object out of the model's response. Tolerates
 *  ```json fences and stray prefacing sentences. */
function extractJsonObject(text: string): Record<string, unknown> {
  const start = text.indexOf('{');
  if (start < 0) throw new Error(`no JSON object in picker output: ${text.slice(0, 200)}`);
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return JSON.parse(text.slice(start, i + 1));
    }
  }
  throw new Error(`unbalanced braces in picker output: ${text.slice(0, 200)}`);
}

function stripPhrase(s: string): string {
  return s
    .replace(/^["'`\-*\s•]+/, '')
    .replace(/["'`.\s]+$/, '')
    .trim();
}

export async function pickSubject(args: PickArgs): Promise<PickResult> {
  const { domainHint, worldNudge, worldEvents = [], recentSelf, recentGlobal } = args;
  const avoidGlobal = recentGlobal.slice(0, 80);
  const avoidSelf = recentSelf.slice(0, 10);
  const events = worldEvents.slice(0, 8);
  const user =
    `DOMAIN ANCHOR FOR THIS PULL (object must live in this lane):\n  → ${domainHint}\n\n` +
    `Current moment: ${worldNudge}\n\n` +
    `TODAY'S HEADLINES:\n` +
    (events.length ? events.map(s => '- ' + s).join('\n') : '(empty — wire fetch returned nothing; output anchor = null and pick a fresh fallback object)') +
    `\n\nAVOID — pulled by other players in the last hour (${avoidGlobal.length}):\n` +
    (avoidGlobal.length ? avoidGlobal.map(s => '- ' + s).join('\n') : '(none yet)') +
    `\n\nAVOID — this player's recent picks (${avoidSelf.length}):\n` +
    (avoidSelf.length ? avoidSelf.map(s => '- ' + s).join('\n') : '(none yet)') +
    `\n\nPick the anchor (or null) and a peripheral scene object. Output JSON only.`;

  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`chat HTTP ${res.status}`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = (json.choices?.[0]?.message?.content ?? '').trim();
  if (!raw) throw new Error('chat: empty reply');

  const obj = extractJsonObject(raw);
  const subject = stripPhrase(String(obj.subject ?? ''));
  if (!subject) throw new Error('picker: empty subject');

  const anchorRaw = obj.anchor;
  const anchor: string | null =
    anchorRaw == null || anchorRaw === 'null' || anchorRaw === ''
      ? null
      : stripPhrase(String(anchorRaw));

  return { anchor, subject };
}
