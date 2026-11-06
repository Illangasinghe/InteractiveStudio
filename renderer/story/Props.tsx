import { memo } from 'react';
import { Sparkle } from './Puppets';

/**
 * Vintage brass and polished walnut wooden ceiling fan for the children's storybook bedroom.
 */
export const CeilingFan = memo(function CeilingFan({
  x = 960,
  y = 110,
  wobble = 0,
  isDamaged = false,
}: {
  x?: number;
  y?: number;
  wobble?: number;
  isDamaged?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${wobble})`} data-prop="ceiling-fan">
      {/* Brass downrod and ceiling rose */}
      <line x1="0" y1="-80" x2="0" y2="0" stroke="#7a623f" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="0" cy="-80" rx="28" ry="12" fill="#a48658" />

      {/* Brass motor housing with antique patina */}
      <ellipse cx="0" cy="0" rx="38" ry="17" fill="#bfa16f" stroke="#7a623f" strokeWidth="3" />
      <ellipse cx="0" cy="10" rx="28" ry="12" fill="#8c6f43" />

      {/* 4 Polished walnut wooden blades */}
      <g opacity="0.95">
        {/* Left blade */}
        <path
          d="M-34 0 L-260 -18 C-280 -18 -280 18 -260 18 L-34 8 Z"
          fill="#694025"
          stroke="#4a2c17"
          strokeWidth="2.5"
        />
        <line x1="-40" y1="0" x2="-250" y2="0" stroke="#875330" strokeWidth="2" strokeDasharray="6 8" />

        {/* Right blade - noticeably tilted and rattling if damaged */}
        <path
          d={
            isDamaged
              ? 'M34 0 L255 -42 C275 -44 280 -10 258 0 L34 8 Z'
              : 'M34 0 L260 -18 C280 -18 280 18 260 18 L34 8 Z'
          }
          fill="#694025"
          stroke="#4a2c17"
          strokeWidth="2.5"
        />
        <line
          x1="40"
          y1="0"
          x2="250"
          y2={isDamaged ? '-18' : '0'}
          stroke="#875330"
          strokeWidth="2"
          strokeDasharray="6 8"
        />

        {/* Front blade */}
        <path d="M-6 14 L-14 115 C-14 130 14 130 14 115 L6 14 Z" fill="#58351e" stroke="#4a2c17" strokeWidth="2" />

        {/* Back blade */}
        <path d="M-5 -12 L-12 -80 C-12 -92 12 -92 12 -80 L5 -12 Z" fill="#4b2c17" opacity="0.75" />
      </g>

      {/* Center brass finial cap */}
      <circle cx="0" cy="4" r="14" fill="#d4b57d" stroke="#7a623f" strokeWidth="2.5" />

      {/* Dangling pull chain swaying with momentum */}
      <path
        d={`M8 12 Q${8 + wobble * 1.5} 45 ${8 + wobble * 2.5} 70`}
        stroke="#a48658"
        strokeWidth="2"
        strokeDasharray="2 3"
        fill="none"
      />
      <circle cx={8 + wobble * 2.5} cy="73" r="4" fill="#bfa16f" />

      {/* Comic impact stars when fan is struck */}
      {isDamaged ? (
        <>
          <Sparkle x={180} y={-25} scale={0.8} />
          <Sparkle x={240} y={-50} scale={0.9} />
          <Sparkle x={130} y={-10} scale={0.65} />
        </>
      ) : null}
    </g>
  );
});

/**
 * Classic painted red wooden toy airplane tossed during Verse 3.
 */
export const ToyAirplane = memo(function ToyAirplane({
  x,
  y,
  rotation = 0,
  scale = 1,
}: {
  x: number;
  y: number;
  rotation?: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rotation})`} data-prop="toy-airplane">
      {/* Drop shadow */}
      <ellipse cx="-2" cy="12" rx="24" ry="6" fill="#4a3b2c" opacity="0.2" />

      {/* Red painted wooden fuselage */}
      <path
        d="M-28 -4 C-36 -4 -44 -2 -48 0 C-44 2 -36 4 -28 4 L22 3 C28 2 34 0 34 -1 C34 -2 28 -4 22 -3 Z"
        fill="#c84d3e"
        stroke="#8e2b20"
        strokeWidth="2"
      />

      {/* Top and bottom biplane wings */}
      <rect x="-8" y="-32" width="18" height="64" rx="6" fill="#e9be65" stroke="#a47828" strokeWidth="2" />
      <line x1="1" y1="-30" x2="1" y2="30" stroke="#f6dc88" strokeWidth="1.5" />

      {/* Yellow tail fin */}
      <path d="M-44 -18 L-34 -18 L-38 0 L-46 0 Z" fill="#e9be65" stroke="#a47828" strokeWidth="1.5" />

      {/* Front spinning propeller */}
      <ellipse cx="35" cy="-0.5" rx="2.5" ry="14" fill="#537b8d" opacity="0.85" />
      <circle cx="35" cy="-0.5" r="3.5" fill="#324954" />
    </g>
  );
});

/**
 * Watercolor splash and soaked quilt puddle for Verse 2 cannonball.
 */
export const BedspreadWaterSplash = memo(function BedspreadWaterSplash({
  x = 920,
  y = 780,
  progress = 0,
}: {
  x?: number;
  y?: number;
  progress: number;
}) {
  const p = Math.max(0, Math.min(1, progress));
  const spreadScale = Math.min(1, p * 2.5);
  const dropFly = Math.sin(p * Math.PI);

  return (
    <g data-prop="water-splash">
      {/* Dark soggy water puddle spreading across quilt */}
      <ellipse cx={x} cy={y + 6} rx={160 * spreadScale} ry={48 * spreadScale} fill="#4b7899" opacity={0.38} />
      <ellipse cx={x - 25} cy={y + 2} rx={110 * spreadScale} ry={32 * spreadScale} fill="#355e7c" opacity={0.25} />

      {/* Flying splash droplets (peaks during early impact) */}
      {dropFly > 0.08 ? (
        <g opacity={dropFly}>
          {/* Main water crown */}
          <path
            d={`M${x - 85} ${y} C${x - 120 - dropFly * 45} ${y - 85 * dropFly} ${x - 55} ${y - 125 * dropFly} ${x} ${y - 55 * dropFly} C${x + 55} ${y - 125 * dropFly} ${x + 120 + dropFly * 45} ${y - 85 * dropFly} ${x + 85} ${y} Z`}
            fill="#7fa8c7"
            opacity="0.65"
          />
          {/* Soft white water highlights */}
          <path
            d={`M${x - 55} ${y} Q${x - 75 - dropFly * 20} ${y - 75 * dropFly} ${x} ${y - 32 * dropFly} Q${x + 75 + dropFly * 20} ${y - 75 * dropFly} ${x + 55} ${y} Z`}
            fill="#d2e8f5"
            opacity="0.8"
          />
          {/* Arcing droplets flying outward */}
          <circle cx={x - 135 - dropFly * 65} cy={y - 75 * dropFly} r={6.5 * dropFly} fill="#629cc4" />
          <circle cx={x + 135 + dropFly * 65} cy={y - 85 * dropFly} r={7.5 * dropFly} fill="#629cc4" />
          <circle cx={x - 70 - dropFly * 35} cy={y - 140 * dropFly} r={5.5 * dropFly} fill="#7cb3d9" />
          <circle cx={x + 60 + dropFly * 40} cy={y - 150 * dropFly} r={6.5 * dropFly} fill="#7cb3d9" />
          <circle cx={x} cy={y - 170 * dropFly} r={5 * dropFly} fill="#a4d2f0" />
        </g>
      ) : null}

      {/* Spilled vintage ceramic water mug on bedside table */}
      <g transform={`translate(${x + 280} ${y - 18}) rotate(75)`} opacity="0.95">
        <path
          d="M-12 -25 C-18 -10 -22 15 -18 28 C-8 32 8 32 18 28 C22 15 18 -10 12 -25 Z"
          fill="#d9e5dc"
          stroke="#8fa89b"
          strokeWidth="2.5"
        />
        <path d="M14 -12 C24 -10 26 12 16 18" stroke="#8fa89b" strokeWidth="3" fill="none" />
      </g>
    </g>
  );
});

/**
 * Rosy glowing nose sparkle effect for Verse 1 bumped nose.
 */
export const BumpedNoseEffect = memo(function BumpedNoseEffect({
  x,
  y,
  progress = 0,
}: {
  x: number;
  y: number;
  progress?: number;
}) {
  const pulse = Math.sin(progress * 15) * 0.2 + 0.8;
  return (
    <g transform={`translate(${x} ${y})`} data-prop="bumped-nose">
      {/* Soft glowing rosy red circle on the nose */}
      <circle cx="0" cy="0" r={10 * pulse} fill="#f44336" opacity="0.65" />
      <circle cx="0" cy="0" r={6 * pulse} fill="#e53935" opacity="0.9" />
      <circle cx="-2" cy="-2" r="2.5" fill="#ffffff" opacity="0.8" />

      {/* Cute comic stars around the nose */}
      <Sparkle x={-20} y={-18} scale={0.65 * pulse} />
      <Sparkle x={20} y={-14} scale={0.6 * pulse} />
      <Sparkle x={0} y={-26} scale={0.75 * pulse} />
    </g>
  );
});

/**
 * Fluttering garden butterfly for the cat on the lawn.
 */
export const GardenButterfly = memo(function GardenButterfly({
  x,
  y,
  time = 0,
  color = '#f8df72',
}: {
  x: number;
  y: number;
  time?: number;
  color?: string;
}) {
  const flap = Math.sin(time * 16);
  return (
    <g transform={`translate(${x} ${y}) scale(0.85)`} data-prop="garden-butterfly">
      {/* Left wing */}
      <ellipse
        cx="-7"
        cy="-5"
        rx={7 * Math.abs(flap)}
        ry="11"
        fill={color}
        stroke="#b8933b"
        strokeWidth="1.2"
        transform="rotate(-20)"
      />
      {/* Right wing */}
      <ellipse
        cx="7"
        cy="-5"
        rx={7 * Math.abs(flap)}
        ry="11"
        fill={color}
        stroke="#b8933b"
        strokeWidth="1.2"
        transform="rotate(20)"
      />
      {/* Butterfly body */}
      <line x1="0" y1="-10" x2="0" y2="8" stroke="#3e2a1d" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
});
