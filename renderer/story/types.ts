export type StoryBeatId = 'establish' | 'bed-bounce' | 'leap' | 'dad-reaction' | 'dad-phone' | 'doctor-advice' | 'cat-reaction' | 'toy-fan' | 'handyman' | 'splash' | 'laundry' | 'moonwalk' | 'dentist' | 'empty-bed' | 'trampoline' | 'family-finale';
export type StoryActorId = 'dad' | 'mum' | 'doctor' | 'vet' | 'handyman' | 'laundry' | 'dentist' | 'cat';
export type StoryDirective = { beatId: StoryBeatId; actorIds: StoryActorId[]; featuredCharacterId?: 'roo-1' | 'roo-2' | 'roo-3' | 'roo-4' | 'roo-5'; speakingActorId?: StoryActorId | 'roo-1' | 'roo-2' | 'roo-3' | 'roo-4' | 'roo-5' };
export type StoryFocus = { x: number; y: number; width: number; height: number };

/** x/y are the centre of each camera-safe focus rectangle in 1920×1080 world space. */
export const STORY_FOCUS: Record<StoryBeatId, StoryFocus> = {
  establish: { x: 960, y: 540, width: 1920, height: 1080 },
  'bed-bounce': { x: 960, y: 580, width: 1600, height: 950 },
  leap: { x: 1120, y: 540, width: 1540, height: 980 },
  'dad-reaction': { x: 1360, y: 620, width: 1100, height: 900 },
  'dad-phone': { x: 1360, y: 630, width: 1100, height: 900 },
  'doctor-advice': { x: 1050, y: 580, width: 1600, height: 1000 },
  'cat-reaction': { x: 1280, y: 650, width: 1200, height: 850 },
  'toy-fan': { x: 960, y: 480, width: 1530, height: 920 },
  handyman: { x: 1320, y: 640, width: 1100, height: 880 },
  splash: { x: 900, y: 650, width: 1450, height: 850 },
  laundry: { x: 1320, y: 640, width: 1100, height: 880 },
  moonwalk: { x: 860, y: 650, width: 1350, height: 850 },
  dentist: { x: 1050, y: 580, width: 1600, height: 1000 },
  'empty-bed': { x: 860, y: 620, width: 1500, height: 850 },
  trampoline: { x: 960, y: 540, width: 1920, height: 1080 },
  'family-finale': { x: 960, y: 540, width: 1920, height: 1080 },
};
