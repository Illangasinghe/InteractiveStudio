import type { MouthCue } from '../../packages/core/index';
import type { StoryActorId } from './types';
import {
  headDataUri,
  tailDataUri,
  footLeftDataUri,
  footRightDataUri,
  COLORWAY_TORSOS,
  COLORWAY_ARMS_LEFT,
  COLORWAY_ARMS_RIGHT,
} from './assets/joeyAssets';

type MouthShape = MouthCue['value'];
type Pose = 'idle' | 'bounce' | 'leap' | 'wave' | 'surprised' | 'phone' | 'point' | 'sleep' | 'moonwalk' | 'carry';
type Expression = 'happy' | 'surprised' | 'sleepy' | 'thoughtful';

function Mouth({ shape, expression, progress = 0.5 }: { shape: MouthShape; expression: Expression; progress?: number }) {
  if (shape === 'X' || shape === 'A') {
    // Closed resting mouth: natural illustrated smile shows cleanly
    return null;
  }
  const openEnvelope = 0.72 + 0.28 * Math.sin(Math.max(0, Math.min(1, progress)) * Math.PI);
  const baseHeight = shape === 'D' || shape === 'E' ? 9 : shape === 'B' ? 4 : 6;
  const baseWidth = shape === 'F' || shape === 'H' ? 6 : 9;
  const height = Math.max(2.5, baseHeight * openEnvelope);
  const width = Math.max(4, baseWidth * (0.85 + 0.15 * openEnvelope));
  return (
    <g transform="translate(0 22)" opacity={0.85}>
      <ellipse cy="0" rx={width} ry={height} fill="#753c30" />
      {height > 4 ? <ellipse cy={height * 0.35} rx={width * 0.6} ry={height * 0.3} fill="#e59892" /> : null}
    </g>
  );
}

export function IllustratedJoey({
  id = 'roo-1',
  x,
  y,
  scale = 1,
  time = 0,
  pose = 'idle',
  expression = 'happy',
  mouth = 'X',
  mouthProgress = 0.5,
  reducedMotion = false,
  rotation = 0,
  flip = false,
  shadow = true,
  squashX = 1,
  squashY = 1,
}: {
  id?: string;
  x: number;
  y: number;
  scale?: number;
  time?: number;
  pose?: Pose;
  expression?: Expression;
  mouth?: MouthShape;
  mouthProgress?: number;
  reducedMotion?: boolean;
  rotation?: number;
  flip?: boolean;
  actor?: Exclude<StoryActorId, 'cat'>;
  shadow?: boolean;
  squashX?: number;
  squashY?: number;
}) {
  const index = Math.max(0, Number(id.split('-')[1] ?? 1) - 1);
  const torsoUri = COLORWAY_TORSOS[index % COLORWAY_TORSOS.length];
  const armLeftUri = COLORWAY_ARMS_LEFT[index % COLORWAY_ARMS_LEFT.length];
  const armRightUri = COLORWAY_ARMS_RIGHT[index % COLORWAY_ARMS_RIGHT.length];

  const phase = time * Math.PI * 2.5 + index * 0.6;
  const sinPhase = Math.sin(phase);
  const absSin = Math.abs(sinPhase);

  const bounce = reducedMotion ? 0 : pose === 'bounce' ? -absSin * 54 : pose === 'moonwalk' ? sinPhase * 4 : Math.sin(time * 1.6 + index) * 2.5;
  const bounceSquashY = reducedMotion ? 1 : pose === 'bounce' ? (absSin < 0.22 ? 0.92 + (absSin / 0.22) * 0.08 : 1 + (absSin - 0.22) * 0.065) : 1 + Math.sin(time * 1.6 + index) * 0.012;
  const bounceSquashX = reducedMotion ? 1 : 2 - bounceSquashY;
  const finalSquashX = squashX * bounceSquashX;
  const finalSquashY = squashY * bounceSquashY;

  const tilt = reducedMotion ? 0 : pose === 'bounce' ? sinPhase * 4 : pose === 'moonwalk' ? -9 : Math.sin(time * 0.9 + index) * 0.8;
  const tailSwing = reducedMotion ? 0 : pose === 'bounce' ? Math.cos(phase - 0.5) * 11 : pose === 'leap' ? -18 : Math.sin(time * 2 + index) * 4;

  const leftArm = pose === 'leap' || pose === 'surprised' ? 115 : pose === 'carry' ? -20 : pose === 'bounce' && !reducedMotion ? -8 - absSin * 14 : 0;
  const rightArm = pose === 'leap' || pose === 'surprised' ? -115 : pose === 'phone' ? -100 : pose === 'point' ? -90 : pose === 'wave' ? -110 + (reducedMotion ? 0 : Math.sin(time * 5) * 14) : pose === 'carry' ? 20 : pose === 'bounce' && !reducedMotion ? 8 + absSin * 14 : 0;

  const sleeping = expression === 'sleepy' || pose === 'sleep';
  const blink = sleeping || (!reducedMotion && (time + index * 0.47) % 4.2 > 4.04);
  const shadowScale = reducedMotion ? 1 : Math.max(0.55, 1 + bounce / 130);
  const shadowOpacity = reducedMotion ? 0.12 : Math.max(0.05, 0.14 + bounce / 600);

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale}) rotate(${rotation})`} data-story-character={id}>
      {/* Contact Shadow under feet and tail */}
      {shadow ? <ellipse cx="10" cy="2" rx={110 * shadowScale} ry={16 * shadowScale} fill="#596b51" opacity={shadowOpacity} /> : null}

      {/* Main Body Rig with Squash & Bounce */}
      <g transform={`translate(0 ${-188 + bounce}) rotate(${tilt}) scale(${finalSquashX * 0.82} ${finalSquashY * 0.82})`}>
        {/* 1. Tail (Layer 1: Behind body, anchored at hip, sweeping onto the bed) */}
        <g transform={`translate(-68 95) rotate(${tailSwing} 10 10)`}>
          <image href={tailDataUri} width="220" height="220" x="-180" y="-35" />
        </g>

        {/* 2. Hind Feet (Layer 2: Long macropod kangaroo feet grounded under leg cuffs) */}
        <g>
          {/* Near foot (3/4 angle) */}
          <image href={footLeftDataUri} width="122" height="102" x="-68" y="142" />
          {/* Far foot (extending horizontally forward) */}
          <image href={footRightDataUri} width="154" height="94" x="28" y="136" />
        </g>

        {/* 3. Torso (Layer 3: Pajamas with 5 distinct colorways and star pattern) */}
        <g>
          <image href={torsoUri} width="182" height="284" x="-91" y="-100" />
        </g>

        {/* 4. Left Arm & Paw (Seamless shoulder pivot, no socket holes) */}
        <g transform={`translate(-42 -72) rotate(${leftArm})`}>
          <image href={armLeftUri} width="101" height="165" x="-46" y="-14" />
        </g>

        {/* 5. Right Arm & Paw (Seamless shoulder pivot, no socket holes) */}
        <g transform={`translate(38 -72) rotate(${rightArm})`}>
          <image href={armRightUri} width="110" height="159" x="-42" y="-12" />
        </g>

        {/* 6. Head with Ears, Muzzle, and Expressive Face */}
        <g transform="translate(0 -178)">
          <image href={headDataUri} width="200" height="254" x="-100" y="-155" />

          {/* Expressive Eyelids for Blinking / Sleep */}
          {blink ? (
            <g stroke="#493224" strokeWidth="3.5" fill="none" strokeLinecap="round">
              <path d="M-46 -17 Q-34 -9 -22 -17" />
              <path d="M21 -17 Q33 -9 45 -17" />
            </g>
          ) : null}

          {/* Lip-sync Mouth Phoneme (Aligned with illustrated mouth) */}
          <Mouth shape={mouth} expression={expression} progress={mouthProgress} />
        </g>
      </g>
    </g>
  );
}
