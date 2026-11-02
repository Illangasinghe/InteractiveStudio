import type { EpisodeProject, Scene } from '../packages/core/index';
import { GardenBackdrop, GardenForeground, MeadowBackdrop, MeadowForeground } from './Backgrounds';
import { RooPuppet, CatPuppet, Sparkle } from './story/Puppets';
import { StoryBedroomSet, StoryBedForeground, StoryClinicSet, RestIllustration } from './story/Sets';
import { STORY_FOCUS, type StoryDirective } from './story/types';

export { STORY_FOCUS } from './story/types';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const REACTION_CONTACT_PROGRESS = 0.14;
const bedX = (id: string) => 350 + (Math.max(1, Number(id.split('-')[1] ?? 1)) - 1) * 190;

/** The leap is a single authored action over its scene, rather than a repeated loop. */
function leapPosition(scene: Scene, progress: number) {
  const p = clamp(progress);
  const startX = bedX(scene.story?.featuredCharacterId ?? 'roo-1');
  return { x: startX + (1510 - startX) * p, y: 805 + (535 - 805) * p - 220 * 4 * p * (1 - p), rotation: -18 + p * 27 };
}

const leapFlightProgress = (sceneProgress: number) => clamp((sceneProgress - 0.65) / 0.35) * 0.7;

/** Camera rectangle centres use world coordinates; reduced motion callers pass .5. */
export function getStoryFocus(scene: Scene, progress: number) {
  const beat = scene.story?.beatId ?? 'establish';
  if (beat === 'leap' && scene.camera?.move === 'follow-action') {
    const point = leapPosition(scene, leapFlightProgress(progress));
    return { x: point.x, y: point.y - 120, width: 1100, height: 850 };
  }
  if (beat === 'establish' && scene.camera?.shot !== 'wide' && scene.camera?.move === 'pan-right' && scene.story?.actorIds.includes('dad')) {
    return { x: 1420, y: 650, width: 1100, height: 900 };
  }
  return STORY_FOCUS[beat];
}

/**
 * SVG world only: the caller owns camera transforms, dissolves, captions and count UI.
 * Counted child IDs stay separate from adult actors and an explicitly departing child.
 */
export function StoryScene({ project, scene, timeSec }: { project: EpisodeProject; scene: Scene; timeSec: number }) {
  if (!scene.story) return null;
  const { beatId, actorIds, featuredCharacterId = 'roo-1', speakingActorId } = scene.story as StoryDirective;
  const time = Math.max(0, timeSec - scene.startSec);
  const duration = Math.max(1 / project.fps, scene.endSec - scene.startSec);
  const reducedMotion = project.preferences.reducedMotion;
  const progress = reducedMotion ? 0.5 : clamp(time / duration);
  const cue = project.mouthCues.find(candidate => timeSec >= candidate.startSec && timeSec < candidate.endSec);
  const actors = new Set(actorIds);
  const isGarden = beatId === 'trampoline' || beatId === 'family-finale';
  const isClinic = beatId === 'doctor-advice' || beatId === 'dentist';
  const speaker = speakingActorId ?? 'roo-1';
  const mouthFor = (id: string) => id === speaker ? cue?.value ?? 'X' : 'X';
  const bedGroup = (pose: 'idle' | 'bounce' | 'wave' | 'sleep' | 'moonwalk' = 'idle', excludeFeatured = false) => scene.characterIds.filter(id => !excludeFeatured || id !== featuredCharacterId).map(id => <RooPuppet key={id} id={id} x={bedX(id)} y={805} scale={0.78} time={time} pose={pose} reducedMotion={reducedMotion} mouth={mouthFor(id)} />);
  const father = (pose: 'idle' | 'surprised' | 'phone' | 'point' | 'wave' = 'idle') => actors.has('dad') ? <RooPuppet actor="dad" x={1510} y={930} scale={1.2} time={time} pose={pose} expression={pose === 'surprised' ? 'surprised' : pose === 'phone' ? 'thoughtful' : 'happy'} reducedMotion={reducedMotion} mouth={mouthFor('dad')} /> : null;
  const clinicActor = beatId === 'dentist' ? 'dentist' : 'doctor';
  let action;

  switch (beatId) {
    case 'establish':
      action = <>{bedGroup('idle')}{father('idle')}</>;
      break;
    case 'bed-bounce':
      action = <>{bedGroup(scene.actionId === 'idle' ? 'idle' : 'bounce')}{father('idle')}{actors.has('cat') ? <CatPuppet x={1750} y={933} scale={0.82} time={time} reducedMotion={reducedMotion} /> : null}</>;
      break;
    case 'leap': {
      const flight = leapFlightProgress(progress);
      const point = leapPosition(scene, flight);
      action = <>{bedGroup('bounce', true)}{father('surprised')}<RooPuppet id={featuredCharacterId} x={point.x} y={point.y} scale={0.78 - 0.14 * flight} time={time} pose="leap" rotation={reducedMotion ? 0 : point.rotation} reducedMotion={reducedMotion} mouth={mouthFor(featuredCharacterId)} shadow={false} /></>;
      break;
    }
    case 'dad-reaction': {
      const contact = reducedMotion || progress >= REACTION_CONTACT_PROGRESS;
      const flight = reducedMotion ? 1 : 0.7 + 0.3 * clamp(progress / REACTION_CONTACT_PROGRESS);
      const point = leapPosition(scene, flight);
      const contactTime = Math.max(0, time - duration * REACTION_CONTACT_PROGRESS);
      const settle = reducedMotion || !contact ? 0 : Math.sin(contactTime * 9) * Math.exp(-contactTime * 3) * 9;
      action = <>{bedGroup('idle', true)}{father('surprised')}<RooPuppet id={featuredCharacterId} x={point.x} y={point.y + settle} scale={0.78 - 0.14 * flight} time={time} pose={contact ? 'idle' : 'leap'} rotation={contact || reducedMotion ? 0 : point.rotation} reducedMotion={reducedMotion} mouth={mouthFor(featuredCharacterId)} shadow={false} />{contact ? <><Sparkle x={1694} y={523} scale={0.85} /><Sparkle x={1341} y={542} scale={0.55} /></> : null}</>;
      break;
    }
    case 'dad-phone':
      action = <>{bedGroup('idle', true)}{father('phone')}{!scene.characterIds.includes(featuredCharacterId) ? <RooPuppet id={featuredCharacterId} x={1756} y={930} scale={0.64} time={time} pose="idle" reducedMotion={reducedMotion} /> : null}<g><path d="M1338 466 L1421 537" stroke="#fbf5e5" strokeWidth="18" strokeLinecap="round" /><circle cx="1260" cy="403" r="103" fill="#fffaed" stroke="#e3d9c3" strokeWidth="5" /><circle cx="1260" cy="403" r="57" fill="#d8e5d7" /><path d="M1260 372 V434 M1229 403 H1291" stroke="#80a699" strokeWidth="18" strokeLinecap="round" /></g></>;
      break;
    case 'doctor-advice':
    case 'dentist': {
      const adviceMode = beatId === 'dentist' || speaker === clinicActor;
      action = <>{actors.has(clinicActor) ? <RooPuppet actor={clinicActor} x={985} y={932} scale={1.35} time={time} pose={adviceMode ? 'point' : 'phone'} reducedMotion={reducedMotion} mouth={mouthFor(clinicActor)} /> : null}{adviceMode ? <><RestIllustration x={1374} y={478} scale={0.86} kind={beatId === 'dentist' ? 'tooth' : 'bed'} /><path d="M1250 591 L1189 630 L1230 554" fill="#fffbef" /></> : null}</>;
      break;
    }
    case 'cat-reaction':
      action = <>{bedGroup('bounce')}{actors.has('cat') ? <CatPuppet x={1521} y={928} scale={1.05} time={time} reducedMotion={reducedMotion} startled={true} /> : null}<g transform="translate(1510 695)" stroke="#c09b63" strokeWidth="7" fill="none" strokeLinecap="round"><path d="M-90 9 L-109-9 M-40-15 L-44-41 M42-20 L48-47" /></g>{father('idle')}</>;
      break;
    case 'empty-bed':
      action = <>{father('point')}</>;
      break;
    case 'trampoline':
    case 'family-finale':
      action = <>{scene.characterIds.map((id, index) => <RooPuppet key={id} id={id} x={430 + (scene.characterIds.length > 1 ? index * 1060 / (scene.characterIds.length - 1) : 530)} y={794} scale={0.75} time={time} pose={beatId === 'family-finale' ? 'wave' : 'bounce'} reducedMotion={reducedMotion} mouth={id === 'roo-1' ? cue?.value ?? 'X' : 'X'} />)}{actors.has('dad') ? <RooPuppet actor="dad" x={1745} y={960} scale={0.95} time={time} pose="wave" reducedMotion={reducedMotion} /> : null}{actors.has('mum') ? <RooPuppet actor="mum" x={150} y={960} scale={0.95} time={time} pose="wave" reducedMotion={reducedMotion} /> : null}</>;
      break;
    default:
      action = <>{bedGroup('idle')}{father('idle')}</>;
  }

  return <g data-story-beat={beatId}>
    <defs><linearGradient id="story-sky" x2="0" y2="1"><stop stopColor="#e1eee7" /><stop offset="1" stopColor="#f9f1d7" /></linearGradient></defs>
    {isGarden ? <GardenBackdrop /> : isClinic ? <StoryClinicSet /> : scene.backgroundId === 'meadow-day' ? <MeadowBackdrop /> : <StoryBedroomSet />}
    {action}
    {isGarden ? <GardenForeground /> : isClinic ? null : scene.backgroundId === 'meadow-day' ? <MeadowForeground /> : <StoryBedForeground />}
  </g>;
}
