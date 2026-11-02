import path from 'node:path';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { EpisodeProjectSchema, createBlankProject } from '../packages/core/index';
import { FileProjectRepository } from '../server/repository';
import { analyseAudio } from '../server/audio';

const args = process.argv.slice(2);
const option = (name: string) => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const source = option('audio');
const lyrics = option('lyrics');
if (!source || !lyrics) throw new Error('Usage: npm run import:song -- --audio=FILE --lyrics=FILE [--title=TITLE] [--id=ID]');
const extension = path.extname(source).toLowerCase();
if (!['.mp3', '.wav'].includes(extension)) throw new Error('Choose an MP3 or WAV source.');
const dataDirectory = path.resolve(process.env.STUDIO_DATA_DIR || 'data');
const repository = new FileProjectRepository(dataDirectory);
await repository.initialize();
const [bytes, transcript, analysis] = await Promise.all([readFile(source), readFile(lyrics, 'utf8'), analyseAudio(path.resolve(source))]);
const sha256 = createHash('sha256').update(bytes).digest('hex');
const title = option('title') || path.basename(source, extension);
const project = EpisodeProjectSchema.parse({
  ...createBlankProject(title),
  ...(option('id') ? { id: option('id') } : {}),
  durationSec: analysis.durationSec,
  audio: { master: `audio/${sha256}${extension}`, originalName: path.basename(source) },
  transcript,
  scenes: [{ id: 'audio-preparation', title: 'Full recording · storyboard pending', startSec: 0, endSec: analysis.durationSec, backgroundId: option('background') || 'meadow-day', characterIds: ['roo-1', 'roo-2', 'roo-3', 'roo-4', 'roo-5'], actionId: 'idle', caption: '' }],
  preferences: { reducedMotion: false, captions: false, pace: 'standard' },
  rights: { source: `User-supplied recording: ${path.basename(source)}; source and licence evidence pending.`, notes: 'Imported for private production preparation. Audio and lyrics have not been independently verified. Source permissions, scene timing and content require review.', confirmed: false },
});
if ((await repository.list()).some(item => item.id === project.id)) throw new Error(`Project ${project.id} already exists. Choose another --id to preserve it.`);
const directory = repository.projectDirectory(project.id);
await mkdir(path.join(directory, 'audio'), { recursive: true });
await writeFile(path.join(directory, project.audio.master!), bytes, { flag: 'wx' });
await writeFile(path.join(directory, 'lyrics.txt'), transcript, { flag: 'wx' });
await writeFile(path.join(directory, `${sha256}.analysis.json`), JSON.stringify(analysis, null, 2));
await writeFile(path.join(directory, 'audio_source.json'), JSON.stringify({ originalName: path.basename(source), importedAt: new Date().toISOString(), sourceSha256: sha256, importedSha256: sha256, bytes: bytes.length, durationSec: analysis.durationSec, source: 'user-supplied full mix', rightsStatus: 'unconfirmed', transcriptStatus: 'user-supplied; recording match requires review' }, null, 2));
await repository.create(project);
console.log(`Imported ${project.title}: ${project.durationSec.toFixed(2)} seconds.\nProject: ${path.join(directory, 'project.json')}\nRights and content approval remain unconfirmed.`);
