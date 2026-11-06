import { memo } from 'react';
import type { MouthCue } from '../../packages/core/index';
import type { StoryActorId } from './types';
import {
  doctorKangarooDataUri,
  doctorKangarooAdviceDataUri,
  vetKangarooDataUri,
  handymanKangarooDataUri,
  laundryKangarooDataUri,
  dentistKangarooDataUri,
  mommyKangarooDataUri,
} from './assets/storyAssets';

type MouthShape = MouthCue['value'];
type Pose = 'idle' | 'surprised' | 'phone' | 'point' | 'wave' | 'bounce' | 'leap' | 'sleep' | 'moonwalk' | 'carry';
type Expression = 'happy' | 'surprised' | 'sleepy' | 'thoughtful';

export const IllustratedDoctor = memo(function IllustratedDoctor({
  actor = 'doctor',
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
  actor?: Exclude<StoryActorId, 'cat' | 'dad'>;
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

  // Gentle advisory gesture sway when wagging finger
  const adviceWag = isAdvicePose && !reducedMotion ? Math.sin(time * 5.5) * 2.2 : 0;
  // Cheerful wave sway for finale
  const waveSway = pose === 'wave' && !reducedMotion ? Math.sin(time * 4) * 3 : 0;

  // Subtle natural lip-sync nod when giving advice or on the call
  const isSpeaking = mouth !== 'X' && mouth !== 'A';
  const talkBob = isSpeaking && !reducedMotion ? Math.sin(time * 12) * 1.5 : 0;

  let docUri = doctorKangarooDataUri;
  let imageWidth = 252;
  let imageHeight = 441;
  let translateX = -126;

  if (actor === 'vet') {
    docUri = vetKangarooDataUri;
    imageWidth = 230;
    imageHeight = 441;
    translateX = -115;
  } else if (actor === 'handyman') {
    docUri = handymanKangarooDataUri;
    imageWidth = 216;
    imageHeight = 441;
    translateX = -108;
  } else if (actor === 'laundry') {
    docUri = laundryKangarooDataUri;
    imageWidth = 201;
    imageHeight = 441;
    translateX = -100;
  } else if (actor === 'dentist') {
    docUri = dentistKangarooDataUri;
    imageWidth = 206;
    imageHeight = 441;
    translateX = -103;
  } else if (actor === 'mum') {
    docUri = mommyKangarooDataUri;
    imageWidth = 231;
    imageHeight = 441;
    translateX = -115;
  } else {
    // doctor
    if (isAdvicePose) {
      docUri = doctorKangarooAdviceDataUri;
      imageWidth = 269;
      imageHeight = 441;
      translateX = -135;
    } else {
      docUri = doctorKangarooDataUri;
      imageWidth = 252;
      imageHeight = 441;
      translateX = -126;
    }
  }

  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale}) rotate(${rotation + adviceWag + waveSway})`}
      data-story-character={actor}
    >
      {/* Contact Shadow on Clinic/Garden Floor under feet and tail */}
      {shadow ? <ellipse cx="10" cy="2" rx="145" ry="18" fill="#596b51" opacity="0.16" /> : null}

      {/* Main Kangaroo Rig */}
      <g transform={`translate(0 ${breath + talkBob}) scale(${squashX} ${squashY})`}>
        {/* Full 2.5D Illustrated Kangaroo Character */}
        <g transform={`translate(${translateX} -435)`}>
          <image href={docUri} width={imageWidth} height={imageHeight} />
        </g>
      </g>
    </g>
  );
});
