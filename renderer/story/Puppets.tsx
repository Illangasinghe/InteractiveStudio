import type { MouthCue } from '../../packages/core/index';
import type { StoryActorId } from './types';

type MouthShape = MouthCue['value'];
type Pose = 'idle' | 'bounce' | 'leap' | 'wave' | 'surprised' | 'phone' | 'point' | 'sleep' | 'moonwalk' | 'carry';
type Expression = 'happy' | 'surprised' | 'sleepy' | 'thoughtful';

const COATS = ['#bd7b55', '#cb9468', '#b98969', '#c48b61', '#aa7659'];
const CLOTHES: Record<Exclude<StoryActorId, 'cat'>, string> = { dad: '#628e87', mum: '#b19db9', doctor: '#faf7ec', vet: '#b7ceaf', handyman: '#d0a260', laundry: '#8daebe', dentist: '#faf7ec' };

/** Soft pastel bedtime pajamas for the 5 child kangaroos — giving distinct identity without harsh black ink */
const ROO_PAJAMAS = [
  { fill: '#f6b59e', trim: '#fff2ec', seam: '#e0987f', sleeve: '#f6b59e', cuff: '#fff2ec' },  // Roo 1: Soft peach
  { fill: '#a4d2e4', trim: '#f0f8fc', seam: '#81b6cb', sleeve: '#a4d2e4', cuff: '#f0f8fc' },  // Roo 2: Baby sky blue
  { fill: '#f6dc88', trim: '#fdfceb', seam: '#d9ba58', sleeve: '#f6dc88', cuff: '#fdfceb' },  // Roo 3: Warm buttercup
  { fill: '#aee0be', trim: '#f0f9f3', seam: '#82c295', sleeve: '#aee0be', cuff: '#f0f9f3' },  // Roo 4: Soft mint
  { fill: '#d4c2ea', trim: '#f8f4fd', seam: '#a88ec5', sleeve: '#d4c2ea', cuff: '#f8f4fd' },  // Roo 5: Soft lavender
];

function ChildPajamas({ index }: { index: number }) {
  const pj = ROO_PAJAMAS[index % ROO_PAJAMAS.length];
  return (
    <g data-part="child-pajamas">
      {/* Pajama shirt body — curves with kangaroo chest and hips */}
      <path
        d="M-42 6 C-48 42 -42 85 -22 102 Q0 114 22 102 C42 85 48 42 42 6 Q20 -10 -42 6Z"
        fill={pj.fill}
      />
      {/* Ambient shadow at hem */}
      <path d="M-22 102 Q0 114 22 102 C18 107 0 118 -22 102Z" fill="rgba(0,0,0,0.12)" />
      {/* Cute Peter Pan collar */}
      <path d="M-18 4 Q0 20 18 4" fill={pj.trim} stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
      {/* Center seam */}
      <path d="M0 18 V92" stroke={pj.seam} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 4" opacity="0.75" />
      {/* Sweet buttons */}
      <circle cx="0" cy="38" r="3.2" fill="#ffffff" />
      <circle cx="0" cy="38" r="3.2" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      <circle cx="0" cy="62" r="3.2" fill="#ffffff" />
      <circle cx="0" cy="62" r="3.2" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      {/* Small chest pocket */}
      <path d="M14 44 H26 V55 Q20 61 14 55 Z" fill={pj.trim} opacity="0.9" />
    </g>
  );
}

function Mouth({ shape, expression, progress = 0.5 }: { shape: MouthShape; expression: Expression; progress?: number }) {
  if (expression === 'surprised') return <ellipse cy="26" rx="12" ry="17" fill="#6f3d35" />;
  if (shape === 'X' || shape === 'A') return <path d="M-15 20 Q0 31 15 20" fill="none" stroke="#704331" strokeWidth="5" strokeLinecap="round" />;
  const openEnvelope = 0.72 + 0.28 * Math.sin(Math.max(0, Math.min(1, progress)) * Math.PI);
  const baseHeight = shape === 'D' || shape === 'E' ? 23 : shape === 'B' ? 9 : 16;
  const baseWidth = shape === 'F' || shape === 'H' ? 10 : 19;
  const height = Math.max(5, baseHeight * openEnvelope);
  const width = Math.max(8, baseWidth * (0.85 + 0.15 * openEnvelope));
  return <g><ellipse cy="26" rx={width} ry={height} fill="#6f3d35" />{height > 11 ? <ellipse cy={26 + height * 0.55} rx={width * 0.65} ry={height * 0.3} fill="#de8e8a" /> : null}{shape === 'B' || shape === 'G' ? <path d={`M${-width + 3} 21 H${width - 3}`} stroke="#fff8e9" strokeWidth="5" /> : null}</g>;
}

function Outfit({ actor }: { actor: Exclude<StoryActorId, 'cat'> }) {
  const coat = CLOTHES[actor];
  return <g>
    <path d="M-50-24 Q0-42 50-24 L69 103 Q0 140-69 103Z" fill={coat} />
    {/* Soft inner shadow on coat hem */}
    <path d="M-69 103 Q0 140 69 103 C60 112 0 148 -69 103Z" fill="rgba(0,0,0,0.12)" />
    <path d="M-22-30 L0-5 L22-30 M0-5 V122" stroke={actor === 'dad' ? '#dbe7d6' : '#ced8cf'} strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M-47 55 h27 v29 h-27Z M20 55 h27 v29 h-27Z" fill="none" stroke="#486d65" strokeOpacity="0.45" strokeWidth="3" />
    {actor === 'dad' ? <g fill="#e6d8b6"><circle cy="28" r="4" /><circle cy="54" r="4" /><circle cy="80" r="4" /></g> : null}
    {actor === 'mum' ? <path d="M-30-40 Q0-8 28-40 L19-8 2 7-12-9Z" fill="#e5bf9b" /> : null}
    {actor === 'doctor' || actor === 'vet' || actor === 'dentist' ? <g><path d="M-28-32 Q-47 29-26 43 Q0 58 26 43 Q47 29 28-32" fill="none" stroke="#638a86" strokeWidth="5" /><circle cx="26" cy="43" r="10" fill="#8da9a4" stroke="#5a7e77" strokeWidth="4" /><rect x="-47" y="-7" width="25" height="24" rx="4" fill="#d8e8df" />{actor === 'vet' ? <g fill="#69927e"><ellipse cx="-34" cy="6" rx="5" ry="4" /><circle cx="-40" cy="0" r="2" /><circle cx="-34" cy="-2" r="2" /><circle cx="-28" cy="0" r="2" /></g> : <path d="M-34-1 V11 M-40 5 H-28" stroke="#69928d" strokeWidth="4" />}</g> : null}
    {actor === 'handyman' ? <g><path d="M-38-40 L-28 95 M38-40 L28 95" stroke="#8d8d72" strokeWidth="17" /><path d="M-48 81 H48 V110 H-48Z" fill="#9b7953" /><rect x="-8" y="83" width="16" height="22" rx="3" fill="#d9b578" /></g> : null}
    {actor === 'laundry' ? <path d="M-34-33 H34 L50 112 H-50Z" fill="#dce5d9" /> : null}
  </g>;
}

/** Feet anchored at x/y. The child palette matches the original simple rig. */
export function RooPuppet({ id = 'roo-1', x, y, scale = 1, time = 0, pose = 'idle', expression = 'happy', mouth = 'X', mouthProgress = 0.5, reducedMotion = false, rotation = 0, flip = false, actor, shadow = true, squashX = 1, squashY = 1 }: {
  id?: string; x: number; y: number; scale?: number; time?: number; pose?: Pose; expression?: Expression;
  mouth?: MouthShape; mouthProgress?: number; reducedMotion?: boolean; rotation?: number; flip?: boolean; actor?: Exclude<StoryActorId, 'cat'>; shadow?: boolean; squashX?: number; squashY?: number;
}) {
  const index = Math.max(0, Number(id.split('-')[1] ?? 1) - 1);
  const phase = time * Math.PI * 2.5 + index * 0.6;
  const sinPhase = Math.sin(phase);
  const absSin = Math.abs(sinPhase);
  const bounce = reducedMotion ? 0 : pose === 'bounce' ? -absSin * 54 : pose === 'moonwalk' ? sinPhase * 4 : Math.sin(time * 1.6 + index) * 2.5;
  const bounceSquashY = reducedMotion ? 1 : pose === 'bounce' ? (absSin < 0.22 ? 0.92 + (absSin / 0.22) * 0.08 : 1 + (absSin - 0.22) * 0.065) : 1 + Math.sin(time * 1.6 + index) * 0.012;
  const bounceSquashX = reducedMotion ? 1 : 2 - bounceSquashY;
  const finalSquashX = squashX * bounceSquashX;
  const finalSquashY = squashY * bounceSquashY;
  const tilt = reducedMotion ? 0 : pose === 'bounce' ? sinPhase * 4.5 : pose === 'moonwalk' ? -9 : Math.sin(time * 0.9 + index) * 0.8;
  const tailSwing = reducedMotion ? 0 : pose === 'bounce' ? Math.cos(phase - 0.5) * 11 : pose === 'leap' ? -18 : Math.sin(time * 2 + index) * 4;
  const earLag = reducedMotion ? 0 : pose === 'bounce' ? Math.cos(phase - 0.35) * 6 : pose === 'leap' ? -12 : Math.sin(time * 1.8 + index) * 2;
  const leftArm = pose === 'leap' || pose === 'surprised' ? 142 : pose === 'carry' ? -20 : pose === 'bounce' && !reducedMotion ? -12 - absSin * 18 : 0;
  const rightArm = pose === 'leap' || pose === 'surprised' ? -142 : pose === 'phone' ? -115 : pose === 'point' ? -106 : pose === 'wave' ? -130 + (reducedMotion ? 0 : Math.sin(time * 5) * 14) : pose === 'carry' ? 20 : pose === 'bounce' && !reducedMotion ? 12 + absSin * 18 : 0;
  const coat = actor === 'dad' ? '#ad7d59' : actor === 'mum' ? '#bb8c6e' : actor ? '#bda082' : COATS[index % COATS.length];
  
  // Sleeves & cuffs
  const pj = !actor ? ROO_PAJAMAS[index % ROO_PAJAMAS.length] : null;
  const sleeves = actor ? CLOTHES[actor] : pj ? pj.sleeve : coat;
  const cuffColor = actor === 'dad' ? '#527c75' : pj ? pj.cuff : 'rgba(255,255,255,0.4)';
  const paleSleeves = actor === 'doctor' || actor === 'dentist' || actor === 'vet';
  
  const sleeping = expression === 'sleepy' || pose === 'sleep';
  const blink = sleeping || (!reducedMotion && (time + index * 0.47) % 4.2 > 4.04);
  const shadowScale = reducedMotion ? 1 : Math.max(0.55, 1 + bounce / 130);
  const shadowOpacity = reducedMotion ? 0.12 : Math.max(0.05, 0.14 + bounce / 600);

  return <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale}) rotate(${rotation})`} data-story-character={actor ?? id}>
    {shadow ? <ellipse cx="15" cy="2" rx={96 * shadowScale} ry={14 * shadowScale} fill="#596b51" opacity={shadowOpacity} /> : null}
    <g transform={`translate(0 ${-155 + bounce}) rotate(${tilt}) scale(${finalSquashX} ${finalSquashY})`}>
      
      {/* 1. Organic Tapering Kangaroo Tail with 2.5D Depth Shadow */}
      <g transform={`rotate(${tailSwing} 36 98)`}>
        {/* Tail base shadow */}
        <path d="M30 92 C80 98 126 116 166 142 C172 146 168 152 158 152 C116 152 72 142 24 122 Z" fill="rgba(0,0,0,0.14)" />
        {/* Tail main body */}
        <path d="M32 90 C80 96 126 114 165 139 C170 143 167 149 157 149 C116 149 72 140 24 120 Z" fill={coat} />
        {/* Tail top subtle highlight */}
        <path d="M42 95 C82 102 120 118 152 140" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* 2. Kangaroo Hind Feet with Contoured Soles and Soft Toe Notches */}
      <ellipse cx="-46" cy="154" rx="46" ry="7" fill="rgba(0,0,0,0.12)" />
      <ellipse cx="46" cy="154" rx="46" ry="7" fill="rgba(0,0,0,0.12)" />
      <g transform="rotate(-5 -46 144)">
        <path d="M-92 142 C-92 133 -65 131 -42 132 C-16 133 0 137 0 147 C0 155 -18 156 -48 155 C-78 154 -92 151 -92 142 Z" fill={coat} />
        <ellipse cx="-44" cy="143" rx="36" ry="7" fill="rgba(255,255,255,0.12)" />
        <path d="M-18 136 Q-16 145 -20 152 M-34 134 Q-32 145 -36 153" stroke="rgba(0,0,0,0.15)" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g transform="rotate(6 46 144)">
        <path d="M92 142 C92 133 65 131 42 132 C16 133 0 137 0 147 C0 155 18 156 48 155 C78 154 92 151 92 142 Z" fill={coat} />
        <ellipse cx="44" cy="143" rx="36" ry="7" fill="rgba(255,255,255,0.12)" />
        <path d="M18 136 Q16 145 20 152 M34 134 Q32 145 36 153" stroke="rgba(0,0,0,0.15)" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* 3. Kangaroo Torso with Organic Sloping Neck (No horizontal shoulder cuts) */}
      <path d="M-28-66 Q-38-42 -52-20 C-94 20 -86 108 -40 132 Q0 156 45 129 C91 95 86 20 52-20 Q38-42 28-66 Z" fill={coat} />

      {/* Belly pouch or soft underbelly */}
      <ellipse cy="65" rx="43" ry="60" fill="#efd0ac" />
      <path d="M-33 67 Q0 85 34 67 Q31 106 0 111 Q-29 105-33 67Z" fill="#e5b58b" />

      {/* Outfits: Pajamas for children, specialized attire for adults */}
      {actor ? <Outfit actor={actor} /> : <ChildPajamas index={index} />}

      {/* 4. Natural Forelimbs / Arms with Ambient Depth Shadow and Shaped Paws */}
      {/* Left Arm */}
      <g transform={`rotate(${leftArm} -46 -8)`}>
        {/* Arm ambient drop shadow behind limb */}
        <path d="M-46 -8 Q-62 18 -40 50" fill="none" stroke="rgba(40,20,10,0.18)" strokeWidth="28" strokeLinecap="round" transform="translate(1 3)" />
        {paleSleeves ? <path d="M-46 -8 Q-62 18 -40 50" fill="none" stroke="#bfd0c2" strokeWidth="28" strokeLinecap="round" /> : null}
        <path d="M-46 -8 Q-62 18 -40 50" fill="none" stroke={sleeves} strokeWidth="24" strokeLinecap="round" />
        {/* Soft arm highlight */}
        <path d="M-48 2 Q-58 20 -44 42" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="5" strokeLinecap="round" />
        {/* Sleeve cuff */}
        {(actor || pj) ? <rect x="-51" y="38" width="22" height="7" rx="3.5" fill={cuffColor} transform="rotate(18 -40 41)" /> : null}
        {/* Hand / Shaped Paw */}
        <ellipse cx="-38" cy="53" rx="13" ry="16" fill={coat} transform="rotate(18 -38 53)" />
        <ellipse cx="-37" cy="54" rx="7" ry="10" fill="#f5d7be" opacity="0.65" transform="rotate(18 -37 54)" />
        <circle cx="-43" cy="62" r="3" fill={coat} />
        <circle cx="-38" cy="65" r="3" fill={coat} />
        <circle cx="-33" cy="63" r="3" fill={coat} />
      </g>

      {/* Right Arm */}
      <g transform={`rotate(${rightArm} 46 -8)`}>
        {/* Arm ambient drop shadow behind limb */}
        <path d="M46 -8 Q62 18 40 50" fill="none" stroke="rgba(40,20,10,0.18)" strokeWidth="28" strokeLinecap="round" transform="translate(-1 3)" />
        {paleSleeves ? <path d="M46 -8 Q62 18 40 50" fill="none" stroke="#bfd0c2" strokeWidth="28" strokeLinecap="round" /> : null}
        <path d="M46 -8 Q62 18 40 50" fill="none" stroke={sleeves} strokeWidth="24" strokeLinecap="round" />
        {/* Soft arm highlight */}
        <path d="M48 2 Q58 20 44 42" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="5" strokeLinecap="round" />
        {/* Sleeve cuff */}
        {(actor || pj) ? <rect x="29" y="38" width="22" height="7" rx="3.5" fill={cuffColor} transform="rotate(-18 40 41)" /> : null}
        {/* Hand / Shaped Paw */}
        <ellipse cx="38" cy="53" rx="13" ry="16" fill={coat} transform="rotate(-18 38 53)" />
        <ellipse cx="37" cy="54" rx="7" ry="10" fill="#f5d7be" opacity="0.65" transform="rotate(-18 37 54)" />
        <circle cx="33" cy="63" r="3" fill={coat} />
        <circle cx="38" cy="65" r="3" fill={coat} />
        <circle cx="43" cy="62" r="3" fill={coat} />
      </g>

      {/* 5. Kangaroo Head with Ears, Facial Features, and Under-Chin Depth Shadow */}
      <g transform="translate(0 -79)">
        {/* Left Ear with inner pink shading */}
        <g transform={`rotate(${-earLag} -30 -60)`}>
          <path d="M-40-58 C-88-124-83-207-58-177 Q-21-133-17-66Z" fill={coat} />
          <path d="M-39-82 C-66-128-70-169-59-153 Q-38-123-29-83Z" fill="#e9b7a3" />
        </g>
        {/* Right Ear with inner pink shading */}
        <g transform={`rotate(${earLag} 30 -60)`}>
          <path d="M20-64 C19-140 55-201 64-172 Q78-108 44-57Z" fill={coat} />
          <path d="M31-84 C32-127 53-169 54-147 Q57-112 41-79Z" fill="#e9b7a3" />
        </g>

        {/* Head Silhouette */}
        <path d="M-64-44 C-58-100 59-108 66-44 Q80 16 33 39 Q0 57-41 33 Q-78 15-64-44Z" fill={coat} />

        {/* Soft Ambient Contact Shadow Under Chin (Separates Head from Chest in 2.5D) */}
        <ellipse cx="0" cy="50" rx="34" ry="11" fill="rgba(0,0,0,0.14)" />

        {/* Cream Snout & Cheeks */}
        <ellipse cy="8" rx="49" ry="35" fill="#f3d7b5" />
        <ellipse cx="-42" cy="2" rx="12" ry="7" fill="#d98c77" opacity="0.45" />
        <ellipse cx="42" cy="2" rx="12" ry="7" fill="#d98c77" opacity="0.45" />

        {/* Expressive Eyes & Brow */}
        {blink ? (
          <g stroke="#493c32" strokeWidth="5" fill="none" strokeLinecap="round">
            <path d="M-38-24 Q-29-18-20-24" />
            <path d="M20-24 Q29-18 38-24" />
          </g>
        ) : (
          <g>
            <ellipse cx="-29" cy="-26" rx={6.5} ry={expression === 'surprised' ? 12 : 10} fill="#493c32" />
            <ellipse cx="29" cy="-26" rx={6.5} ry={expression === 'surprised' ? 12 : 10} fill="#493c32" />
            <circle cx="-27" cy="-29" r="2.2" fill="#ffffff" />
            <circle cx="31" cy="-29" r="2.2" fill="#ffffff" />
          </g>
        )}
        {expression === 'surprised' || expression === 'thoughtful' ? (
          <g fill="none" stroke="#77563d" strokeWidth="5" strokeLinecap="round">
            <path d="M-42-47 Q-28-57-16-48" />
            <path d="M17-48 Q30-57 43-47" />
          </g>
        ) : null}

        {/* Sweet Nose and Mouth */}
        <path d="M-10 4 Q0-3 10 4 Q9 15 0 16 Q-9 14-10 4Z" fill="#704331" />
        <Mouth shape={mouth} expression={expression} progress={mouthProgress} />
        <path d="M-18-77 Q-2-94 16-80" fill="none" stroke={coat} strokeWidth="13" strokeLinecap="round" />

        {/* Dad's Glasses */}
        {actor === 'dad' ? (
          <g fill="none" stroke="#3d5852" strokeWidth="4.5">
            <rect x="-48" y="-42" width="39" height="33" rx="12" />
            <rect x="9" y="-42" width="39" height="33" rx="12" />
            <path d="M-9-27 Q0-32 9-27 M-48-29 L-61-35 M48-29 L61-35" />
          </g>
        ) : null}

        {/* Medical Head Mirror */}
        {actor === 'doctor' || actor === 'dentist' ? (
          <g>
            <path d="M-62-63 Q0-86 62-63" fill="none" stroke="#9eaea4" strokeWidth="9" />
            <circle cx="22" cy="-74" r="20" fill="#dbe3de" stroke="#8faaa1" strokeWidth="4" />
            <circle cx="22" cy="-74" r="8" fill="#a8c0b5" />
          </g>
        ) : null}

        {/* Handyman Cap */}
        {actor === 'handyman' ? (
          <g>
            <path d="M-64-66 Q-64-117 0-117 Q64-117 64-66Z" fill="#dbb477" />
            <path d="M-74-65 H74" stroke="#bd9459" strokeWidth="12" strokeLinecap="round" />
            <path d="M0-113 V-73" stroke="#f0cb8c" strokeWidth="10" />
          </g>
        ) : null}
      </g>

      {/* Accessories: Phone, Pointer, Laundry Basket */}
      {pose === 'phone' ? (
        <g transform="translate(86 -72) rotate(-8)">
          <rect x="-19" y="-42" width="38" height="78" rx="8" fill="#384f4b" />
          <rect x="-13" y="-31" width="26" height="48" rx="3" fill="#d6e5d7" />
          <circle cy="26" r="3" fill="#a9bdb0" />
        </g>
      ) : null}
      {actor === 'handyman' && pose === 'point' ? <g transform="translate(126 -75) rotate(12)"><path d="M0 35 V-21" stroke="#9ba8a1" strokeWidth="13" strokeLinecap="round" /><path d="M-15-42 Q-28-17-3-11 Q23-12 15-42 L6-28-6-28Z" fill="#aab6af" /></g> : null}
      {actor === 'laundry' || pose === 'carry' ? <g transform="translate(0 53)"><rect x="-74" y="-4" width="148" height="24" rx="8" fill="#e8cbb4" /><rect x="-70" y="-25" width="140" height="24" rx="8" fill="#f5ecd8" /><rect x="-66" y="-46" width="132" height="24" rx="8" fill="#b7c9c1" /><path d="M-45-38 V-28 M-42-17 V-7 M-44 5 V15" stroke="#fff5e5" strokeWidth="3" /></g> : null}
    </g>
  </g>;
}

export function CatPuppet({ x, y, scale = 1, startled = false, time = 0, reducedMotion = false }: { x: number; y: number; scale?: number; startled?: boolean; time?: number; reducedMotion?: boolean }) {
  const tail = reducedMotion ? 0 : Math.sin(time * 2.5) * 9;
  return <g transform={`translate(${x} ${y}) scale(${scale})`} data-story-actor="cat">
    {/* Cozy bedroom floor cushion/rug under the cat with rich contrast against the floor */}
    <ellipse cy="12" rx="124" ry="26" fill="#3f615d" />
    <ellipse cy="11" rx="116" ry="21" fill="#527c76" />
    <ellipse cy="11" rx="108" ry="17" fill="#49706a" />
    {/* Rug stitch border */}
    <ellipse cy="11" rx="112" ry="19" fill="none" stroke="#d5e4de" strokeWidth="2.5" strokeDasharray="6 6" />

    {/* Cat tail */}
    <path d="M69-23 Q142-41 119-114 Q111-140 92-126" stroke="#c37d45" strokeWidth="25" fill="none" strokeLinecap="round" transform={`rotate(${tail} 69 -23)`} />
    <path d="M69-23 Q142-41 119-114 Q111-140 92-126" stroke="#e8a366" strokeWidth="19" fill="none" strokeLinecap="round" transform={`rotate(${tail} 69 -23)`} />

    {/* Cat body */}
    <ellipse cy="-37" rx="82" ry="52" fill="#e8a366" />
    {/* Soft back shading */}
    <path d="M-60-45 Q0-20 60-45 Q0-70 -60-45Z" fill="#cf8644" opacity="0.4" />
    {/* Paws */}
    <ellipse cx="-38" cy="-5" rx="37" ry="14" fill="#fff5e8" />
    <ellipse cx="35" cy="-5" rx="37" ry="14" fill="#fff5e8" />
    {/* Toe marks */}
    <path d="M-44-12 V-2 M-32-12 V-2 M29-12 V-2 M41-12 V-2" stroke="#dfb986" strokeWidth="2" strokeLinecap="round" />

    {/* Cat Head */}
    <g transform={`translate(-12 ${startled ? -113 : -93})`}>
      {/* Ears */}
      <path d="M-53-18 L-53-77 -12-43 M15-43 L52-77 54-18" fill="#e8a366" />
      <path d="M-44-36 L-43-63 -24-43 M28-43 L43-63 43-35" fill="#f7b7ab" />
      {/* Face */}
      <ellipse rx="65" ry="49" fill="#f2b479" />
      {/* Cream muzzle patch */}
      <ellipse cy="12" rx="36" ry="22" fill="#fff6ea" />
      {startled ? (
        <g fill="#3d2c20">
          <ellipse cx="-25" cy="-5" rx="7" ry="13" />
          <ellipse cx="25" cy="-5" rx="7" ry="13" />
          <circle cx="-23" cy="-8" r="2.5" fill="#ffffff" />
          <circle cx="27" cy="-8" r="2.5" fill="#ffffff" />
        </g>
      ) : (
        <g stroke="#5c422f" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M-36-3 Q-25 7 -15-3 M15-3 Q25 7 36-3" />
        </g>
      )}
      <path d="M-7 13 L7 13 0 21Z" fill="#d96859" />
      <path d="M0 21 Q-8 31 -17 24 M0 21 Q8 31 17 24" fill="none" stroke="#d96859" strokeWidth="2.5" strokeLinecap="round" />
      {/* Whiskers */}
      <g stroke="#a47c55" strokeWidth="2.5" strokeLinecap="round">
        <path d="M-34 17 L-75 8 M-34 26 L-76 29 M34 17 L75 8 M34 26 L76 29" />
      </g>
      {/* Forehead stripes */}
      <path d="M-14-36 L-9-22 M6-38 L7-23 M24-32 L21-20" stroke="#cf8644" strokeWidth="5" strokeLinecap="round" />
    </g>
  </g>;
}

export function Sparkle({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return <path d="M0-20 Q4-4 20 0 Q4 4 0 20 Q-4 4-20 0 Q-4-4 0-20Z" transform={`translate(${x} ${y}) scale(${scale})`} fill="#e1b66d" />;
}
