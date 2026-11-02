import type { EpisodeProject, MouthCue } from '../packages/core/index';
import { cameraPose } from '../packages/core/camera';
import { StoryScene, getStoryFocus } from './StoryScene';
import { StoryClinicSet } from './story/Sets';
import { BedroomBackdrop, BedroomForeground, GardenBackdrop, GardenForeground, MeadowBackdrop, MeadowForeground } from './Backgrounds';

type MouthShape = MouthCue['value'];

const coats = ['#bd7b55', '#d09b70', '#b98969', '#c89168', '#a87458'];

function captionLines(caption: string) {
  const lines: string[] = [];
  let remaining = caption.trim();
  while (remaining.length > 65) {
    const breakAt = remaining.lastIndexOf(' ', 65);
    const end = breakAt > 55 ? breakAt : 65;
    lines.push(remaining.slice(0, end));
    remaining = remaining.slice(end).trimStart();
  }
  if (remaining) lines.push(remaining);
  return lines;
}

function Mouth({ shape, progress = 0.5 }: { shape: MouthShape; progress?: number }) {
  if (shape === 'X' || shape === 'A') {
    return <path d="M-15 20 Q0 31 15 20" fill="none" stroke="#704331" strokeWidth="5" strokeLinecap="round" />;
  }
  const openEnvelope = 0.72 + 0.28 * Math.sin(Math.max(0, Math.min(1, progress)) * Math.PI);
  const baseHeight = shape === 'D' || shape === 'E' ? 23 : shape === 'B' ? 9 : 16;
  const baseWidth = shape === 'F' || shape === 'H' ? 10 : 19;
  const height = Math.max(5, baseHeight * openEnvelope);
  const width = Math.max(8, baseWidth * (0.85 + 0.15 * openEnvelope));
  return (
    <g>
      <ellipse cy="26" rx={width} ry={height} fill="#6f3d35" />
      {height > 11 && <ellipse cy={26 + height * 0.55} rx={width * 0.65} ry={height * 0.3} fill="#de8e8a" />}
      {(shape === 'B' || shape === 'G') && <path d={`M${-width + 3} 21 H${width - 3}`} stroke="#fff8e9" strokeWidth="5" />}
    </g>
  );
}

function Kangaroo({ x, y, index, timeSec, action, reducedMotion, mouth, mouthProgress = 0.5 }: {
  x: number; y: number; index: number; timeSec: number; action: string;
  reducedMotion: boolean; mouth: MouthShape; mouthProgress?: number;
}) {
  const phase = timeSec * Math.PI * (action === 'bounce' ? 1.6 : 0.6) + index * 0.65;
  const sinPhase = Math.sin(phase);
  const bob = reducedMotion ? 0 : action === 'jump' ? -Math.max(0, sinPhase) * 65 : sinPhase * (action === 'bounce' ? 16 : 4);
  const squashY = reducedMotion ? 1 : action === 'jump' || action === 'bounce' ? 1 + Math.max(0, sinPhase) * 0.045 - Math.max(0, -sinPhase) * 0.045 : 1;
  const squashX = 2 - squashY;
  const tilt = reducedMotion ? 0 : sinPhase * (action === 'bounce' ? 3 : 1);
  const tailSwing = reducedMotion ? 0 : Math.cos(phase - 0.4) * (action === 'bounce' || action === 'jump' ? 8 : 3);
  const earLag = reducedMotion ? 0 : Math.cos(phase - 0.3) * (action === 'bounce' || action === 'jump' ? 5 : 2);
  const wave = reducedMotion ? -15 : action === 'wave' ? -40 + Math.sin(timeSec * 7) * 16 : 0;
  const blink = !reducedMotion && (timeSec + index * 0.47) % 4.2 > 4.04;
  const coat = coats[index % coats.length];
  const shadowScale = reducedMotion ? 1 : Math.max(0.6, 1 + bob / 150);
  const shadowOpacity = reducedMotion ? 0.15 : Math.max(0.06, 0.15 + bob / 650);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="14" cy="155" rx={102 * shadowScale} ry={19 * shadowScale} fill="#658d56" opacity={shadowOpacity} />
      <g transform={`translate(0 ${bob}) rotate(${tilt}) scale(${squashX} ${squashY})`}>
        <path d="M43 73 C107 84 109 145 165 147 C125 166 62 149 21 119Z" fill={coat} transform={`rotate(${tailSwing} 43 95)`} />
        <ellipse cx="-46" cy="144" rx="61" ry="19" fill={coat} transform="rotate(-6 -46 144)" />
        <ellipse cx="46" cy="145" rx="60" ry="18" fill={coat} transform="rotate(7 46 145)" />
        <path d="M-53-38 C-98 20-87 109-40 132 Q0 156 45 129 C91 93 84 14 51-38Z" fill={coat} />
        <ellipse cy="65" rx="43" ry="64" fill="#efd0ac" />
        <path d="M-33 67 Q0 85 34 67 Q31 106 0 111 Q-29 105-33 67Z" fill="#e5b58b" />
        <g transform={`rotate(${wave} 53 -7)`}>
          <path d="M54-7 Q91 5 99 50" fill="none" stroke={coat} strokeWidth="27" strokeLinecap="round" />
          <ellipse cx="97" cy="53" rx="14" ry="20" fill={coat} transform="rotate(-18 97 53)" />
        </g>
        <path d="M-51-5 Q-88 15-87 52" fill="none" stroke={coat} strokeWidth="27" strokeLinecap="round" />
        <ellipse cx="-86" cy="56" rx="14" ry="20" fill={coat} transform="rotate(18 -86 56)" />
        <g transform="translate(0 -79)">
          <g transform={`rotate(${-earLag} -30 -60)`}>
            <path d="M-40-58 C-88-124-83-207-58-177 Q-21-133-17-66Z" fill={coat} />
            <path d="M-39-82 C-66-128-70-169-59-153 Q-38-123-29-83Z" fill="#e9b7a3" />
          </g>
          <g transform={`rotate(${earLag} 30 -60)`}>
            <path d="M20-64 C19-140 55-201 64-172 Q78-108 44-57Z" fill={coat} />
            <path d="M31-84 C32-127 53-169 54-147 Q57-112 41-79Z" fill="#e9b7a3" />
          </g>
          <path d="M-64-44 C-58-100 59-108 66-44 Q80 16 33 39 Q0 57-41 33 Q-78 15-64-44Z" fill={coat} />
          <ellipse cy="8" rx="49" ry="35" fill="#f3d7b5" />
          <ellipse cx="-42" cy="2" rx="12" ry="7" fill="#d98c77" opacity="0.55" />
          <ellipse cx="42" cy="2" rx="12" ry="7" fill="#d98c77" opacity="0.55" />
          {blink ? <g stroke="#493c32" strokeWidth="5" fill="none" strokeLinecap="round"><path d="M-38-24 Q-29-18-20-24" /><path d="M20-24 Q29-18 38-24" /></g> : <g><ellipse cx="-29" cy="-26" rx="6.5" ry="10" fill="#493c32" /><ellipse cx="29" cy="-26" rx="6.5" ry="10" fill="#493c32" /><circle cx="-27" cy="-29" r="2" fill="#fff" /><circle cx="31" cy="-29" r="2" fill="#fff" /></g>}
          <path d="M-10 4 Q0-3 10 4 Q9 15 0 16 Q-9 14-10 4Z" fill="#704331" />
          <Mouth shape={mouth} progress={mouthProgress} />
          <path d="M-18-77 Q-2-94 16-80" fill="none" stroke={coat} strokeWidth="13" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

/** Shared, deterministic scene used by the browser and the MP4 composition. */
export function StudioScene({ project, timeSec }: { project: EpisodeProject; timeSec: number }) {
  const time = Math.max(0, Math.min(timeSec, project.durationSec - 0.00001));
  const scene = project.scenes.find(candidate => time >= candidate.startSec && time < candidate.endSec) ?? project.scenes[0];
  if (!scene) return null;
  const count = scene.characterIds.length;
  const environment = scene.backgroundId === 'bedroom-day' ? 'a bedroom' : scene.backgroundId === 'garden-day' ? 'a garden' : scene.backgroundId === 'clinic-day' ? 'the doctor’s room' : 'a meadow';
  const captions = captionLines(scene.caption);
  const sceneIndex = project.scenes.indexOf(scene);
  const previousScene = project.scenes[sceneIndex - 1];
  const dissolve = scene.transition === 'dissolve' && previousScene && !project.preferences.reducedMotion ? Math.min(1, (time - scene.startSec) / Math.min(.35, (scene.endSec - scene.startSec) / 3)) : 1;
  const renderWorld = (shot: typeof scene, sampleTime: number) => {
    const progress = Math.max(0, Math.min(1, (sampleTime - shot.startSec) / (shot.endSec - shot.startSec)));
    const focus = shot.story ? getStoryFocus(shot, project.preferences.reducedMotion ? .5 : progress) : { x: 960, y: 540 };
    const pose = cameraPose(shot.camera, progress, focus, project.preferences.reducedMotion);
    if (shot.story) return <g transform={pose.transform}><StoryScene project={project} timeSec={sampleTime} scene={shot} backdropTransform={pose.backdropTransform} foregroundTransform={pose.foregroundTransform} /></g>;
    const cue = project.mouthCues.find(candidate => sampleTime >= candidate.startSec && sampleTime < candidate.endSec);
    const cueProgress = cue && cue.endSec > cue.startSec ? Math.max(0, Math.min(1, (sampleTime - cue.startSec) / (cue.endSec - cue.startSec))) : 0.5;
    const indoor = shot.backgroundId === 'bedroom-day';
    const garden = shot.backgroundId === 'garden-day';
    const clinic = shot.backgroundId === 'clinic-day';
    const gap = shot.characterIds.length > 1 ? Math.min(indoor || garden ? 285 : 310, 1350 / (shot.characterIds.length - 1)) : 0;
    const left = 960 - (shot.characterIds.length - 1) * gap / 2;
    const groundY = indoor ? 655 : garden ? 635 : 687;
    return <g transform={pose.transform}>
      <g transform={pose.backdropTransform}>{indoor ? <BedroomBackdrop /> : garden ? <GardenBackdrop /> : clinic ? <StoryClinicSet /> : <MeadowBackdrop />}</g>
      {shot.characterIds.map((id, index) => <Kangaroo key={id} x={left + index * gap} y={groundY + (index % 2) * 12} index={Math.max(0, Number(id.split('-')[1]) - 1)} timeSec={sampleTime - shot.startSec} action={shot.actionId} reducedMotion={project.preferences.reducedMotion} mouth={id === 'roo-1' ? cue?.value ?? 'X' : 'X'} mouthProgress={cueProgress} />)}
      {clinic ? null : <g transform={pose.foregroundTransform}>{indoor ? <BedroomForeground /> : garden ? <GardenForeground /> : <MeadowForeground />}</g>}
    </g>;
  };
  const countLabel = scene.story && scene.backgroundId === 'bedroom-day' ? 'ON THE BED' : scene.story && scene.backgroundId === 'garden-day' ? 'ON THE TRAMPOLINE' : 'KANGAROOS';
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${scene.title}: ${count} kangaroos in ${environment}`} style={{ display: 'block', fontFamily: 'Arial, sans-serif', background: '#edf3e8' }}>
      <defs>
        <linearGradient id="studio-sky" x2="0" y2="1"><stop stopColor="#e1eee7" /><stop offset="1" stopColor="#f9f1d7" /></linearGradient>
        <linearGradient id="studio-ground" x2="0" y2="1"><stop stopColor="#c4d69c" /><stop offset="1" stopColor="#d4dfa9" /></linearGradient>
      </defs>
      {dissolve < 1 && previousScene ? <g opacity={1 - dissolve}>{renderWorld(previousScene, previousScene.endSec - 1 / project.fps)}</g> : null}
      <g opacity={dissolve}>{renderWorld(scene, time)}</g>
      {scene.visibleCount !== undefined && dissolve === 1 ? <g transform="translate(1572 90)"><rect width="238" height="145" rx="38" fill="#fffaf0" opacity="0.9" /><text x="119" y="87" textAnchor="middle" fontSize="72" fontWeight="700" fill="#355947">{count}</text><text x="119" y="119" textAnchor="middle" fontSize={countLabel.length > 12 ? 14 : 19} letterSpacing="2" fill="#5f7864">{countLabel}</text></g> : null}
      {!scene.story && <text x="110" y="146" fill="#52705a" fontSize="22" letterSpacing="6" fontWeight="600">LITTLE MOMENTS, BIG DISCOVERIES</text>}
      {project.preferences.captions && captions.length > 0 && <g><rect x="270" y={captions.length > 1 ? 914 : 937} width="1380" height={captions.length > 1 ? 126 : 90} rx="27" fill="#fffcf0" opacity="0.94" /><text x="960" y={captions.length > 1 ? 963 : 995} textAnchor="middle" fontSize="36" fontWeight="500" fill="#3d5948">{captions.map((line, index) => <tspan key={index} x="960" dy={index === 0 ? 0 : 43}>{line}</tspan>)}</text></g>}
    </svg>
  );
}
