import { memo } from 'react';
import { catSleepDataUri, catAwakeDataUri, catStartledDataUri } from './assets/storyAssets';

export const IllustratedCat = memo(function IllustratedCat({
  x,
  y,
  scale = 1,
  startled = false,
  pose = 'sleep',
  time = 0,
  reducedMotion = false,
}: {
  x: number;
  y: number;
  scale?: number;
  startled?: boolean;
  pose?: 'sleep' | 'awake' | 'startled';
  time?: number;
  reducedMotion?: boolean;
}) {
  const effectivePose = startled ? 'startled' : pose;
  const catUri =
    effectivePose === 'startled'
      ? catStartledDataUri
      : effectivePose === 'awake'
        ? catAwakeDataUri
        : catSleepDataUri;

  // Gentle rhythmic breathing when asleep, startled spring vibration when startled
  const breath = reducedMotion ? 0 : effectivePose === 'startled' ? Math.sin(time * 14) * 3 : Math.sin(time * 2.2) * 1.5;
  const startleSquashY = effectivePose === 'startled' && !reducedMotion ? 1 + Math.sin(time * 12) * 0.04 : 1;
  const startleSquashX = 2 - startleSquashY;

  return (
    <g
      transform={`translate(${x} ${y + (effectivePose === 'startled' ? -breath : breath)}) scale(${scale * startleSquashX} ${scale * startleSquashY})`}
      data-story-actor="cat"
    >
      {/* Contact shadow on floor under the round braided rug */}
      <ellipse cx="0" cy="0" rx="100" ry="14" fill="#596b51" opacity="0.14" />

      {/* 2.5D Illustrated Kitten on Teal Braided Rug (Registered 480x560 canvas scaled to 240x280) */}
      <g transform="translate(-120 -275)">
        <image href={catUri} width="240" height="280" />
      </g>
    </g>
  );
});
