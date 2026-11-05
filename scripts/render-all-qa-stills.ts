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
  { name: 'full_shot01_establish', frame: 45, label: 'Verse 5 - Establish bedroom with Dad idle strip & grounded Cat' },
  { name: 'full_shot02_v5_doctor', frame: 645, label: 'Verse 5 - Doctor Kangaroo solid white coat advice' },
  { name: 'full_shot03_v4_bounce', frame: 810, label: 'Verse 4 - 4 Kangaroos bouncing, Dad & Cat' },
  { name: 'full_shot04_v4_cat_reaction', frame: 975, label: 'Verse 4 - Joey 2 flip, Cat startle reaction' },
  { name: 'full_shot05_v4_vet', frame: 1200, label: 'Verse 4 - Vet Kangaroo advice' },
  { name: 'full_shot06_v3_handyman', frame: 1770, label: 'Verse 3 - Handyman Kangaroo advice' },
  { name: 'full_shot07_v2_laundry', frame: 2340, label: 'Verse 2 - Laundry Specialist Kangaroo advice' },
  { name: 'full_shot08_v1_dentist', frame: 2880, label: 'Verse 1 - Dentist Kangaroo advice' },
  { name: 'full_shot09_empty_bed', frame: 3030, label: 'Finale - Empty bed discovery' },
  { name: 'full_shot10_garden_trampoline', frame: 3210, label: 'Finale - Garden trampoline all 5 children' },
  { name: 'full_shot11_family_finale', frame: 3600, label: 'Finale - Family celebration with Dad, Mum & all 5 children' },
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
