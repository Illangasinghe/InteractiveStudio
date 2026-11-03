import { memo } from 'react';
import type { MouthCue } from '../../packages/core/index';
import { daddyKangarooDataUri } from './assets/storyAssets';

type MouthShape = MouthCue['value'];
type Pose = 'idle' | 'surprised' | 'phone' | 'point' | 'wave' | 'bounce' | 'leap' | 'sleep' | 'moonwalk' | 'carry';
type Expression = 'happy' | 'surprised' | 'sleepy' | 'thoughtful';

function DadMouth({ shape, expression, progress = 0.5 }: { shape: MouthShape; expression: Expression; progress?: number }) {
  if (expression === 'surprised') {
    return (
      <g transform="translate(36 -348)">
        <ellipse rx="8.5" ry="12" fill="#58241b" stroke="#3b1711" strokeWidth="1.5" />
        <ellipse cy="5" rx="5.5" ry="4" fill="#df7872" />
      </g>
    );
  }
  if (shape === 'X' || shape === 'A') {
    // Resting closed mouth: illustrated smile shows naturally
    return null;
  }
  const openEnvelope = 0.72 + 0.28 * Math.sin(Math.max(0, Math.min(1, progress)) * Math.PI);
  const baseHeight = shape === 'D' || shape === 'E' ? 14 : shape === 'B' ? 6 : 10;
  const baseWidth = shape === 'F' || shape === 'H' ? 9 : 14;
  const height = Math.max(3.5, baseHeight * openEnvelope);
  const width = Math.max(6, baseWidth * (0.85 + 0.15 * openEnvelope));
  return (
    <g transform="translate(36 -348)">
      <ellipse rx={width} ry={height} fill="#58241b" />
      {height > 6 ? <ellipse cy={height * 0.4} rx={width * 0.65} ry={height * 0.35} fill="#df7872" /> : null}
      {shape === 'B' || shape === 'G' ? (
        <path d={`M${-width + 2} -2 H${width - 2}`} stroke="#fff9ee" strokeWidth="2.5" strokeLinecap="round" />
      ) : null}
    </g>
  );
}

export const IllustratedDad = memo(function IllustratedDad({
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
  shadow?: boolean;
  squashX?: number;
  squashY?: number;
}) {
  const breath = reducedMotion ? 0 : Math.sin(time * 1.8) * 2;
  const waveAngle = reducedMotion ? 0 : Math.sin(time * 6) * 14;
  const blink = expression === 'sleepy' || (!reducedMotion && (time + 0.3) % 4.6 > 4.42);
  const isSurprised = expression === 'surprised' || pose === 'surprised';

  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale}) rotate(${rotation})`}
      data-story-character="dad"
    >
      {/* Contact Shadow under long macropod feet and tripod tail */}
      {shadow ? <ellipse cx="-15" cy="2" rx="145" ry="18" fill="#596b51" opacity="0.16" /> : null}

      {/* Main Father Kangaroo Rig */}
      <g transform={`translate(0 ${breath}) scale(${squashX} ${squashY})`}>
        {/* Full 2.5D Illustrated Dad Kangaroo */}
        <g transform="translate(-172 -468)">
          <image href={daddyKangarooDataUri} width="300" height="475" />
        </g>

        {/* Expressive Eyelids / Blinking / Surprise behind round glasses frames */}
        {blink ? (
          <g stroke="#483424" strokeWidth="3.2" fill="none" strokeLinecap="round">
            <path d="M-2 -387 Q6 -381 15 -387" />
            <path d="M43 -387 Q52 -381 60 -387" />
          </g>
        ) : isSurprised ? (
          <g>
            <ellipse cx="6" cy="-388" rx="6.5" ry="8.5" fill="#2d1c10" />
            <ellipse cx="52" cy="-388" rx="6.5" ry="8.5" fill="#2d1c10" />
            <circle cx="4.5" cy="-391" r="2.2" fill="#ffffff" />
            <circle cx="50.5" cy="-391" r="2.2" fill="#ffffff" />
          </g>
        ) : null}

        {/* Dynamic Mouth Phonemes aligned with snout */}
        <DadMouth shape={mouth} expression={isSurprised ? 'surprised' : expression} progress={mouthProgress} />

        {/* Phone Accessory when Dad calls the doctor */}
        {pose === 'phone' ? (
          <g transform="translate(30 -362) rotate(-8)">
            {/* Dark teal pediatric smartphone */}
            <rect x="-9" y="-21" width="18" height="40" rx="4.5" fill="#2d423e" stroke="#1d2c29" strokeWidth="1.5" />
            <rect x="-6.5" y="-16.5" width="13" height="25" rx="2" fill="#d2e5dd" />
            <circle cy="13.5" r="1.8" fill="#eaf4ef" />
            {/* Kangaroo Paw holding the phone up to ear */}
            <ellipse cx="3" cy="5" rx="7.5" ry="9.5" fill="#d99354" transform="rotate(16 3 5)" />
            <circle cx="8" cy="8.5" r="2.8" fill="#c47e40" />
            <circle cx="5" cy="12.5" r="2.8" fill="#c47e40" />
          </g>
        ) : null}

        {/* Waving Paw in family finale */}
        {pose === 'wave' ? (
          <g transform={`translate(74 -260) rotate(${-30 + waveAngle})`}>
            {/* Spruce-teal cardigan sleeve */}
            <path d="M-10 -15 L12 -65 L32 -55 L8 -5 Z" fill="#558179" />
            <ellipse cx="22" cy="-60" rx="9" ry="12" fill="#d99354" />
            <circle cx="26" cy="-68" r="3" fill="#c47e40" />
            <circle cx="21" cy="-71" r="3" fill="#c47e40" />
            <circle cx="16" cy="-69" r="3" fill="#c47e40" />
          </g>
        ) : null}

        {/* Pointing Paw */}
        {pose === 'point' ? (
          <g transform="translate(68 -245) rotate(-15)">
            <ellipse cx="14" cy="-10" rx="8" ry="11" fill="#d99354" />
            <path d="M14 -12 L34 -18" stroke="#d99354" strokeWidth="5.5" strokeLinecap="round" />
          </g>
        ) : null}
      </g>
    </g>
  );
});
