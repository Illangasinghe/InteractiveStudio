import { z } from 'zod';

export const CHARACTER_IDS = ['roo-1', 'roo-2', 'roo-3', 'roo-4', 'roo-5'] as const;
export const MOTION_IDS = ['idle', 'bounce', 'jump', 'wave'] as const;
export const MOUTH_SHAPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'X'] as const;
export const BACKGROUND_IDS = ['meadow-day', 'bedroom-day', 'garden-day', 'clinic-day'] as const;
export const STORY_BEAT_IDS = ['establish', 'bed-bounce', 'leap', 'dad-reaction', 'dad-phone', 'doctor-advice', 'cat-reaction', 'empty-bed', 'trampoline', 'family-finale'] as const;
export const ACTOR_IDS = ['dad', 'mum', 'doctor', 'vet', 'handyman', 'laundry', 'dentist', 'cat'] as const;
export const STORY_ACTOR_OPTIONS: Record<typeof STORY_BEAT_IDS[number], readonly typeof ACTOR_IDS[number][]> = {
  establish: ['dad'], 'bed-bounce': ['dad', 'cat'], leap: ['dad'], 'dad-reaction': ['dad'], 'dad-phone': ['dad'],
  'doctor-advice': ['doctor', 'vet', 'handyman', 'laundry', 'dentist'], 'cat-reaction': ['dad', 'cat'], 'empty-bed': ['dad'], trampoline: ['dad', 'mum'], 'family-finale': ['dad', 'mum'],
};
export const CAMERA_SHOTS = ['wide', 'medium', 'close', 'detail'] as const;
export const CAMERA_MOVES = ['locked', 'push-in', 'pull-out', 'pan-left', 'pan-right', 'follow-action'] as const;

const id = z.string().min(1).max(100).regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/, 'Use a URL-safe identifier.');
const seconds = z.number().finite().nonnegative();
const characterId = z.enum(CHARACTER_IDS);

export const SceneSchema = z.object({
  id,
  title: z.string().trim().min(1).max(200),
  startSec: seconds,
  endSec: seconds,
  backgroundId: z.enum(BACKGROUND_IDS),
  characterIds: z.array(characterId).max(5),
  actionId: z.enum(MOTION_IDS),
  visibleCount: z.number().int().min(0).max(5).optional(),
  caption: z.string().max(120, 'Keep each on-screen caption under 120 characters.'),
  story: z.object({
    beatId: z.enum(STORY_BEAT_IDS),
    actorIds: z.array(z.enum(ACTOR_IDS)).max(8).refine(ids => new Set(ids).size === ids.length, 'Each supporting actor must be unique.'),
    featuredCharacterId: characterId.optional(),
    speakingActorId: z.enum([...CHARACTER_IDS, ...ACTOR_IDS]).optional(),
  }).strict().optional(),
  camera: z.object({
    shot: z.enum(CAMERA_SHOTS),
    move: z.enum(CAMERA_MOVES),
    intensity: z.number().finite().min(0).max(1),
  }).strict().optional(),
  transition: z.enum(['cut', 'dissolve']).optional(),
  timingStatus: z.enum(['draft', 'reviewed']).optional(),
}).strict();

export const MouthCueSchema = z.object({
  startSec: seconds,
  endSec: seconds,
  value: z.enum(MOUTH_SHAPES),
}).strict();

const ProjectShapeSchema = z.object({
  schemaVersion: z.literal(1),
  id,
  title: z.string().trim().min(1).max(200),
  mode: z.enum(['song', 'story']),
  durationSec: z.number().finite().positive().max(3600),
  fps: z.literal(30),
  seed: z.number().int().nonnegative().max(2147483647),
  revision: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  learningObjective: z.string().max(2000),
  transcript: z.string().max(100000),
  audio: z.object({
    master: z.string().regex(/^audio\/[a-f0-9]{64}\.(wav|mp3)$/, 'Audio must reference an imported project audio file.').optional(),
    originalName: z.string().max(255).optional(),
  }).strict(),
  scenes: z.array(SceneSchema).min(1).max(1000),
  mouthCues: z.array(MouthCueSchema).max(100000),
  preferences: z.object({
    reducedMotion: z.boolean(),
    captions: z.boolean(),
    pace: z.enum(['standard', 'slow']),
  }).strict(),
  rights: z.object({
    source: z.string().max(2000),
    notes: z.string().max(10000),
    confirmed: z.boolean(),
  }).strict(),
  review: z.object({ contentApproved: z.boolean() }).strict(),
}).strict();

const EPSILON = 0.000001;

export const EpisodeProjectSchema = ProjectShapeSchema.superRefine((project, context) => {
  const sceneIds = new Set<string>();
  let nextStart = 0;
  for (const [index, scene] of project.scenes.entries()) {
    const add = (field: string, message: string) => context.addIssue({ code: 'custom', path: ['scenes', index, field], message });
    if (sceneIds.has(scene.id)) add('id', 'Scene identifiers must be unique.');
    sceneIds.add(scene.id);
    if (scene.endSec <= scene.startSec) add('endSec', 'A scene must end after it starts.');
    if (scene.endSec > project.durationSec + EPSILON) add('endSec', 'A scene cannot extend beyond the episode.');
    if (Math.abs(scene.startSec - nextStart) > EPSILON) add('startSec', 'Scenes must be ordered and cover the timeline without gaps or overlaps.');
    nextStart = scene.endSec;
    if (new Set(scene.characterIds).size !== scene.characterIds.length) add('characterIds', 'Each visible character must have a unique identifier.');
    if (scene.visibleCount !== undefined && scene.visibleCount !== scene.characterIds.length) add('visibleCount', 'The displayed count must equal the number of visible characters.');
    if (scene.story?.speakingActorId && ![...scene.characterIds, ...scene.story.actorIds, scene.story.featuredCharacterId].includes(scene.story.speakingActorId)) add('story', 'The speaking character must be present in this shot.');
    if (scene.story) {
      const allowedActors = new Set<string>(STORY_ACTOR_OPTIONS[scene.story.beatId]);
      if (scene.story.actorIds.some(actor => !allowedActors.has(actor))) add('story', 'A supporting character has no staging for this story moment. Choose a character supported by the shot.');
      if (scene.story.featuredCharacterId && !scene.characterIds.includes(scene.story.featuredCharacterId) && !['leap', 'dad-reaction', 'dad-phone'].includes(scene.story.beatId)) add('story', 'A separate action kangaroo needs a leap, reaction or phone shot.');
      if (['empty-bed', 'doctor-advice'].includes(scene.story.beatId) && scene.characterIds.length > 0) add('characterIds', 'The empty-bed and doctor cutaway shots cannot contain a counted group of child kangaroos.');
      const requiredSet = scene.story.beatId === 'doctor-advice' ? 'clinic-day' : ['trampoline', 'family-finale'].includes(scene.story.beatId) ? 'garden-day' : 'bedroom-day';
      if (scene.backgroundId !== requiredSet) add('backgroundId', 'Choose the set required by this staged story moment.');
    }
  }
  if (Math.abs(nextStart - project.durationSec) > EPSILON) context.addIssue({ code: 'custom', path: ['scenes'], message: 'The last scene must end at the episode duration.' });

  let cueEnd = 0;
  for (const [index, cue] of project.mouthCues.entries()) {
    if (cue.endSec <= cue.startSec) context.addIssue({ code: 'custom', path: ['mouthCues', index, 'endSec'], message: 'A mouth cue must end after it starts.' });
    if (cue.startSec < cueEnd - EPSILON) context.addIssue({ code: 'custom', path: ['mouthCues', index, 'startSec'], message: 'Mouth cues must be ordered and cannot overlap.' });
    if (cue.endSec > project.durationSec + EPSILON) context.addIssue({ code: 'custom', path: ['mouthCues', index, 'endSec'], message: 'A mouth cue cannot extend beyond the episode.' });
    cueEnd = cue.endSec;
  }
});

export type EpisodeProject = z.infer<typeof EpisodeProjectSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type MouthCue = z.infer<typeof MouthCueSchema>;
export type PreflightIssue = { code: string; message: string; severity: 'error' | 'warning' };

export function preflightProject(project: EpisodeProject): PreflightIssue[] {
  const issues: PreflightIssue[] = [];
  const parsed = EpisodeProjectSchema.safeParse(project);
  if (!parsed.success) {
    return parsed.error.issues.map((issue) => ({ code: 'invalid-project', severity: 'error', message: `${issue.path.join('.')}: ${issue.message}` }));
  }
  if (!project.audio.master) issues.push({ code: 'missing-audio', severity: 'error', message: 'Import an approved master WAV or MP3 before rendering an episode.' });
  if (!project.transcript.trim()) issues.push({ code: 'missing-transcript', severity: 'error', message: 'Add the verified lyrics or narration transcript.' });
  if (!project.rights.source.trim()) issues.push({ code: 'missing-rights-source', severity: 'error', message: 'Record the source and rights basis for the audio and artwork.' });
  if (!project.rights.confirmed) issues.push({ code: 'rights-unconfirmed', severity: 'error', message: 'An adult must confirm permission to use the audio and artwork.' });
  if (!project.review.contentApproved) issues.push({ code: 'review-required', severity: 'error', message: 'Review the complete preview and explicitly approve its content before export.' });
  if (!project.mouthCues.length) issues.push({ code: 'missing-mouth-cues', severity: 'warning', message: 'No mouth cues are present. The character will use its idle mouth.' });
  if (!project.learningObjective.trim()) issues.push({ code: 'missing-objective', severity: 'warning', message: 'Add one clear learning objective for editorial review.' });
  if (project.scenes.some(scene => scene.story && scene.timingStatus !== 'reviewed')) issues.push({ code: 'story-timing-draft', severity: 'warning', message: 'Check each story shot against the performed phrase. Some shot timings are still draft suggestions.' });
  return issues;
}

export function createBlankProject(title: string, mode: 'song' | 'story' = 'song'): EpisodeProject {
  const timestamp = new Date().toISOString();
  return EpisodeProjectSchema.parse({
    schemaVersion: 1,
    id: globalThis.crypto.randomUUID(),
    title: title.trim() || 'Untitled episode',
    mode,
    durationSec: 24,
    fps: 30,
    seed: 73,
    revision: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    learningObjective: '',
    transcript: '',
    audio: {},
    scenes: [{ id: 'scene-1', title: 'Opening scene', startSec: 0, endSec: 24, backgroundId: 'meadow-day', characterIds: ['roo-1'], actionId: 'idle', caption: '' }],
    mouthCues: [],
    preferences: { reducedMotion: false, captions: true, pace: 'standard' },
    rights: { source: '', notes: '', confirmed: false },
    review: { contentApproved: false },
  });
}

export function createDemoProject(): EpisodeProject {
  return EpisodeProjectSchema.parse({
    ...createBlankProject('Five little kangaroos'),
    id: 'five-little-kangaroos-demo',
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
    learningObjective: 'Explore counting from five to four through one clear visual change.',
    scenes: [
      { id: 'meet-the-roos', title: 'Meet the kangaroos', startSec: 0, endSec: 8, backgroundId: 'meadow-day', characterIds: [...CHARACTER_IDS], actionId: 'bounce', visibleCount: 5, caption: 'Five little kangaroos' },
      { id: 'count-four', title: 'One hops away', startSec: 8, endSec: 16, backgroundId: 'meadow-day', characterIds: ['roo-2', 'roo-3', 'roo-4', 'roo-5'], actionId: 'jump', visibleCount: 4, caption: 'One hops away. How many stay?' },
      { id: 'four-together', title: 'Count together', startSec: 16, endSec: 24, backgroundId: 'meadow-day', characterIds: ['roo-2', 'roo-3', 'roo-4', 'roo-5'], actionId: 'wave', visibleCount: 4, caption: 'Four kangaroos in the meadow' },
    ],
    mouthCues: [
      { startSec: 0.4, endSec: 0.8, value: 'B' },
      { startSec: 0.8, endSec: 1.4, value: 'D' },
      { startSec: 1.4, endSec: 1.8, value: 'C' },
      { startSec: 1.8, endSec: 2.4, value: 'F' },
      { startSec: 2.4, endSec: 3, value: 'X' },
    ],
    rights: { source: '', notes: 'Illustrated technical demo only. No song or approved audio is included. The sample mouth cues are manually authored placeholders and have not been aligned to audio.', confirmed: false },
  });
}
