import { memo } from 'react';
import type { MouthCue } from '../../packages/core/index';
import { doctorKangarooDataUri } from './assets/storyAssets';

type MouthShape = MouthCue['value'];
type Pose = 'idle' | 'surprised' | 'phone' | 'point' | 'wave' | 'bounce' | 'leap' | 'sleep' | 'moonwalk' | 'carry';
type Expression = 'happy' | 'surprised' | 'sleepy' | 'thoughtful';

function DocMouth({ shape, expression, progress = 0.5 }: { shape: MouthShape; expression: Expression; progress?: number }) {
  if (shape === 'X' || shape === 'A') {
    // Natural illustrated pediatric smile shows cleanly
    return null;
  }
  const openEnvelope = 0.72 + 0.28 * Math.sin(Math.max(0, Math.min(1, progress)) * Math.PI);
  const baseHeight = shape === 'D' || shape === 'E' ? 14 : shape === 'B' ? 6 : 10;
  const baseWidth = shape === 'F' || shape === 'H' ? 9 : 14;
  const height = Math.max(3.5, baseHeight * openEnvelope);
  const width = Math.max(6, baseWidth * (0.85 + 0.15 * openEnvelope));
  return (
    <g transform="translate(6 -324)">
      <ellipse rx={width} ry={height} fill="#58241b" />
      {height > 6 ? <ellipse cy={height * 0.4} rx={width * 0.65} ry={height * 0.35} fill="#df7872" /> : null}
      {shape === 'B' || shape === 'G' ? (
        <path d={`M${-width + 2} -2 H${width - 2}`} stroke="#fff9ee" strokeWidth="2.5" strokeLinecap="round" />
      ) : null}
    </g>
  );
}

export const IllustratedDoctor = memo(function IllustratedDoctor({
  x,
  y,
  scale = 1,
  time = 0,
  pose = 'phone',
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
  const breath = reducedMotion ? 0 : Math.sin(time * 1.5) * 2;
  const adviceWag = reducedMotion ? 0 : Math.sin(time * 5.5) * 12;
  const blink = expression === 'sleepy' || (!reducedMotion && (time + 0.8) % 4.3 > 4.14);

  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale}) rotate(${rotation})`}
      data-story-character="doctor"
    >
      {/* Contact Shadow on Clinic Floor under feet and tail */}
      {shadow ? <ellipse cx="10" cy="2" rx="145" ry="18" fill="#596b51" opacity="0.16" /> : null}

      {/* Main Doctor Kangaroo Rig */}
      <g transform={`translate(0 ${breath}) scale(${squashX} ${squashY})`}>
        {/* Full 2.5D Illustrated Kangaroo Doctor */}
        <g transform="translate(-155 -435)">
          <image href={doctorKangarooDataUri} width="310" height="441" />
        </g>

        {/* Expressive Eyelids for Blinking */}
        {blink ? (
          <g stroke="#483424" strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M-18 -360 Q-10 -354 -2 -360" />
            <path d="M12 -360 Q20 -354 28 -360" />
          </g>
        ) : null}

        {/* Dynamic Lip-Sync Mouth Phonemes for Doctor singing/speaking */}
        <DocMouth shape={mouth} expression={expression} progress={mouthProgress} />

        {/* Pointing/Wagging Paw when giving advice: "No more kangaroos jumping on the bed!" */}
        {pose === 'point' ? (
          <g transform={`translate(82 -214) rotate(${-10 + adviceWag})`}>
            {/* Soft kangaroo advisory pointing paw extending forward */}
            <path d="M-2 -2 L20 -18" stroke="#d99354" strokeWidth="6.5" strokeLinecap="round" />
            <circle cx="20" cy="-18" r="3.5" fill="#c47e40" />
            <ellipse cx="6" cy="-6" rx="8" ry="10" fill="#d99354" />
          </g>
        ) : null}
      </g>
    </g>
  );
});
