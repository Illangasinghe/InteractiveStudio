import { memo } from 'react';
import { storybookBedroomDataUri, storybookClinicDataUri } from './assets/storyAssets';

/** Warm, softly-textured children's storybook bedroom interior */
export const StoryBedroomSet = memo(function StoryBedroomSet() {
  return (
    <g data-set="storybook-bedroom">
      <image href={storybookBedroomDataUri} width="1920" height="1080" preserveAspectRatio="none" />
    </g>
  );
});

export const StoryBedForeground = memo(function StoryBedForeground() {
  return <g data-set="storybook-bed-foreground" />;
});

/** Friendly pediatric animal clinic room in soft watercolor storybook style */
export const StoryClinicSet = memo(function StoryClinicSet() {
  return (
    <g data-set="storybook-clinic">
      <image href={storybookClinicDataUri} width="1920" height="1080" preserveAspectRatio="none" />
    </g>
  );
});

export function RestIllustration({ x, y, scale = 1, kind = 'bed' }: { x: number; y: number; scale?: number; kind?: 'bed' | 'tooth' | 'paw' }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x="-148" y="-127" width="296" height="254" rx="37" fill="#fffbef" stroke="#c9d8c9" strokeWidth="7" />
    {kind === 'bed' ? <g><path d="M-99 46 V-35 M99 46 V-35 M-99 20 H99" stroke="#9cbaab" strokeWidth="12" fill="none" strokeLinecap="round" /><path d="M-95-19 H95 V17 H-95Z" fill="#c6bbd3" /><rect x="-91" y="-34" width="67" height="21" rx="9" fill="#e7e2cf" /><path d="M55-91 A38 38 0 1 0 87-39 A33 33 0 0 1 55-91Z" fill="#e5c57e" /><path d="M-55-86 L-50-75-38-72-49-65-53-52-59-65-72-70-60-75Z" fill="#b4c9b4" /></g> : kind === 'tooth' ? <path d="M-61-73 Q-13-98 0-71 Q21-100 61-73 Q87-53 68-8 L34 75 Q23 99 12 50 L0 21-12 50 Q-24 98-35 74 L-68-8 Q-88-53-61-73Z" fill="#edf1e8" stroke="#a8c0b1" strokeWidth="7" /> : <g fill="#b7cdb8"><ellipse cy="41" rx="63" ry="49" /><ellipse cx="-73" cy="-22" rx="24" ry="32" transform="rotate(-22 -73 -22)" /><ellipse cx="-26" cy="-67" rx="25" ry="33" /><ellipse cx="29" cy="-67" rx="25" ry="33" /><ellipse cx="76" cy="-22" rx="24" ry="32" transform="rotate(22 76 -22)" /></g>}
  </g>;
}
