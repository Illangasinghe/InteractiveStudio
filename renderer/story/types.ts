export type StoryBeatId = 'establish' | 'bed-bounce' | 'leap' | 'dad-reaction' | 'dad-phone' | 'doctor-advice' | 'cat-reaction' | 'toy-fan' | 'handyman' | 'splash' | 'laundry' | 'moonwalk' | 'dentist' | 'empty-bed' | 'trampoline' | 'family-finale';
export type StoryActorId = 'dad' | 'mum' | 'doctor' | 'vet' | 'handyman' | 'laundry' | 'dentist' | 'cat';
export type StoryDirective = { beatId: StoryBeatId; actorIds: StoryActorId[]; featuredCharacterId?: 'roo-1' | 'roo-2' | 'roo-3' | 'roo-4' | 'roo-5'; speakingActorId?: StoryActorId | 'roo-1' | 'roo-2' | 'roo-3' | 'roo-4' | 'roo-5' };
export type StoryFocus = { x: number; y: number; width: number; height: number };

/** x/y are the centre of each camera-safe focus rectangle in 1920×1080 world space. */
export const STORY_FOCUS: Record<StoryBeatId, StoryFocus> = {
  establish: { x: 960, y: 540, width: 1920, height: 1080 },
  'bed-bounce': { x: 760, y: 610, width: 1450, height: 850 },
  leap: { x: 1150, y: 530, width: 1540, height: 980 },
  'dad-reaction': { x: 1490, y: 570, width: 840, height: 950 },
  'dad-phone': { x: 1475, y: 620, width: 800, height: 900 },
  'doctor-advice': { x: 1050, y: 560, width: 1600, height: 1000 },
  'cat-reaction': { x: 1340, y: 750, width: 1050, height: 620 },
  'toy-fan': { x: 890, y: 470, width: 1530, height: 920 },
  handyman: { x: 1400, y: 670, width: 980, height: 850 },
  splash: { x: 820, y: 680, width: 1450, height: 800 },
  laundry: { x: 1380, y: 660, width: 1000, height: 850 },
  moonwalk: { x: 760, y: 660, width: 1250, height: 800 },
  dentist: { x: 1050, y: 560, width: 1600, height: 1000 },
  'empty-bed': { x: 760, y: 650, width: 1500, height: 850 },
  trampoline: { x: 960, y: 570, width: 1840, height: 1000 },
  'family-finale': { x: 960, y: 540, width: 1920, height: 1080 },
};
