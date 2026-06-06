// Compose the v8 vacuum-bag prompt from a subject + the real collect
// timestamp + the owner stamp, then call useGenImage with the α SVG
// as img2img ref. Verified across 8 prompt iterations (see
// /tmp/bag-watermark/gen_many.py).

import { useCallback, useState } from 'react';
import { useGenImage } from '@shared/runtime';
import { formatStamp, formatSerial } from '../utils/day';

/** Public R2 URL of the white α logo (rasterized from alteru.svg @ 1024²,
 *  fill #FFFFFF). Used as img2img reference so the model paints a Greek-
 *  letter alpha shape printed onto the plastic with wrinkle conformity. */
const ALPHA_REF_URL = 'https://images.aiwaves.tech/bag-watermark/alteru_white_1024.png';

export interface BagSpec {
  subject: string;       // LLM-chosen English noun phrase
  mfgTs: number;         // collect timestamp in ms
  ownerName: string;     // display name, prefixed with '@' if missing
  ownerSerial: number;   // monotonic per-user lifetime counter
}

export interface BagResult {
  imageUrl: string;
}

function normalizeOwner(name: string): string {
  const trimmed = (name || 'guest').trim();
  return trimmed.startsWith('@') ? trimmed : '@' + trimmed;
}

function buildPrompt(spec: BagSpec): string {
  const owner = normalizeOwner(spec.ownerName);
  const serial = formatSerial(spec.ownerSerial);
  const mfg = formatStamp(spec.mfgTs);
  return [
    `Photorealistic studio product photograph of a vacuum-sealed transparent plastic bag containing ${spec.subject}.`,
    `Shot with 80mm lens at f/8, magazine-quality studio product photography.`,
    `The plastic film is thin glossy retail packaging plastic with organic gravity drape and natural sag, heavy realistic crumples and large soft folds running through the body of the bag, deep shadows pooling inside the fold valleys, crisp narrow specular highlights running along the ridges of every crease, the plastic behaves like a real heat-sealed transparent retail food packaging bag — clean smooth film, NOT crinkled foil, NOT shiny mylar.`,
    `Soft directional studio softbox lighting, central composition, eye-level shot, deep pure black background, very high contrast, deep blacks.`,
    `The bag and the black background fill the entire square frame edge to edge full-bleed with no border, no panel, no side bars.`,
    `CRITICAL: the object is sealed INSIDE the plastic bag — diagonal X-shape and Y-shape specular highlight streaks from the studio softboxes visibly cross over and through the surface of the contents, partly obscuring and distorting parts of the object underneath. Bright bands of reflected studio light layer on TOP of the object, so the object reads as BEHIND the wrinkled plastic film, not floating in front of it. Plastic crease ridges and specular highlights run continuously across both the bag body AND the contents in one unbroken pattern.`,
    `In the BOTTOM-LEFT corner of the bag, a small minimalist Greek-letter alpha 'α' logo from the reference image is printed in MUTED FADED WHITE ink WITH SLIGHT TRANSPARENCY (NOT pure bright white, NOT fully opaque, softly translucent) on the plastic film, only about 7 percent of the bag width — kept consistently small and modest, never large or prominent, never more than 7 percent — picking up the plastic wrinkles and reflections, slightly distorted by the folds underneath, conforming to the surface of the bag, low prominence.`,
    `Directly below the top heat-sealed zip-lock strip, on a flat un-creased horizontal band of the upper plastic body of the bag, a small subtle dot-matrix MFG date stamp reading 'MFG ${mfg}' is printed in white inkjet ink in a 5x7 dot-matrix font, only about 10 percent of the bag width wide, looking like a small real food-package production date stamp, slightly faded and uneven, low prominence, the white dots picking up the plastic film texture and following the wrinkles underneath.`,
    `In the BOTTOM-RIGHT corner of the bag, on the lower plastic body, a small subtle owner label printed in white inkjet ink in the same 5x7 dot-matrix font, only about 10 percent of the bag width wide, arranged as TWO STACKED LINES: the top line reads '${owner}' (the username) and directly below it on a second line reads '${serial}' (the serial number). Both lines are the same small size and low prominence as the MFG stamp, slightly faded, the white dots picking up the plastic wrinkles.`,
    `No other text, no barcode, no brand name, no additional logos.`,
    `Do NOT include: trapped dust particles, fingerprint smudges, floating specks, sparkles, glitter, metallic sheen, mylar look — keep the plastic clean and natural.`,
  ].join(' ');
}

export function useBagGen() {
  const gen = useGenImage();
  const [stage, setStage] = useState<'idle' | 'gen' | 'done' | 'error'>('idle');

  const generate = useCallback(async (spec: BagSpec): Promise<BagResult> => {
    setStage('gen');
    try {
      const imageUrl = await gen.generate({
        prompt: buildPrompt(spec),
        ref_url: ALPHA_REF_URL,
      });
      setStage('done');
      return { imageUrl };
    } catch (e) {
      setStage('error');
      throw e;
    }
  }, [gen]);

  return {
    generate,
    stage,
    loading: gen.loading,
    error: gen.error,
    reset: () => setStage('idle'),
  };
}
