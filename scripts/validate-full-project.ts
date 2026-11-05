import fs from 'fs';
import { EpisodeProjectSchema } from '../packages/core/index';

const data = JSON.parse(fs.readFileSync('data/projects/five-little-kangaroos-story-draft/project.json', 'utf-8'));
const parsed = EpisodeProjectSchema.safeParse(data);
if (!parsed.success) {
  console.error('Validation errors:', JSON.stringify(parsed.error.issues, null, 2));
  process.exit(1);
} else {
  console.log('SUCCESS: project.json is 100% VALID according to EpisodeProjectSchema!');
}
