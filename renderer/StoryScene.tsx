import type { EpisodeProject, Scene } from '../packages/core/index';
import { GardenBackdrop, GardenForeground, MeadowBackdrop, MeadowForeground } from './Backgrounds';
import { RooPuppet, CatPuppet, Sparkle } from './story/Puppets';
import { StoryBedroomSet, StoryBedForeground, StoryClinicSet, RestIllustration } from './story/Sets';
import { STORY_FOCUS, type StoryDirective, type StoryActorId } from './story/types';
import { CeilingFan, ToyAirplane, BedspreadWaterSplash, BumpedNoseEffect, GardenButterfly } from './story/Props';

export { STORY_FOCUS } from './story/types';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const bedX = (id: string) => 610 + (Math.max(1, Number(id.split('-')[1] ?? 1)) - 1) * 135;

// Key anchor coordinates in the 1920x1080 bedroom world
const DAD_HEAD_X = 1450;
const DAD_HEAD_Y = 460;
const RUG_X = 1260;
const RUG_Y = 915;
const CAT_RUG_X = 1450;
const CAT_RUG_Y = 915;
const FAN_X = 960;
const FAN_Y = 130;
const BED_CENTER_X = 920;
const BED_CENTER_Y = 780;
const MOONWALK_START_X = 920;
const MOONWALK_END_X = 1260;
const FLOOR_Y = 915;

/**
 * Returns the exact action trajectory for each specific joey incident across the 5 verses.
 */
function getVerseActionTrajectory(scene: Scene, progress: number) {
  const p = clamp(progress);
  const feat = scene.story?.featuredCharacterId ?? 'roo-1';
  const beat = scene.story?.beatId ?? 'leap';
  const startX = bedX(feat);

  // --- VERSE 5: Roo-1 leaps onto Daddy's Head ---
  if (feat === 'roo-1') {
    if (beat === 'dad-reaction') {
      // Stage 1: Bonk atop Father's head
      if (p < 0.28) {
        return { x: DAD_HEAD_X, y: DAD_HEAD_Y, rotation: 8 * (1 - p / 0.28), squashX: 1, squashY: 1 };
      }
      // Stage 2: Tumble and slide down Father's arm to the rug
      if (p < 0.65) {
        const t = (p - 0.28) / 0.37;
        return {
          x: DAD_HEAD_X + (RUG_X - DAD_HEAD_X) * t,
          y: DAD_HEAD_Y + (RUG_Y - DAD_HEAD_Y) * (t * t),
          rotation: 8 - t * 16,
          squashX: 1,
          squashY: 1,
        };
      }
      // Stage 3: Safely landed on the braided rug
      return { x: RUG_X, y: RUG_Y, rotation: 0, squashX: 1, squashY: 1 };
    }
    // Parabolic leap across to Dad's head
    return {
      x: startX + (DAD_HEAD_X - startX) * p,
      y: 745 + (DAD_HEAD_Y - 745) * p - 260 * 4 * p * (1 - p),
      rotation: -14 + p * 24,
      squashX: 1,
      squashY: 1,
    };
  }

  // --- VERSE 4: Roo-2 tries a somersault backflip towards the cat ---
  if (feat === 'roo-2') {
    if (beat === 'cat-reaction' || beat === 'dad-reaction') {
      return { x: CAT_RUG_X, y: CAT_RUG_Y, rotation: 0, squashX: 1, squashY: 1 };
    }
    // High backward somersault flip: 360-degree backflip rotation!
    return {
      x: startX + (CAT_RUG_X - startX) * p,
      y: 745 + (CAT_RUG_Y - 745) * p - 320 * 4 * p * (1 - p),
      rotation: -360 * p,
      squashX: 1 + Math.sin(p * Math.PI) * 0.1,
      squashY: 1 - Math.sin(p * Math.PI) * 0.1,
    };
  }

  // --- VERSE 3: Roo-3 bounces straight up on bed tossing toy airplane at ceiling fan ---
  if (feat === 'roo-3') {
    if (beat === 'dad-reaction') {
      // Seated on the bed looking up in awe at the wobbling ceiling fan
      return { x: startX, y: 745, rotation: 0, squashX: 1, squashY: 1 };
    }
    // High vertical bounce up toward ceiling
    const bounceApex = 280;
    const sinUp = Math.sin(p * Math.PI);
    return {
      x: startX,
      y: 745 - bounceApex * sinUp,
      rotation: Math.sin(p * Math.PI * 2) * 5,
      squashX: sinUp > 0.8 ? 1.0 : 0.94,
      squashY: sinUp > 0.8 ? 1.0 : 1.08,
    };
  }

  // --- VERSE 2: Roo-4 does a cannonball jump into middle of bed, soaking bedspread ---
  if (feat === 'roo-4') {
    if (beat === 'dad-reaction') {
      // Seated soaked in the middle of the wet bedspread
      return { x: BED_CENTER_X, y: BED_CENTER_Y, rotation: 0, squashX: 1, squashY: 1 };
    }
    // High cannonball jump into center of bed
    return {
      x: startX + (BED_CENTER_X - startX) * p,
      y: 745 + (BED_CENTER_Y - 745) * p - 300 * 4 * p * (1 - p),
      rotation: 18 * p,
      squashX: 1.25, // tight round cannonball tuck!
      squashY: 0.8,
    };
  }

  // --- VERSE 1: Roo-5 moonwalks backward along floor and bumps nose ---
  if (feat === 'roo-5') {
    if (beat === 'dad-reaction') {
      // Seated on the rug at the footpost rubbing bumped nose
      return { x: MOONWALK_END_X, y: FLOOR_Y, rotation: 0, squashX: 1, squashY: 1 };
    }
    // Smooth horizontal moonwalk slide along the floorboards
    const slideX = MOONWALK_START_X + (MOONWALK_END_X - MOONWALK_START_X) * p;
    const stepBob = Math.abs(Math.sin(p * Math.PI * 6)) * 8;
    return {
      x: slideX,
      y: FLOOR_Y - stepBob,
      rotation: -4,
      squashX: 1,
      squashY: 1,
    };
  }

  // Fallback default
  return { x: startX, y: 745, rotation: 0, squashX: 1, squashY: 1 };
}

const leapFlightProgress = (sceneProgress: number) => clamp((sceneProgress - 0.28) / 0.72);

/** Camera rectangle centres use world coordinates; reduced motion callers pass .5. */
export function getStoryFocus(scene: Scene, progress: number) {
  const beat = scene.story?.beatId ?? 'establish';
  const feat = scene.story?.featuredCharacterId ?? 'roo-1';

  if (beat === 'leap' && scene.camera?.move === 'follow-action') {
    if (feat === 'roo-3') {
      // Tilt camera up toward ceiling fan and flying toy
      return { x: 960, y: 400, width: 1300, height: 900 };
    }
    if (feat === 'roo-4') {
      // Focus on cannonball splashing into bedspread center
      return { x: 920, y: 650, width: 1250, height: 850 };
    }
    if (feat === 'roo-5') {
      // Focus on floor moonwalk glide
      return { x: 1140, y: 760, width: 1250, height: 850 };
    }
    const point = getVerseActionTrajectory(scene, leapFlightProgress(progress));
    return { x: point.x, y: point.y - 120, width: 1100, height: 850 };
  }

  if (beat === 'dad-reaction') {
    if (feat === 'roo-3') {
      // Frame both Dad looking up and the wobbling fan
      return { x: 1200, y: 580, width: 1350, height: 920 };
    }
    if (feat === 'roo-4') {
      // Frame wet bedspread and Dad's shock
      return { x: 1180, y: 620, width: 1350, height: 920 };
    }
    if (feat === 'roo-5') {
      // Close sympathetic framing on Joey 5's nose and comforting Dad
      return { x: 1280, y: 650, width: 1200, height: 900 };
    }
  }

  if (beat === 'trampoline') {
    // Perfectly centered, wide cinematic framing of the entire active garden trampoline and parents
    return { x: 960, y: 540, width: 1920, height: 1080 };
  }

  if (beat === 'family-finale') {
    return { x: 960, y: 540, width: 1920, height: 1080 };
  }

  if (beat === 'establish' && scene.camera?.shot !== 'wide' && scene.camera?.move === 'pan-right' && scene.story?.actorIds.includes('dad')) {
    return { x: 1420, y: 650, width: 1100, height: 900 };
  }

  return STORY_FOCUS[beat];
}

/**
 * SVG world only: the caller owns camera transforms, dissolves, captions and count UI.
 */
export function StoryScene({
  project,
  scene,
  timeSec,
  backdropTransform,
  foregroundTransform,
}: {
  project: EpisodeProject;
  scene: Scene;
  timeSec: number;
  backdropTransform?: string;
  foregroundTransform?: string;
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
  const mouthFor = (id: string) => (id === speaker ? cue?.value ?? 'X' : 'X');

  // Bed group helper
  const bedGroup = (pose: 'idle' | 'bounce' | 'wave' | 'sleep' | 'moonwalk' = 'idle', excludeFeatured = false) =>
    scene.characterIds
      .filter(id => !excludeFeatured || id !== featuredCharacterId)
      .map(id => (
        <RooPuppet
          key={id}
          id={id}
          x={bedX(id)}
          y={745}
          scale={0.78}
          time={time}
          pose={pose}
          reducedMotion={reducedMotion}
          mouth={mouthFor(id)}
          mouthProgress={cueProgress}
        />
      ));

  // Father Kangaroo helper
  const father = (
    pose: 'idle' | 'surprised' | 'phone' | 'point' | 'wave' = 'idle',
    yOffset = 0,
    squashX = 1,
    squashY = 1
  ) =>
    actors.has('dad') ? (
      <RooPuppet
        actor="dad"
        x={1470}
        y={915 + yOffset}
        scale={1.2}
        time={time}
        pose={pose}
        expression={pose === 'surprised' ? 'surprised' : pose === 'phone' ? 'thoughtful' : 'happy'}
        reducedMotion={reducedMotion}
        mouth={mouthFor('dad')}
        mouthProgress={cueProgress}
        squashX={squashX}
        squashY={squashY}
      />
    ) : null;

  // Continuous bedroom cat beside Dad (zero overlap)
  const bedroomCat = (startled = false, pose?: 'sleep' | 'awake' | 'startled') =>
    !isClinic && !isGarden ? (
      <CatPuppet x={1640} y={930} scale={0.75} time={time} startled={startled} pose={pose} reducedMotion={reducedMotion} />
    ) : null;

  // Professional specialist kangaroo in advisory shots
  const clinicActor = (scene.story?.actorIds.find(a =>
    ['doctor', 'vet', 'handyman', 'laundry', 'dentist'].includes(a)
  ) ?? (beatId === 'dentist' ? 'dentist' : 'doctor')) as Exclude<StoryActorId, 'cat'>;

  // Determine ceiling fan condition in bedroom scenes
  const hasCeilingFan = !isClinic && !isGarden;
  const isFanIncident = (featuredCharacterId === 'roo-3' && (beatId === 'leap' || beatId === 'dad-reaction' || beatId === 'dad-phone'));
  const fanWobble = isFanIncident && !reducedMotion ? Math.sin(time * 11) * Math.exp(-time * 0.8) * 14 : 0;
  const isFanDamaged = featuredCharacterId === 'roo-3' && (beatId === 'dad-reaction' || beatId === 'dad-phone');

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
      const anticipation = !reducedMotion && progress >= 0.08 && progress < 0.28 ? Math.sin(((progress - 0.08) / 0.20) * Math.PI) : 0;
      const point = getVerseActionTrajectory(scene, flight);
      const crouchY = anticipation * 18;
      const feat = featuredCharacterId;

      // Toy airplane flight during Verse 3
      const isToyToss = feat === 'roo-3' && flight >= 0.40;
      const toyT = isToyToss ? (flight - 0.40) / 0.60 : 0;
      const toyX = 880 + (FAN_X - 880) * toyT;
      const toyY = 465 - (465 - (FAN_Y + 30)) * toyT;
      const toyRot = isToyToss ? -35 + toyT * 70 : 0;

      action = (
        <>
          {bedGroup('bounce', true)}
          {father(feat === 'roo-1' && flight > 0.85 ? 'surprised' : feat === 'roo-3' && isToyToss ? 'point' : 'idle')}
          {bedroomCat()}

          {/* Featured kangaroo in action */}
          <RooPuppet
            id={feat}
            x={point.x}
            y={point.y + crouchY}
            scale={feat === 'roo-1' ? 0.78 - 0.1 * flight : 0.74}
            time={time}
            pose={feat === 'roo-5' ? 'bounce' : flight > 0 ? 'leap' : 'bounce'}
            rotation={reducedMotion || flight === 0 ? 0 : point.rotation}
            reducedMotion={reducedMotion}
            mouth={mouthFor(feat)}
            mouthProgress={cueProgress}
            shadow={flight === 0 || feat === 'roo-5'}
            squashX={point.squashX}
            squashY={point.squashY}
          />

          {/* Flying toy airplane in Verse 3 */}
          {feat === 'roo-3' ? (
            <ToyAirplane x={isToyToss ? toyX : point.x + 22} y={isToyToss ? toyY : point.y - 15} rotation={toyRot} scale={0.8} />
          ) : null}
        </>
      );
      break;
    }

    case 'dad-reaction': {
      const feat = featuredCharacterId;
      const point = getVerseActionTrajectory(scene, progress);
      const isRoo1 = feat === 'roo-1';
      const isHeadBonk = isRoo1 && progress < 0.28;
      const isLanded = isRoo1 ? progress >= 0.65 : true;

      const contactTime = Math.max(0, time);
      const dadImpact = reducedMotion ? 0 : Math.sin(contactTime * 11) * Math.exp(-contactTime * 3.5);
      const dadSquashY = isHeadBonk ? 1 - Math.max(0, dadImpact) * 0.12 : 1;
      const dadSquashX = 2 - dadSquashY;
      const dadHeadOffset = isHeadBonk ? Math.max(0, dadImpact) * 16 : 0;

      // Dad pose depending on the incident
      const dadPose = isRoo1
        ? 'surprised'
        : feat === 'roo-3'
          ? 'point' // Looking and pointing up at ceiling fan
          : feat === 'roo-4'
            ? 'surprised' // Shocked at soaked bedspread
            : feat === 'roo-5'
              ? 'idle' // Crouching down with sympathy for bumped nose
              : 'surprised';

      action = (
        <>
          {bedGroup('idle', true)}

          {/* Water splash on bedspread in Verse 2 */}
          {feat === 'roo-4' ? <BedspreadWaterSplash x={BED_CENTER_X} y={BED_CENTER_Y} progress={progress} /> : null}

          {/* Father Kangaroo */}
          {father(dadPose, dadHeadOffset, dadSquashX, dadSquashY)}
          {bedroomCat(false, isHeadBonk ? 'awake' : 'sleep')}

          {/* Featured Kangaroo */}
          <RooPuppet
            id={feat}
            x={point.x}
            y={point.y + dadHeadOffset}
            scale={0.68}
            time={time}
            pose={isHeadBonk ? 'idle' : 'idle'}
            rotation={reducedMotion ? 0 : point.rotation}
            reducedMotion={reducedMotion}
            mouth={mouthFor(feat)}
            mouthProgress={cueProgress}
            shadow={isLanded && feat !== 'roo-3' && feat !== 'roo-4'}
          />

          {/* Verse 1 Bumped Nose Effect */}
          {feat === 'roo-5' ? <BumpedNoseEffect x={point.x + 61} y={point.y - 180} progress={progress} /> : null}

          {/* Verse 3 Clattered Toy Airplane on floor/trunk */}
          {feat === 'roo-3' ? <ToyAirplane x={1260} y={930} rotation={28} scale={0.75} /> : null}

          {/* Verse 5 Sparkles atop Dad's head & rug */}
          {isHeadBonk ? (
            <>
              <Sparkle x={DAD_HEAD_X - 70} y={DAD_HEAD_Y - 40} scale={0.85} />
              <Sparkle x={DAD_HEAD_X + 70} y={DAD_HEAD_Y - 55} scale={0.8} />
              <Sparkle x={DAD_HEAD_X - 15} y={DAD_HEAD_Y - 110} scale={1.0} />
            </>
          ) : isLanded && isRoo1 ? (
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

    case 'cat-reaction':
      action = (
        <>
          {bedGroup('bounce')}

          {/* Cat startles, leaps up with paws out and cute alert marks */}
          {bedroomCat(true, 'startled')}
          <g transform="translate(1640 720)" stroke="#c09b63" strokeWidth="7" fill="none" strokeLinecap="round">
            <path d="M-90 9 L-109-9 M-40-15 L-44-41 M42-20 L48-47" />
          </g>

          {/* Joey 2 seated on floor beside cat rubbing tummy apologetically */}
          <RooPuppet id="roo-2" x={CAT_RUG_X} y={CAT_RUG_Y} scale={0.68} time={time} pose="idle" reducedMotion={reducedMotion} />

          {/* Dad gasps at near miss */}
          {father('surprised')}
        </>
      );
      break;

    case 'dad-phone': {
      const feat = featuredCharacterId;
      // Where does the featured joey wait during the phone call?
      const waitX = feat === 'roo-3' ? bedX('roo-3') : feat === 'roo-4' ? BED_CENTER_X : feat === 'roo-2' ? CAT_RUG_X : RUG_X;
      const waitY = feat === 'roo-3' ? 745 : feat === 'roo-4' ? BED_CENTER_Y : feat === 'roo-2' ? CAT_RUG_Y : RUG_Y;

      action = (
        <>
          {bedGroup('idle', true)}
          {feat === 'roo-4' ? <BedspreadWaterSplash x={BED_CENTER_X} y={BED_CENTER_Y} progress={1.0} /> : null}
          {father('phone')}
          {bedroomCat()}

          {!scene.characterIds.includes(feat) ? (
            <RooPuppet id={feat} x={waitX} y={waitY} scale={0.68} time={time} pose="idle" reducedMotion={reducedMotion} />
          ) : null}

          {/* Red nose still glowing in Verse 1 */}
          {feat === 'roo-5' ? <BumpedNoseEffect x={waitX + 8} y={waitY - 105} progress={progress} /> : null}
        </>
      );
      break;
    }

    case 'doctor-advice':
    case 'dentist': {
      const adviceMode = beatId === 'dentist' || speaker === clinicActor;
      action = (
        <>
          {actors.has(clinicActor) ? (
            <RooPuppet
              actor={clinicActor}
              x={985}
              y={932}
              scale={1.35}
              time={time}
              pose={adviceMode ? 'point' : 'phone'}
              reducedMotion={reducedMotion}
              mouth={mouthFor(clinicActor)}
              mouthProgress={cueProgress}
            />
          ) : null}
        </>
      );
      break;
    }

    case 'empty-bed':
      action = (
        <>
          {father('point')}
          {bedroomCat()}
        </>
      );
      break;

    case 'trampoline': {
      // Dynamic, beautifully organized screen staging for the garden trampoline:
      // 5 Children in 2 distinct depth planes bouncing at varied heights and natural phase offsets!
      const trampolineKids = [
        // id, baseX, baseY, scale, jumpHeight, phaseOffset, depth layer
        { id: 'roo-1', x: 960,  baseY: 775, scale: 0.82, jumpH: 290, phase: 0.0, layer: 'front' }, // Center lead, rocket leap!
        { id: 'roo-2', x: 740,  baseY: 735, scale: 0.70, jumpH: 260, phase: 1.3, layer: 'back'  }, // Deep sky left, flip/tuck
        { id: 'roo-3', x: 570,  baseY: 775, scale: 0.78, jumpH: 210, phase: 2.6, layer: 'front' }, // Mid-left, side-kick
        { id: 'roo-4', x: 1180, baseY: 735, scale: 0.70, jumpH: 250, phase: 3.9, layer: 'back'  }, // Deep sky right, star jump
        { id: 'roo-5', x: 1350, baseY: 775, scale: 0.76, jumpH: 200, phase: 5.2, layer: 'front' }, // Mid-right, sweet giggles
      ];

      const renderTrampolineKid = (k: typeof trampolineKids[0]) => {
        const bounceTime = reducedMotion ? 0 : time * 4.4 + k.phase;
        const sinB = Math.sin(bounceTime);
        const inAir = sinB > 0;
        const jumpY = inAir ? sinB * k.jumpH : 0;
        const currentY = k.baseY - jumpY;
        const squashY = reducedMotion ? 1 : inAir ? (sinB > 0.85 ? 1.0 : 1.08) : 1 - Math.abs(sinB) * 0.16;
        const squashX = reducedMotion ? 1 : 2 - squashY;
        const pose = inAir ? (sinB > 0.75 ? 'leap' : 'bounce') : 'idle';

        return (
          <RooPuppet
            key={k.id}
            id={k.id}
            x={k.x}
            y={currentY}
            scale={k.scale}
            time={time}
            pose={pose}
            reducedMotion={reducedMotion}
            mouth={mouthFor(k.id)}
            mouthProgress={cueProgress}
            shadow={!inAir}
            squashX={squashX}
            squashY={squashY}
          />
        );
      };

      action = (
        <>
          {/* Back depth layer jumpers */}
          {trampolineKids.filter(k => k.layer === 'back').map(renderTrampolineKid)}

          {/* Front depth layer jumpers */}
          {trampolineKids.filter(k => k.layer === 'front').map(renderTrampolineKid)}

          {/* Mommy Kangaroo on Stage Left lawn, gesturing toward kids and calling to Dad */}
          {actors.has('mum') ? (
            <RooPuppet
              actor="mum"
              x={260}
              y={940}
              scale={1.05}
              time={time}
              pose="point"
              reducedMotion={reducedMotion}
              mouth={mouthFor('mum')}
              mouthProgress={cueProgress}
            />
          ) : null}

          {/* Daddy Kangaroo on Stage Right lawn, relaxed, smiling, delivering gentle punchline */}
          {actors.has('dad') ? (
            <RooPuppet
              actor="dad"
              x={1540}
              y={930}
              scale={1.10}
              time={time}
              pose="idle"
              reducedMotion={reducedMotion}
              mouth={mouthFor('dad')}
              mouthProgress={cueProgress}
            />
          ) : null}

          {/* Grounded Pet Cat on sunny grass near Mommy */}
          <CatPuppet x={390} y={960} scale={0.65} time={time} pose="awake" reducedMotion={reducedMotion} />

          {/* Fluttering Garden Butterfly */}
          <GardenButterfly x={430 + Math.sin(time * 3) * 25} y={920 + Math.cos(time * 4) * 18} time={time} />
        </>
      );
      break;
    }

    case 'family-finale': {
      // Grand celebratory finale on the sunny garden lawn!
      // All 5 children in a joyful arc in front of the trampoline, waving warmly
      // Mommy on left, Daddy on right, Cat purring on the grass
      const finaleKids = [
        { id: 'roo-3', x: 620,  y: 840, scale: 0.74 },
        { id: 'roo-2', x: 790,  y: 830, scale: 0.75 },
        { id: 'roo-1', x: 960,  y: 820, scale: 0.82 }, // Eldest leader center
        { id: 'roo-4', x: 1130, y: 830, scale: 0.75 },
        { id: 'roo-5', x: 1300, y: 840, scale: 0.74 },
      ];

      action = (
        <>
          {/* 5 Children in celebratory waving arc */}
          {finaleKids.map((k, idx) => (
            <RooPuppet
              key={k.id}
              id={k.id}
              x={k.x}
              y={k.y + (reducedMotion ? 0 : Math.sin(time * 3.5 + idx * 0.7) * 4)}
              scale={k.scale}
              time={time}
              pose="wave"
              reducedMotion={reducedMotion}
              mouth={k.id === 'roo-1' ? cue?.value ?? 'X' : 'X'}
              mouthProgress={cueProgress}
            />
          ))}

          {/* Mommy Kangaroo on Stage Left lawn, waving happily */}
          {actors.has('mum') ? (
            <RooPuppet
              actor="mum"
              x={260}
              y={940}
              scale={1.05}
              time={time}
              pose="wave"
              reducedMotion={reducedMotion}
              mouth={mouthFor('mum')}
              mouthProgress={cueProgress}
            />
          ) : null}

          {/* Daddy Kangaroo on Stage Right lawn, delivering final line & waving */}
          {actors.has('dad') ? (
            <RooPuppet
              actor="dad"
              x={1540}
              y={930}
              scale={1.10}
              time={time}
              pose="wave"
              reducedMotion={reducedMotion}
              mouth={mouthFor('dad')}
              mouthProgress={cueProgress}
            />
          ) : null}

          {/* Grounded Pet Cat on sunny grass */}
          <CatPuppet x={390} y={960} scale={0.65} time={time} pose="awake" reducedMotion={reducedMotion} />

          {/* Fluttering Garden Butterfly */}
          <GardenButterfly x={430 + Math.sin(time * 3) * 25} y={920 + Math.cos(time * 4) * 18} time={time} />

          {/* Joyful celebration sparkles in the sunny sky */}
          <Sparkle x={960} y={320} scale={1.2} />
          <Sparkle x={780} y={360} scale={0.9} />
          <Sparkle x={1140} y={350} scale={0.95} />
          <Sparkle x={520} y={420} scale={0.8} />
          <Sparkle x={1400} y={410} scale={0.8} />
        </>
      );
      break;
    }

    default:
      action = (
        <>
          {bedGroup('idle')}
          {father('idle')}
          {bedroomCat()}
        </>
      );
  }

  return (
    <g data-story-beat={beatId}>
      <defs>
        <linearGradient id="story-sky" x2="0" y2="1">
          <stop stopColor="#e1eee7" />
          <stop offset="1" stopColor="#f9f1d7" />
        </linearGradient>
      </defs>

      <g transform={backdropTransform}>
        {isGarden ? (
          <GardenBackdrop />
        ) : isClinic ? (
          <StoryClinicSet />
        ) : scene.backgroundId === 'meadow-day' ? (
          <MeadowBackdrop />
        ) : (
          <StoryBedroomSet />
        )}
      </g>

      {/* Bedroom Ceiling Fan overlay */}
      {hasCeilingFan ? (
        <CeilingFan x={FAN_X} y={FAN_Y} wobble={fanWobble} isDamaged={isFanDamaged} />
      ) : null}

      {/* Main Animated Action Layer */}
      {action}

      {/* Foreground Layer */}
      {isClinic ? null : (
        <g transform={foregroundTransform}>
          {isGarden ? (
            <GardenForeground />
          ) : scene.backgroundId === 'meadow-day' ? (
            <MeadowForeground />
          ) : (
            <StoryBedForeground />
          )}
        </g>
      )}
    </g>
  );
}
