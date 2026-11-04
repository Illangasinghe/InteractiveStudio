import type { EpisodeProject, Scene } from '../packages/core/index';
import { GardenBackdrop, GardenForeground, MeadowBackdrop, MeadowForeground } from './Backgrounds';
import { RooPuppet, CatPuppet, Sparkle } from './story/Puppets';
import { StoryBedroomSet, StoryBedForeground, StoryClinicSet, RestIllustration } from './story/Sets';
import { STORY_FOCUS, type StoryDirective } from './story/types';

export { STORY_FOCUS } from './story/types';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const bedX = (id: string) => 610 + (Math.max(1, Number(id.split('-')[1] ?? 1)) - 1) * 135;

// Key coordinates for the two-stage joey leap:
// Stage 1: Lands squarely atop Father's head
const DAD_HEAD_X = 1580;
const DAD_HEAD_Y = 475;
// Stage 2: Tumbles down from Father's head to the bedroom floor braided rug
const RUG_X = 1360;
const RUG_Y = 925;

/** The leap is a single authored action over its scene, rather than a repeated loop. */
function leapPosition(scene: Scene, progress: number) {
  const p = clamp(progress);
  const startX = bedX(scene.story?.featuredCharacterId ?? 'roo-1');
  const beat = scene.story?.beatId ?? 'leap';

  if (beat === 'dad-reaction') {
    // Stage 1: Head impact / bonk on Father's head
    if (p < 0.28) {
      return {
        x: DAD_HEAD_X,
        y: DAD_HEAD_Y,
        rotation: 8 * (1 - p / 0.28),
      };
    }
    // Stage 2: Tumble and fall down from Father's head to the rug
    if (p < 0.65) {
      const t = (p - 0.28) / 0.37;
      return {
        x: DAD_HEAD_X + (RUG_X - DAD_HEAD_X) * t,
        y: DAD_HEAD_Y + (RUG_Y - DAD_HEAD_Y) * (t * t),
        rotation: 8 - t * 16,
      };
    }
    // Stage 3: Safely landed on the rug
    return {
      x: RUG_X,
      y: RUG_Y,
      rotation: 0,
    };
  }

  // Beat is 'leap': Parabolic flight from bed across to Father's head
  return {
    x: startX + (DAD_HEAD_X - startX) * p,
    y: 745 + (DAD_HEAD_Y - 745) * p - 260 * 4 * p * (1 - p),
    rotation: -14 + p * 24,
  };
}

const leapFlightProgress = (sceneProgress: number) => clamp((sceneProgress - 0.32) / 0.68);

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
export function StoryScene({ project, scene, timeSec, backdropTransform, foregroundTransform }: {
  project: EpisodeProject; scene: Scene; timeSec: number; backdropTransform?: string; foregroundTransform?: string;
}) {
  if (!scene.story) return null;
  const { beatId, actorIds, featuredCharacterId = 'roo-1', speakingActorId } = scene.story as StoryDirective;
  const time = Math.max(0, timeSec - scene.startSec);
  const duration = Math.max(1 / project.fps, scene.endSec - scene.startSec);
  const reducedMotion = project.preferences.reducedMotion;
  const progress = reducedMotion ? 0.5 : clamp(time / duration);
  const cue = project.mouthCues.find(candidate => timeSec >= candidate.startSec && timeSec < candidate.endSec);
  const cueProgress = cue && cue.endSec > cue.startSec ? clamp((timeSec - cue.startSec) / (cue.endSec - cue.startSec)) : 0.5;
  const actors = new Set(actorIds);
  const isGarden = beatId === 'trampoline' || beatId === 'family-finale';
  const isClinic = beatId === 'doctor-advice' || beatId === 'dentist';
  const speaker = speakingActorId ?? 'roo-1';
  const mouthFor = (id: string) => id === speaker ? cue?.value ?? 'X' : 'X';
  const bedGroup = (pose: 'idle' | 'bounce' | 'wave' | 'sleep' | 'moonwalk' = 'idle', excludeFeatured = false) =>
    scene.characterIds.filter(id => !excludeFeatured || id !== featuredCharacterId).map(id => (
      <RooPuppet key={id} id={id} x={bedX(id)} y={745} scale={0.78} time={time} pose={pose} reducedMotion={reducedMotion} mouth={mouthFor(id)} mouthProgress={cueProgress} />
    ));
  const father = (pose: 'idle' | 'surprised' | 'phone' | 'point' | 'wave' = 'idle', yOffset = 0, squashX = 1, squashY = 1) =>
    actors.has('dad') ? (
      <RooPuppet actor="dad" x={1600} y={930 + yOffset} scale={1.2} time={time} pose={pose} expression={pose === 'surprised' ? 'surprised' : pose === 'phone' ? 'thoughtful' : 'happy'} reducedMotion={reducedMotion} mouth={mouthFor('dad')} mouthProgress={cueProgress} squashX={squashX} squashY={squashY} />
    ) : null;
  const bedroomCat = (startled = false, pose?: 'sleep' | 'awake' | 'startled') =>
    !isClinic && !isGarden ? (
      <CatPuppet x={1780} y={990} scale={0.78} time={time} startled={startled} pose={pose} reducedMotion={reducedMotion} />
    ) : null;
  const clinicActor = beatId === 'dentist' ? 'dentist' : 'doctor';
  let action;

  switch (beatId) {
    case 'establish':
      action = (
        <>
          {bedGroup('idle')}
          {father('idle')}
          {bedroomCat()}
        </>
      );
      break;
    case 'bed-bounce':
      action = (
        <>
          {bedGroup(scene.actionId === 'idle' ? 'idle' : 'bounce')}
          {father('idle')}
          {bedroomCat()}
        </>
      );
      break;
    case 'leap': {
      const flight = leapFlightProgress(progress);
      const anticipation = !reducedMotion && progress >= 0.10 && progress < 0.32 ? Math.sin(((progress - 0.10) / 0.22) * Math.PI) : 0;
      const point = leapPosition(scene, flight);
      const crouchY = anticipation * 18;
      const leapSquashY = anticipation > 0 ? 1 - anticipation * 0.14 : flight > 0 ? 1 + Math.sin(flight * Math.PI) * 0.12 : 1;
      const leapSquashX = 2 - leapSquashY;
      action = (
        <>
          {bedGroup('bounce', true)}
          {father(flight > 0.85 ? 'surprised' : 'idle')}
          {bedroomCat()}
          <RooPuppet
            id={featuredCharacterId}
            x={point.x}
            y={point.y + crouchY}
            scale={0.78 - 0.1 * flight}
            time={time}
            pose={flight > 0 ? 'leap' : 'bounce'}
            rotation={reducedMotion || flight === 0 ? 0 : point.rotation}
            reducedMotion={reducedMotion}
            mouth={mouthFor(featuredCharacterId)}
            mouthProgress={cueProgress}
            shadow={flight === 0}
            squashX={leapSquashX}
            squashY={leapSquashY}
          />
        </>
      );
      break;
    }
    case 'dad-reaction': {
      const point = leapPosition(scene, progress);
      const isHeadBonk = progress < 0.28;
      const isLanded = progress >= 0.65;
      const contactTime = Math.max(0, time);
      const dadImpact = reducedMotion ? 0 : Math.sin(contactTime * 11) * Math.exp(-contactTime * 3.5);
      const dadSquashY = isHeadBonk ? 1 - Math.max(0, dadImpact) * 0.12 : 1;
      const dadSquashX = 2 - dadSquashY;
      const dadHeadOffset = isHeadBonk ? Math.max(0, dadImpact) * 16 : 0;

      const landTime = Math.max(0, time - duration * 0.65);
      const settle = isLanded && !reducedMotion ? Math.sin(landTime * 12) * Math.exp(-landTime * 4) * 8 : 0;

      const joeyPose = isHeadBonk ? 'idle' : isLanded ? 'idle' : 'leap';
      const joeyScale = isHeadBonk ? 0.68 : isLanded ? 0.68 : 0.70;

      action = (
        <>
          {bedGroup('idle', true)}
          {father('surprised', dadHeadOffset, dadSquashX, dadSquashY)}
          {bedroomCat(false, isHeadBonk ? 'awake' : 'sleep')}
          <RooPuppet
            id={featuredCharacterId}
            x={point.x}
            y={point.y + dadHeadOffset + settle}
            scale={joeyScale}
            time={time}
            pose={joeyPose}
            rotation={reducedMotion ? 0 : point.rotation}
            reducedMotion={reducedMotion}
            mouth={mouthFor(featuredCharacterId)}
            mouthProgress={cueProgress}
            shadow={isLanded}
          />
          {isHeadBonk ? (
            <>
              <Sparkle x={DAD_HEAD_X - 70} y={DAD_HEAD_Y - 40} scale={0.85} />
              <Sparkle x={DAD_HEAD_X + 70} y={DAD_HEAD_Y - 55} scale={0.8} />
              <Sparkle x={DAD_HEAD_X - 15} y={DAD_HEAD_Y - 110} scale={1.0} />
            </>
          ) : isLanded ? (
            <>
              <Sparkle x={RUG_X - 45} y={RUG_Y - 55} scale={0.7} />
              <Sparkle x={RUG_X + 45} y={RUG_Y - 65} scale={0.75} />
              <Sparkle x={RUG_X} y={RUG_Y - 95} scale={0.85} />
            </>
          ) : null}
        </>
      );
      break;
    }
    case 'dad-phone':
      action = (
        <>
          {bedGroup('idle', true)}
          {father('phone')}
          {bedroomCat()}
          {!scene.characterIds.includes(featuredCharacterId) ? (
            <RooPuppet id={featuredCharacterId} x={1360} y={925} scale={0.68} time={time} pose="idle" reducedMotion={reducedMotion} />
          ) : null}
        </>
      );
      break;
    case 'doctor-advice':
    case 'dentist': {
      const adviceMode = beatId === 'dentist' || speaker === clinicActor;
      action = (
        <>
          {actors.has(clinicActor) ? (
            <RooPuppet actor={clinicActor} x={985} y={932} scale={1.35} time={time} pose={adviceMode ? 'point' : 'phone'} reducedMotion={reducedMotion} mouth={mouthFor(clinicActor)} mouthProgress={cueProgress} />
          ) : null}
        </>
      );
      break;
    }
    case 'cat-reaction':
      action = (
        <>
          {bedGroup('bounce')}
          {bedroomCat(true)}
          <g transform="translate(1780 730)" stroke="#c09b63" strokeWidth="7" fill="none" strokeLinecap="round">
            <path d="M-90 9 L-109-9 M-40-15 L-44-41 M42-20 L48-47" />
          </g>
          {father('idle')}
        </>
      );
      break;
    case 'empty-bed':
      action = (
        <>
          {father('point')}
          {bedroomCat()}
        </>
      );
      break;
    case 'trampoline':
    case 'family-finale':
      action = (
        <>
          {scene.characterIds.map((id, index) => (
            <RooPuppet key={id} id={id} x={430 + (scene.characterIds.length > 1 ? index * 1060 / (scene.characterIds.length - 1) : 530)} y={794} scale={0.75} time={time} pose={beatId === 'family-finale' ? 'wave' : 'bounce'} reducedMotion={reducedMotion} mouth={id === 'roo-1' ? cue?.value ?? 'X' : 'X'} mouthProgress={cueProgress} />
          ))}
          {actors.has('dad') ? <RooPuppet actor="dad" x={1745} y={960} scale={0.95} time={time} pose="wave" reducedMotion={reducedMotion} /> : null}
          {actors.has('mum') ? <RooPuppet actor="mum" x={150} y={960} scale={0.95} time={time} pose="wave" reducedMotion={reducedMotion} /> : null}
        </>
      );
      break;
    default:
      action = <>{bedGroup('idle')}{father('idle')}{bedroomCat()}</>;
  }

  return (
    <g data-story-beat={beatId}>
      <defs>
        <linearGradient id="story-sky" x2="0" y2="1">
          <stop stopColor="#e1eee7" />
          <stop offset="1" stopColor="#f9f1d7" />
        </linearGradient>
      </defs>
      <g transform={backdropTransform}>{isGarden ? <GardenBackdrop /> : isClinic ? <StoryClinicSet /> : scene.backgroundId === 'meadow-day' ? <MeadowBackdrop /> : <StoryBedroomSet />}</g>
      {action}
      {isClinic ? null : <g transform={foregroundTransform}>{isGarden ? <GardenForeground /> : scene.backgroundId === 'meadow-day' ? <MeadowForeground /> : <StoryBedForeground />}</g>}
    </g>
  );
}
