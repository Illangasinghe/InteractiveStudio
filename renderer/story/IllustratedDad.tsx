import { memo } from 'react';
import type { MouthCue } from '../../packages/core/index';
import { daddyKangarooDataUri, daddyKangarooPhoneDataUri, daddyKangarooSurprisedDataUri } from './assets/storyAssets';

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
  const dadUri = isSurprisedPose
    ? daddyKangarooSurprisedDataUri
    : isPhonePose
      ? daddyKangarooPhoneDataUri
      : daddyKangarooDataUri;

  // Subtle natural head nod/lip-sync when speaking on the phone or singing
  const isSpeaking = mouth !== 'X' && mouth !== 'A';
  const talkBob = isSpeaking && !reducedMotion ? Math.sin(time * 12) * 1.8 : 0;

  // Surprised pose width/transform alignment (registered to identical feet ground contact)
  const imageWidth = isSurprisedPose ? 367 : 300;
  const imageHeight = isSurprisedPose ? 475 : isPhonePose ? 472 : 475;
  const imageTranslateX = isSurprisedPose ? -197 : -172;

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
