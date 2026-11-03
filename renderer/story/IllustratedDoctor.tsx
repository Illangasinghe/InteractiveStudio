import { memo } from 'react';
import type { MouthCue } from '../../packages/core/index';
import { doctorKangarooDataUri, doctorKangarooAdviceDataUri } from './assets/storyAssets';

type MouthShape = MouthCue['value'];
type Pose = 'idle' | 'surprised' | 'phone' | 'point' | 'wave' | 'bounce' | 'leap' | 'sleep' | 'moonwalk' | 'carry';
type Expression = 'happy' | 'surprised' | 'sleepy' | 'thoughtful';

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
  const isAdvicePose = pose === 'point';
  const docUri = isAdvicePose ? doctorKangarooAdviceDataUri : doctorKangarooDataUri;

  // Gentle advisory gesture sway when wagging finger
  const adviceWag = isAdvicePose && !reducedMotion ? Math.sin(time * 5.5) * 2.2 : 0;

  // Subtle natural lip-sync nod when giving advice or on the call
  const isSpeaking = mouth !== 'X' && mouth !== 'A';
  const talkBob = isSpeaking && !reducedMotion ? Math.sin(time * 12) * 1.5 : 0;

  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale}) rotate(${rotation + adviceWag})`}
      data-story-character="doctor"
    >
      {/* Contact Shadow on Clinic Floor under feet and tail */}
      {shadow ? <ellipse cx="10" cy="2" rx="145" ry="18" fill="#596b51" opacity="0.16" /> : null}

      {/* Main Doctor Kangaroo Rig */}
      <g transform={`translate(0 ${breath + talkBob}) scale(${squashX} ${squashY})`}>
        {/* Full 2.5D Illustrated Kangaroo Doctor */}
        <g transform={isAdvicePose ? "translate(-145 -435)" : "translate(-155 -435)"}>
          <image href={docUri} width={isAdvicePose ? 285 : 310} height={441} />
        </g>
      </g>
    </g>
  );
});
