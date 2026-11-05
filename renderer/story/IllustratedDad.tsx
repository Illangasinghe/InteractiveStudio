import { memo } from 'react';
import type { MouthCue } from '../../packages/core/index';
import {
  daddyKangarooDataUri,
  daddyKangarooPhoneDataUri,
  daddyKangarooSurprisedDataUri,
  daddyKangarooIdle0DataUri,
  daddyKangarooIdle1DataUri,
  daddyKangarooIdle2DataUri,
} from './assets/storyAssets';

type MouthShape = MouthCue['value'];
type Pose = 'idle' | 'surprised' | 'phone' | 'point' | 'wave' | 'bounce' | 'leap' | 'sleep' | 'moonwalk' | 'carry';
type Expression = 'happy' | 'surprised' | 'sleepy' | 'thoughtful';

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
  const isPhonePose = pose === 'phone';
  const isSurprisedPose = pose === 'surprised';

  // Subtle natural head nod/lip-sync when speaking on the phone or singing
  const isSpeaking = mouth !== 'X' && mouth !== 'A';
  const talkBob = isSpeaking && !reducedMotion ? Math.sin(time * 12) * 1.8 : 0;

  // Frame selection: phone, surprised, or 3-pose realistic idle animation strip
  let dadUri = daddyKangarooDataUri;
  let imageWidth = 300;
  let imageHeight = 475;
  let imageTranslateX = -172;

  if (isSurprisedPose) {
    dadUri = daddyKangarooSurprisedDataUri;
    imageWidth = 367;
    imageHeight = 475;
    imageTranslateX = -197;
  } else if (isPhonePose) {
    dadUri = daddyKangarooPhoneDataUri;
    imageWidth = 300;
    imageHeight = 472;
    imageTranslateX = -172;
  } else {
    // 3-pose idle flipbook animation strip:
    // 0.0s-0.9s: frame 0 (neutral pose)
    // 0.9s-1.1s: frame 1 (natural blink & soft breath inhale)
    // 1.1s-1.6s: frame 2 (attentive nod / listening)
    // 1.6s-2.0s: frame 0 (settling back to neutral)
    const cycleTime = reducedMotion ? 0 : time % 2.0;
    if (!reducedMotion && cycleTime >= 0.9 && cycleTime < 1.1) {
      dadUri = daddyKangarooIdle1DataUri;
    } else if (!reducedMotion && cycleTime >= 1.1 && cycleTime < 1.6) {
      dadUri = daddyKangarooIdle2DataUri;
    } else {
      dadUri = daddyKangarooIdle0DataUri;
    }
    imageWidth = 312;
    imageHeight = 480;
    imageTranslateX = -178;
  }

  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale}) rotate(${rotation})`}
      data-story-character="dad"
    >
      {/* Contact Shadow under long macropod feet and tripod tail */}
      {shadow ? <ellipse cx="-15" cy="2" rx="145" ry="18" fill="#596b51" opacity="0.16" /> : null}

      {/* Main Father Kangaroo Rig */}
      <g transform={`translate(0 ${breath + talkBob}) scale(${squashX} ${squashY})`}>
        {/* Full 2.5D Illustrated Dad Kangaroo with authentic watercolor textures, glasses, and phone pose */}
        <g transform={`translate(${imageTranslateX} -468)`}>
          <image href={dadUri} width={imageWidth} height={imageHeight} />
        </g>
      </g>
    </g>
  );
});
