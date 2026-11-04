import type { MouthCue } from '../../packages/core/index';
import type { StoryActorId } from './types';
import {
  ROO_COLORWAYS,
  getJoeyStripFrame,
  type RooColorway,
} from './assets/joeyStripAssets';

type MouthShape = MouthCue['value'];
type Pose = 'idle' | 'bounce' | 'leap' | 'wave' | 'surprised' | 'phone' | 'point' | 'sleep' | 'moonwalk' | 'carry';
type Expression = 'happy' | 'surprised' | 'sleepy' | 'thoughtful';

function Mouth({ shape, progress = 0.5 }: { shape: MouthShape; progress?: number }) {
  if (shape === 'X' || shape === 'A') {
    // Closed resting mouth: natural illustrated smile shows cleanly
    return null;
  }
  const openEnvelope = 0.72 + 0.28 * Math.sin(Math.max(0, Math.min(1, progress)) * Math.PI);
  const baseHeight = shape === 'D' || shape === 'E' ? 7 : shape === 'B' ? 3.5 : 5;
  const baseWidth = shape === 'F' || shape === 'H' ? 5 : 7.5;
  const height = Math.max(2, baseHeight * openEnvelope);
  const width = Math.max(3.5, baseWidth * (0.85 + 0.15 * openEnvelope));
  return (
    <g transform="translate(68 -267)" opacity={0.88}>
      <ellipse cy="0" rx={width} ry={height} fill="#753c30" />
      {height > 3.5 ? <ellipse cy={height * 0.35} rx={width * 0.6} ry={height * 0.3} fill="#e59892" /> : null}
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
  // Determine colorway by joey index
  const index = Math.max(0, Number(id.split('-')[1] ?? 1) - 1);
  const colorway: RooColorway = ROO_COLORWAYS[index % ROO_COLORWAYS.length];

  // Bounce cycle calculation
  // 5 frames in bounce loop: 0: Crouch -> 1: Launch -> 2: Apex Float -> 3: Descent -> 4: Squash -> 0
  const bounceSpeed = 1.55;
  const cycleProgress = ((time * bounceSpeed + index * 0.22) % 1 + 1) % 1;

  let frameIndex = 5; // Default: Frame 5 (Upright Standing)
  let verticalBounceOffset = 0;

  if (pose === 'bounce') {
    if (reducedMotion) {
      frameIndex = 5;
    } else {
      // 5-phase bounce flipbook
      if (cycleProgress < 0.18) {
        frameIndex = 0; // Crouch anticipation on mattress
        verticalBounceOffset = 4;
      } else if (cycleProgress < 0.42) {
        frameIndex = 1; // Launch upward
        verticalBounceOffset = -8;
      } else if (cycleProgress < 0.68) {
        frameIndex = 2; // Apex float mid-air
        verticalBounceOffset = -18;
      } else if (cycleProgress < 0.88) {
        frameIndex = 3; // Descent towards mattress
        verticalBounceOffset = -6;
      } else {
        frameIndex = 4; // Impact squash on mattress
        verticalBounceOffset = 6;
      }
    }
  } else if (pose === 'leap') {
    // Airborne flight: Apex float (Frame 2) or Launch (Frame 1)
    frameIndex = 2;
  } else if (pose === 'surprised') {
    frameIndex = 2; // Starfish joyful/surprised arms
  } else if (pose === 'sleep') {
    frameIndex = 0; // Cozily crouched
  } else {
    // idle, wave, point, carry, moonwalk -> Frame 5 (Upright standing)
    frameIndex = 5;
  }

  const frameUri = getJoeyStripFrame(colorway, frameIndex);

  // Subtle natural squash/stretch & breathing
  const isBouncing = pose === 'bounce' && !reducedMotion;
  const breatheSquashY = reducedMotion ? 1 : isBouncing ? 1 : 1 + Math.sin(time * 2.2 + index) * 0.015;
  const breatheSquashX = reducedMotion ? 1 : isBouncing ? 1 : 2 - breatheSquashY;
  const finalSquashX = squashX * breatheSquashX;
  const finalSquashY = squashY * breatheSquashY;

  // Tilt during bounce
  const tilt = reducedMotion ? 0 : isBouncing ? Math.sin(time * Math.PI * 3.1 + index) * 3 : 0;

  // Contact shadow dynamics based on frame height
  const isApex = frameIndex === 2;
  const isAir = frameIndex === 1 || frameIndex === 3;
  const isSquash = frameIndex === 0 || frameIndex === 4;
  const shadowScale = reducedMotion ? 1 : isApex ? 0.65 : isAir ? 0.82 : isSquash ? 1.15 : 1.0;
  const shadowOpacity = reducedMotion ? 0.14 : isApex ? 0.08 : isAir ? 0.11 : isSquash ? 0.18 : 0.14;

  const sleeping = expression === 'sleepy' || pose === 'sleep';
  const blink = sleeping || (!reducedMotion && (time + index * 0.47) % 4.2 > 4.04);

  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale}) rotate(${rotation})`}
      data-story-character={id}
    >
      {/* Dynamic contact shadow under kangaroo feet and tail */}
      {shadow ? (
        <ellipse
          cx="0"
          cy="0"
          rx={88 * shadowScale}
          ry={13 * shadowScale}
          fill="#596b51"
          opacity={shadowOpacity}
        />
      ) : null}

      {/* Main Joey Artwork: Unified Watercolor Strip Frame */}
      <g transform={`translate(0 ${verticalBounceOffset}) rotate(${tilt}) scale(${finalSquashX} ${finalSquashY})`}>
        {/* Registered Canvas: width=280, height=560, anchor=(140, 530) so ground contact is at (0, 0) */}
        <image
          href={frameUri}
          width="280"
          height="560"
          x="-140"
          y="-530"
        />

        {/* Expressive Eyelids during blink / sleep for Frame 5 */}
        {blink && frameIndex === 5 ? (
          <g>
            {/* Soft cream lid patch covering pupil */}
            <ellipse cx="50" cy="-284" rx="7.5" ry="6" fill="#f6d3a5" />
            {/* Eyelid seam curve */}
            <path
              d="M 42 -283 Q 50 -280 58 -283"
              stroke="#493224"
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ) : null}

        {/* Phoneme Lip-Sync for Frame 5 when talking */}
        {frameIndex === 5 ? <Mouth shape={mouth} progress={mouthProgress} /> : null}
      </g>
    </g>
  );
}
