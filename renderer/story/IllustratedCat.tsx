import { memo } from 'react';
import { sleepingCatDataUri } from './assets/storyAssets';

export const IllustratedCat = memo(function IllustratedCat({
  x,
  y,
  scale = 1,
  startled = false,
  time = 0,
  reducedMotion = false,
}: {
  x: number;
  y: number;
  scale?: number;
  startled?: boolean;
  time?: number;
  reducedMotion?: boolean;
}) {
  // Gentle breathing when asleep, startled hop when startled
  const breath = reducedMotion ? 0 : startled ? Math.sin(time * 14) * 4 : Math.sin(time * 2.2) * 1.5;
  const startleSquashY = startled && !reducedMotion ? 1 + Math.sin(time * 12) * 0.05 : 1;
  const startleSquashX = 2 - startleSquashY;

  return (
    <g
      transform={`translate(${x} ${y + (startled ? -breath : breath)}) scale(${scale * startleSquashX} ${scale * startleSquashY})`}
      data-story-actor="cat"
    >
      {/* Contact shadow on floor under the round braided rug */}
      <ellipse cx="0" cy="2" rx="105" ry="18" fill="#596b51" opacity="0.18" />

      {/* 2.5D Illustrated Sleeping Kitten on Teal Braided Rug */}
      <g transform="translate(-115 -168)">
        <image href={sleepingCatDataUri} width="230" height="192" />
      </g>

      {/* Expressive alert eyes when startled in reaction cut */}
      {startled ? (
        <g transform="translate(-32 -76)">
          <ellipse cx="-13" cy="0" rx="5" ry="7.5" fill="#2d1c10" />
          <ellipse cx="9" cy="0" rx="5" ry="7.5" fill="#2d1c10" />
          <circle cx="-14" cy="-2.5" r="2" fill="#ffffff" />
          <circle cx="8" cy="-2.5" r="2" fill="#ffffff" />
          <circle cx="-11" cy="2" r="1.2" fill="#ffffff" opacity="0.6" />
          <circle cx="11" cy="2" r="1.2" fill="#ffffff" opacity="0.6" />
        </g>
      ) : null}
    </g>
  );
});

