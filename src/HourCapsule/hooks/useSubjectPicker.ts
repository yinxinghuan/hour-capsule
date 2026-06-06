// LLM subject picker for the next Hour Capsule.
//
// Direct fetch to the platform's stateless game-chat endpoint
// (https://chat.aiwaves.tech/aigram/api/game-chat), OpenAI-format messages.
// We don't use the runtime useChat hook because each pick is one-shot and
// must NOT accumulate history.
//
// Output: a single English noun phrase (~6-14 words), specific enough for
// a hyperreal product photographer to shoot.

const CHAT_URL = 'https://chat.aiwaves.tech/aigram/api/game-chat';

const SYSTEM = `You are the curator for an hourly collectible game called Hour Capsule.
Every hour each player gets ONE vacuum-sealed plastic bag with ONE photographable object inside.
Your job: pick the ONE object to vacuum-seal next.

OUTPUT FORMAT: a single short English noun phrase (5 to 10 words), describing ONE concrete object
clearly enough for a hyperreal product photographer to shoot it. Spare and clean. No editorial
commentary, no metaphor explanation, no adjective stacks, no prefix, no quotes, no trailing period.

PRIORITIES (in order):
1. DIVERSITY (first principle) — never repeat anything in the AVOID lists verbatim OR in spirit.
   Mix surreal and mundane freely. Vary materials, colors, scales, categories, kingdoms (object /
   creature / food / fragment / artifact / specimen / paper / liquid / synthetic / organic / decayed).
   Across calls, keep range maximal.
2. WORLD CONTEXT (used ONLY as temperature, never as content) —
     STEP A. Read the events list AS A WHOLE. Notice the overall TEMPERATURE of the day:
       heavy / restless / quiet / brittle / triumphant / weary / dispersed / suspended.
     STEP B. Pick an object that EMBODIES that temperature — chosen from a completely
       different domain than the headlines.
     STEP C. SELF-CHECK before you output: could your picked object plausibly appear in a
       press photo, stock photo, illustration, or article for ANY of the listed headlines?
       If YES, reject it — it is too literal. Pick something further away.

   HARD PROP BLACKLIST (do NOT pick these classes of objects when the news mentions them):
     · cricket/sports news → no balls / bats / wickets / pads / nets / trophies / medals
     · medieval / historical news → no iron keys / coins / swords / scrolls / candles / parchment
     · fire / explosion / wildfire news → no matches / charred objects / ash / lighters / cinders
     · political / election news → no flags / ballots / podiums / pins
     · finance / market news → no stress balls / dollar bills / coins / stock tickers
     · tech / AI news → no keyboards / chips / screens / cables / robots
     · weather / climate news → no umbrellas / thermometers / leaves / snowflakes
     · health / disease news → no pills / masks / vials / syringes
   The pick should be SURPRISING relative to the headlines, not RELATED to them.

   If the events list is empty or boring, ignore it entirely. The OUTPUT must NOT reference
   the news, the world, the date, or the time — just the object.
3. PHOTOGRAPHABILITY — must be a discrete real thing that fits in a small bag and is striking
   under hard studio light against pure black.

DO NOT output:
- abstract concepts (a memory, regret, hope) unless framed as a physical object
- vague plurals ('some leaves') — be specific ('a single fallen ginkgo leaf, edges curled golden')
- anything in the AVOID lists
- multi-sentence answers, lists, bullets, JSON, or labels
- copyrighted brand objects (Apple iPhone, Nike sneaker, etc.) — describe the category instead
- offensive, sexual, or politically charged material`;

export interface PickArgs {
  worldNudge: string;
  /** Best-effort live world-events strings (HN top + Wikipedia news).
   *  May be empty if both sources failed — picker still works fine. */
  worldEvents?: string[];
  /** This user's last subjects, newest-first. Avoid repeating these. */
  recentSelf: string[];
  /** All cross-user subjects pulled in the last hour, newest-first. Avoid repeating. */
  recentGlobal: string[];
}

export async function pickSubject(args: PickArgs): Promise<string> {
  const { worldNudge, worldEvents = [], recentSelf, recentGlobal } = args;
  const avoidGlobal = recentGlobal.slice(0, 80);
  const avoidSelf = recentSelf.slice(0, 10);
  const events = worldEvents.slice(0, 8);
  const user =
    `Current moment: ${worldNudge}\n\n` +
    `Currently happening in the wider world (use as mood, never name directly):\n` +
    (events.length ? events.map(s => '- ' + s).join('\n') : '(no live events available — lean on hour/season/moon)') +
    `\n\nAVOID — pulled by other players in the last hour (${avoidGlobal.length}):\n` +
    (avoidGlobal.length ? avoidGlobal.map(s => '- ' + s).join('\n') : '(none yet)') +
    `\n\nAVOID — this player's recent picks (${avoidSelf.length}):\n` +
    (avoidSelf.length ? avoidSelf.map(s => '- ' + s).join('\n') : '(none yet)') +
    `\n\nPick ONE object now. Output only the noun phrase.`;

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
  // Strip common LLM decoration: bullets, quotes, leading "•" or "-", trailing periods.
  return raw
    .replace(/^["'`\-*\s•]+/, '')
    .replace(/["'`.\s]+$/, '')
    .trim();
}
