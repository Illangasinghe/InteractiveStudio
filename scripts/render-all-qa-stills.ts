import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { EpisodeProjectSchema } from '../packages/core/index';
import fs from 'node:fs';

const browserExecutable = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const project = EpisodeProjectSchema.parse(
  JSON.parse(fs.readFileSync('data/projects/five-little-kangaroos-story-draft/project.json', 'utf-8'))
);

console.log('Bundling Remotion entry point...');
const serveUrl = await bundle({ entryPoint: path.resolve('renderer/index.ts') });
console.log('Bundle ready. Selecting composition...');

const inputProps = { project, baseUrl: 'http://127.0.0.1:4310', diagnostic: false, durationSec: project.durationSec };

const composition = await selectComposition({
  serveUrl,
  id: 'InteractiveStudio',
  inputProps,
  browserExecutable,
  logLevel: 'error',
});

console.log(`Composition: ${composition.id}, ${composition.width}x${composition.height}, duration=${composition.durationInFrames} frames`);

const stills = [
  { name: 'full_shot01_establish', frame: 45, label: 'Verse 5 - Establish bedroom with Dad idle strip, grounded Cat & ceiling fan' },
  { name: 'full_shot02_v5_head_landing', frame: 430, label: 'Verse 5 - Joey 1 landed on Dad head (bonk & sparkles)' },
  { name: 'full_shot03_v4_flip', frame: 915, label: 'Verse 4 - Joey 2 acrobatic 360 backflip' },
  { name: 'full_shot04_v4_cat_reaction', frame: 975, label: 'Verse 4 - Joey 2 lands beside cat, Cat startles with alert lines' },
  { name: 'full_shot05_v3_toy_toss', frame: 1475, label: 'Verse 3 - Joey 3 leaps tossing toy airplane up toward fan' },
  { name: 'full_shot06_v3_fan_reaction', frame: 1535, label: 'Verse 3 - Ceiling fan wobbles with impact stars, Dad points UP in shock' },
  { name: 'full_shot07_v2_cannonball', frame: 2030, label: 'Verse 2 - Joey 4 round cannonball tuck jump' },
  { name: 'full_shot08_v2_splash_reaction', frame: 2100, label: 'Verse 2 - Giant water splash, soaked bedspread, Dad in shock' },
  { name: 'full_shot09_v1_moonwalk', frame: 2560, label: 'Verse 1 - Joey 5 backward moonwalk slide along floor' },
  { name: 'full_shot10_v1_bump_nose', frame: 2620, label: 'Verse 1 - Joey 5 rubs rosy red nose with stars, Dad comforts her' },
  { name: 'full_shot11_garden_trampoline', frame: 3210, label: 'Finale - Dynamic 2-layer garden trampoline, Mommy & Daddy framed' },
  { name: 'full_shot12_family_finale', frame: 3600, label: 'Finale - Full family celebration on sunny lawn' },
];

const outDir = 'C:/Users/indun/.gemini/antigravity/brain/d8e47d41-7ee2-4f3b-b56e-c674d1d1a0d3';

for (const still of stills) {
  const outPath = path.resolve(`${outDir}/${still.name}.png`);
  console.log(`Rendering ${still.label} (frame ${still.frame})...`);
  await renderStill({
    composition,
    serveUrl,
    output: outPath,
    inputProps,
    frame: still.frame,
    browserExecutable,
    scale: 1,
    logLevel: 'error',
  });
  console.log(`  Saved: ${outPath}`);
}

console.log('All QA stills rendered successfully!');
