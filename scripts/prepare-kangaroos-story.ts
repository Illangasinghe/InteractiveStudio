import path from 'node:path';
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { FileProjectRepository } from '../server/repository';
import { EpisodeProjectSchema, CHARACTER_IDS, type Scene } from '../packages/core';
import { analyseAudio } from '../server/audio';

const repository = new FileProjectRepository(path.resolve(process.env.STUDIO_DATA_DIR || 'data'));
const original = await repository.get('five-little-kangaroos-001');
const id = 'five-little-kangaroos-story-draft';
if ((await repository.list()).some(project => project.id === id)) throw new Error('Story draft already exists. Preserve its edits; use the editor to refine it.');
const sourceDirectory = repository.projectDirectory(original.id);
const directory = repository.projectDirectory(id);
await mkdir(path.join(directory, 'audio'), { recursive: true });
await mkdir(path.join(directory, 'derived'), { recursive: true });
const source = JSON.parse(await readFile(path.join(sourceDirectory, 'audio_source.json'), 'utf8'));
const sourceFiles = [original.audio.master, source.stems?.vocals?.relativePath, source.stems?.other?.relativePath].filter(Boolean) as string[];
for (const relative of sourceFiles) {
  if (!/^audio\/[a-f0-9]{64}\.(mp3|wav)$/.test(relative)) throw new Error('Source archive contains an unsafe audio reference.');
  await copyFile(path.join(sourceDirectory, relative), path.join(directory, relative));
}
const derivedMaster = path.join(directory, 'derived', 'master-first30.wav');
await promisify(execFile)(process.env.FFMPEG_PATH || 'ffmpeg', ['-v', 'error', '-i', path.join(sourceDirectory, original.audio.master!), '-t', '30', '-vn', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', derivedMaster], { windowsHide: true, timeout: 60000 });
const bytes = await readFile(derivedMaster);
const hash = createHash('sha256').update(bytes).digest('hex');
const audioKey = `audio/${hash}.wav`;
await copyFile(derivedMaster, path.join(directory, audioKey));
const analysis = await analyseAudio(path.join(directory, audioKey));
const four = CHARACTER_IDS.slice(1);
function shot(id: string, title: string, startSec: number, endSec: number, beatId: NonNullable<Scene['story']>['beatId'], options: Partial<Scene> = {}): Scene {
  return { id, title, startSec, endSec, backgroundId: 'bedroom-day', characterIds: [...CHARACTER_IDS], actionId: 'idle', caption: '', story: { beatId, actorIds: ['dad'] }, camera: { shot: 'wide', move: 'locked', intensity: .35 }, transition: 'cut', timingStatus: 'draft', ...options };
}
const scenes: Scene[] = [
  shot('room-establish', 'A room full of possibilities', 0, 3.2, 'establish', { camera: { shot: 'wide', move: 'push-in', intensity: .35 } }),
  shot('daddy-notices', 'Daddy notices the little jumpers', 3.2, 6.99, 'establish', { camera: { shot: 'medium', move: 'pan-right', intensity: .25 } }),
  shot('five-on-the-bed', 'Five kangaroos on the bed', 6.99, 11.66, 'bed-bounce', { actionId: 'bounce', visibleCount: 5, camera: { shot: 'wide', move: 'locked', intensity: 0 } }),
  shot('the-big-leap', 'One takes a leap', 11.66, 13.36, 'leap', { story: { beatId: 'leap', actorIds: ['dad'], featuredCharacterId: 'roo-1' }, actionId: 'jump', camera: { shot: 'medium', move: 'follow-action', intensity: .5 } }),
  shot('daddy-surprised', 'A very surprised Daddy', 13.36, 16.37, 'dad-reaction', { characterIds: four, story: { beatId: 'dad-reaction', actorIds: ['dad'], featuredCharacterId: 'roo-1' }, camera: { shot: 'medium', move: 'push-in', intensity: .25 } }),
  shot('the-phone-call', 'Daddy calls the doctor', 16.37, 18.7, 'dad-phone', { characterIds: four, story: { beatId: 'dad-phone', actorIds: ['dad'], featuredCharacterId: 'roo-1' }, camera: { shot: 'close', move: 'locked', intensity: 0 } }),
  shot('doctor-listens', 'The doctor listens', 18.7, 20.83, 'doctor-advice', { backgroundId: 'clinic-day', characterIds: [], story: { beatId: 'doctor-advice', actorIds: ['doctor'] }, camera: { shot: 'medium', move: 'push-in', intensity: .3 } }),
  shot('doctor-replies', 'The doctor gives some advice', 20.83, 23.24, 'doctor-advice', { backgroundId: 'clinic-day', characterIds: [], actionId: 'wave', story: { beatId: 'doctor-advice', actorIds: ['doctor'], speakingActorId: 'doctor' }, camera: { shot: 'close', move: 'locked', intensity: 0 } }),
  shot('a-gentler-bedtime', 'A quieter moment on the bed', 23.24, 25.58, 'bed-bounce', { characterIds: four, actionId: 'idle', story: { beatId: 'bed-bounce', actorIds: ['dad'] }, camera: { shot: 'wide', move: 'pull-out', intensity: .3 }, transition: 'dissolve' }),
  shot('four-and-a-cat', 'Four little kangaroos, and a watching cat', 25.58, 30, 'bed-bounce', { characterIds: four, actionId: 'bounce', visibleCount: 4, story: { beatId: 'bed-bounce', actorIds: ['dad', 'cat'] }, camera: { shot: 'wide', move: 'locked', intensity: 0 } }),
];
const verses = original.transcript.trim().split(/\r?\n\r?\n/);
const transcript = `${verses[0]}\n\n${verses[1].split(/\r?\n/)[0]}\n`;
const timestamp = new Date().toISOString();
const project = EpisodeProjectSchema.parse({ ...original, id, title: 'Five Little Kangaroos · Story draft', durationSec: analysis.durationSec, revision: 0, createdAt: timestamp, updatedAt: timestamp, transcript, scenes, audio: { master: audioKey, originalName: 'First 30 seconds of 5 Little kagaroos.mp3' }, mouthCues: original.mouthCues.filter(cue => cue.startSec < 30).map(cue => ({ ...cue, endSec: Math.min(30, cue.endSec) })), learningObjective: 'Tell the first verse through a clear setup, leap, reaction, phone call and reply. Shot timing is a local ASR and vocal-pause suggestion awaiting review.', rights: { ...original.rights, notes: 'Original full master and both stems are preserved. The active soundtrack is a lossless WAV excerpt of the original mix, from 0 to 30 seconds. First-verse shot cuts use local ASR word estimates and measured vocal pauses; they are not human-verified. The earlier lip-sync pilot remains a separate project. Rights and content approval remain unconfirmed.', confirmed: false }, review: { contentApproved: false } });
await writeFile(path.join(directory, `${hash}.analysis.json`), JSON.stringify(analysis, null, 2));
await writeFile(path.join(directory, 'lyrics-full.txt'), original.transcript);
await writeFile(path.join(directory, 'lyrics.txt'), transcript);
await writeFile(path.join(directory, 'audio_source.json'), JSON.stringify({ ...source, parentProjectId: original.id, parentProjectRevision: original.revision, activeMaster: { relativePath: audioKey, sha256: hash, sourceMaster: original.audio.master, excerptStartSec: 0, excerptEndSec: 30, method: 'FFmpeg PCM WAV decode; source master left unchanged' }, rightsStatus: 'unconfirmed' }, null, 2));
await writeFile(path.join(directory, 'storyboard-provenance.json'), JSON.stringify({ status: 'draft', method: 'Local faster-whisper base.en word timestamps checked against FFmpeg vocal-pause detections', phraseBoundariesSec: [6.99, 11.66, 16.37, 20.83, 25.58], importantWordSuggestions: { leap: [12.78, 13.06], landed: [13.36, 13.74], daddy: [14.48, 15.14], head: [15.14, 15.36] }, notes: 'Within-phrase action cuts include authored staging choices. No timing was marked human-reviewed. Full song and six supplied verses remain archived.' }, null, 2));
await repository.create(project);
console.log(`Created ${project.id}: ${scenes.length} story shots, ${project.durationSec}s, source audio preserved.\n${path.join(directory, 'project.json')}`);

