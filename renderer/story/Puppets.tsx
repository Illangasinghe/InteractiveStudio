import type { MouthCue } from '../../packages/core/index';
import type { StoryActorId } from './types';

type MouthShape = MouthCue['value'];
type Pose = 'idle' | 'bounce' | 'leap' | 'wave' | 'surprised' | 'phone' | 'point' | 'sleep' | 'moonwalk' | 'carry';
type Expression = 'happy' | 'surprised' | 'sleepy' | 'thoughtful';

const COATS = ['#bd7b55', '#d09b70', '#b98969', '#c89168', '#a87458'];
const CLOTHES: Record<Exclude<StoryActorId, 'cat'>, string> = { dad: '#6f9992', mum: '#b19db9', doctor: '#faf7ec', vet: '#b7ceaf', handyman: '#d0a260', laundry: '#8daebe', dentist: '#faf7ec' };

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
    <path d="M-52-37 Q0-59 52-37 L69 103 Q0 140-69 103Z" fill={coat} />
    <path d="M-22-44 L0-5 L22-44 M0-5 V122" stroke={actor === 'dad' ? '#dbe7d6' : '#ced8cf'} strokeWidth="5" fill="none" />
    <path d="M-47 55 h27 v29 h-27Z M20 55 h27 v29 h-27Z" fill="none" stroke="#55796f" strokeOpacity="0.4" strokeWidth="3" />
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
  const leftArm = pose === 'leap' || pose === 'surprised' ? 100 : pose === 'carry' ? -20 : pose === 'bounce' && !reducedMotion ? -15 - absSin * 22 : 0;
  const rightArm = pose === 'leap' || pose === 'surprised' ? -105 : pose === 'phone' ? -115 : pose === 'point' ? -92 : pose === 'wave' ? -120 + (reducedMotion ? 0 : Math.sin(time * 5) * 14) : pose === 'carry' ? 20 : pose === 'bounce' && !reducedMotion ? 15 + absSin * 22 : 0;
  const coat = actor === 'dad' ? '#ad7d59' : actor === 'mum' ? '#bb8c6e' : actor ? '#bda082' : COATS[index % COATS.length];
  const sleeves = actor ? CLOTHES[actor] : coat;
  const paleSleeves = actor === 'doctor' || actor === 'dentist' || actor === 'vet';
  const sleeping = expression === 'sleepy' || pose === 'sleep';
  const blink = sleeping || (!reducedMotion && (time + index * 0.47) % 4.2 > 4.04);
  const shadowScale = reducedMotion ? 1 : Math.max(0.55, 1 + bounce / 130);
  const shadowOpacity = reducedMotion ? 0.12 : Math.max(0.05, 0.14 + bounce / 600);
  return <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale}) rotate(${rotation})`} data-story-character={actor ?? id}>
    {shadow ? <ellipse cx="15" cy="2" rx={96 * shadowScale} ry={14 * shadowScale} fill="#596b51" opacity={shadowOpacity} /> : null}
    <g transform={`translate(0 ${-155 + bounce}) rotate(${tilt}) scale(${finalSquashX} ${finalSquashY})`}>
      <path d="M43 73 C107 84 109 145 165 147 C125 166 62 149 21 119Z" fill={coat} transform={`rotate(${tailSwing} 43 95)`} />
      <ellipse cx="-46" cy="144" rx="61" ry="19" fill={coat} transform="rotate(-6 -46 144)" /><ellipse cx="46" cy="145" rx="60" ry="18" fill={coat} transform="rotate(7 46 145)" />
      <path d="M-53-38 C-98 20-87 109-40 132 Q0 156 45 129 C91 93 84 14 51-38Z" fill={coat} />
      <ellipse cy="65" rx="43" ry="64" fill="#efd0ac" /><path d="M-33 67 Q0 85 34 67 Q31 106 0 111 Q-29 105-33 67Z" fill="#e5b58b" />
      {actor ? <Outfit actor={actor} /> : null}
      <g transform={`rotate(${leftArm} -51 -5)`}>{paleSleeves ? <path d="M-51-5 Q-88 15-87 52" fill="none" stroke="#bfd0c2" strokeWidth="31" strokeLinecap="round" /> : null}<path d="M-51-5 Q-88 15-87 52" fill="none" stroke={sleeves} strokeWidth="27" strokeLinecap="round" /><ellipse cx="-86" cy="56" rx="14" ry="20" fill={coat} transform="rotate(18 -86 56)" /></g>
      <g transform={`rotate(${rightArm} 54 -7)`}>{paleSleeves ? <path d="M54-7 Q91 5 99 50" fill="none" stroke="#bfd0c2" strokeWidth="31" strokeLinecap="round" /> : null}<path d="M54-7 Q91 5 99 50" fill="none" stroke={sleeves} strokeWidth="27" strokeLinecap="round" /><ellipse cx="97" cy="53" rx="14" ry="20" fill={coat} transform="rotate(-18 97 53)" /></g>
      <g transform="translate(0 -79)">
        <g transform={`rotate(${-earLag} -30 -60)`}><path d="M-40-58 C-88-124-83-207-58-177 Q-21-133-17-66Z" fill={coat} /><path d="M-39-82 C-66-128-70-169-59-153 Q-38-123-29-83Z" fill="#e9b7a3" /></g>
        <g transform={`rotate(${earLag} 30 -60)`}><path d="M20-64 C19-140 55-201 64-172 Q78-108 44-57Z" fill={coat} /><path d="M31-84 C32-127 53-169 54-147 Q57-112 41-79Z" fill="#e9b7a3" /></g>
        <path d="M-64-44 C-58-100 59-108 66-44 Q80 16 33 39 Q0 57-41 33 Q-78 15-64-44Z" fill={coat} />
        <ellipse cy="8" rx="49" ry="35" fill="#f3d7b5" /><ellipse cx="-42" cy="2" rx="12" ry="7" fill="#d98c77" opacity="0.45" /><ellipse cx="42" cy="2" rx="12" ry="7" fill="#d98c77" opacity="0.45" />
        {blink ? <g stroke="#493c32" strokeWidth="5" fill="none" strokeLinecap="round"><path d="M-38-24 Q-29-18-20-24" /><path d="M20-24 Q29-18 38-24" /></g> : <g><ellipse cx="-29" cy="-26" rx="6.5" ry={expression === 'surprised' ? 12 : 10} fill="#493c32" /><ellipse cx="29" cy="-26" rx="6.5" ry={expression === 'surprised' ? 12 : 10} fill="#493c32" /><circle cx="-27" cy="-29" r="2" fill="#fff" /><circle cx="31" cy="-29" r="2" fill="#fff" /></g>}
        {expression === 'surprised' || expression === 'thoughtful' ? <g fill="none" stroke="#77563d" strokeWidth="5" strokeLinecap="round"><path d="M-42-47 Q-28-57-16-48" /><path d="M17-48 Q30-57 43-47" /></g> : null}
        <path d="M-10 4 Q0-3 10 4 Q9 15 0 16 Q-9 14-10 4Z" fill="#704331" /><Mouth shape={mouth} expression={expression} progress={mouthProgress} />
        <path d="M-18-77 Q-2-94 16-80" fill="none" stroke={coat} strokeWidth="13" strokeLinecap="round" />
        {actor === 'dad' ? <g fill="none" stroke="#526c65" strokeWidth="4"><rect x="-48" y="-42" width="39" height="33" rx="12" /><rect x="9" y="-42" width="39" height="33" rx="12" /><path d="M-9-27 Q0-32 9-27 M-48-29 L-61-35 M48-29 L61-35" /></g> : null}
        {actor === 'doctor' || actor === 'dentist' ? <g><path d="M-62-63 Q0-86 62-63" fill="none" stroke="#9eaea4" strokeWidth="9" /><circle cx="22" cy="-74" r="20" fill="#dbe3de" stroke="#8faaa1" strokeWidth="4" /><circle cx="22" cy="-74" r="8" fill="#a8c0b5" /></g> : null}
        {actor === 'handyman' ? <g><path d="M-64-66 Q-64-117 0-117 Q64-117 64-66Z" fill="#dbb477" /><path d="M-74-65 H74" stroke="#bd9459" strokeWidth="12" strokeLinecap="round" /><path d="M0-113 V-73" stroke="#f0cb8c" strokeWidth="10" /></g> : null}
      </g>
      {pose === 'phone' ? <g transform="translate(96 -79) rotate(-10)"><rect x="-19" y="-42" width="38" height="78" rx="8" fill="#4e6662" /><rect x="-13" y="-31" width="26" height="48" rx="3" fill="#d6e5d7" /><circle cy="26" r="3" fill="#a9bdb0" /></g> : null}
      {actor === 'handyman' && pose === 'point' ? <g transform="translate(126 -75) rotate(12)"><path d="M0 35 V-21" stroke="#9ba8a1" strokeWidth="13" strokeLinecap="round" /><path d="M-15-42 Q-28-17-3-11 Q23-12 15-42 L6-28-6-28Z" fill="#aab6af" /></g> : null}
      {actor === 'laundry' || pose === 'carry' ? <g transform="translate(0 53)"><rect x="-74" y="-4" width="148" height="24" rx="8" fill="#e8cbb4" /><rect x="-70" y="-25" width="140" height="24" rx="8" fill="#f5ecd8" /><rect x="-66" y="-46" width="132" height="24" rx="8" fill="#b7c9c1" /><path d="M-45-38 V-28 M-42-17 V-7 M-44 5 V15" stroke="#fff5e5" strokeWidth="3" /></g> : null}
    </g>
  </g>;
}

export function CatPuppet({ x, y, scale = 1, startled = false, time = 0, reducedMotion = false }: { x: number; y: number; scale?: number; startled?: boolean; time?: number; reducedMotion?: boolean }) {
  const tail = reducedMotion ? 0 : Math.sin(time * 2.5) * 9;
  return <g transform={`translate(${x} ${y}) scale(${scale})`} data-story-actor="cat">
    <ellipse cy="5" rx="105" ry="14" fill="#6c6b51" opacity="0.13" />
    <path d="M69-23 Q142-41 119-114 Q111-140 92-126" stroke="#c38d5b" strokeWidth="25" fill="none" strokeLinecap="round" transform={`rotate(${tail} 69 -23)`} />
    <ellipse cy="-37" rx="82" ry="52" fill="#d4a472" /><ellipse cx="-38" cy="-5" rx="37" ry="14" fill="#dfb986" /><ellipse cx="35" cy="-5" rx="37" ry="14" fill="#dfb986" />
    <g transform={`translate(-12 ${startled ? -113 : -93})`}><path d="M-53-18 L-53-77-12-43 M15-43 L52-77 54-18" fill="#d4a472" /><path d="M-44-36 L-43-63-24-43 M28-43 L43-63 43-35" fill="#dfafa0" /><ellipse rx="65" ry="49" fill="#dfb281" />{startled ? <g fill="#4b4739"><ellipse cx="-25" cy="-5" rx="7" ry="13" /><ellipse cx="25" cy="-5" rx="7" ry="13" /></g> : <g stroke="#66513e" strokeWidth="4" fill="none" strokeLinecap="round"><path d="M-36-3 Q-25 7-15-3 M15-3 Q25 7 36-3" /></g>}<path d="M-7 13 L7 13 0 21Z" fill="#9e6655" /><path d="M0 21 Q-8 31-17 24 M0 21 Q8 31 17 24" fill="none" stroke="#9e6655" strokeWidth="3" /><g stroke="#9e7b58" strokeWidth="3"><path d="M-34 17 L-75 8 M-34 26 L-76 29 M34 17 L75 8 M34 26 L76 29" /></g><path d="M-14-36 L-9-22 M6-38 L7-23 M24-32 L21-20" stroke="#bf8b5d" strokeWidth="6" strokeLinecap="round" /></g>
  </g>;
}

export function Sparkle({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return <path d="M0-20 Q4-4 20 0 Q4 4 0 20 Q-4 4-20 0 Q-4-4 0-20Z" transform={`translate(${x} ${y}) scale(${scale})`} fill="#e1b66d" />;
}
