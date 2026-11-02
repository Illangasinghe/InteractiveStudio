import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { request as httpRequest } from 'node:http';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import type { AddressInfo } from 'node:net';
import { createStudioApp } from './app';
import type { EpisodeProject } from '../packages/core/index';

async function temporaryApp(t: TestContext) {
  const parent = path.resolve(os.tmpdir());
  const prefix = 'interactive-studio-app-test-';
  const directory = await mkdtemp(path.join(parent, prefix));
  const { app } = await createStudioApp(directory, 0);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  t.after(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    const target = path.resolve(directory);
    assert.equal(path.dirname(target), parent, 'Cleanup must remain inside the OS temporary directory.');
    assert.ok(path.basename(target).startsWith(prefix), 'Cleanup must target this test fixture.');
    await rm(target, { recursive: true, force: true });
  });
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const request = (route: string, init?: RequestInit) => fetch(`${url}${route}`, init);
  const save = (project: EpisodeProject) => request(`/api/projects/${project.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(project) });
  return { request, save, url, directory };
}

const execute = promisify(execFile);

async function toolAvailable(executable: string) {
  try { await execute(executable, ['-version'], { timeout: 5000, windowsHide: true }); return true; }
  catch { return false; }
}

function syntheticWav() {
  const sampleRate = 8000;
  const sampleCount = sampleRate * 1.5;
  const bytes = Buffer.alloc(44 + sampleCount * 2);
  bytes.write('RIFF', 0);
  bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20); // PCM
  bytes.writeUInt16LE(1, 22); // Mono
  bytes.writeUInt32LE(sampleRate, 24);
  bytes.writeUInt32LE(sampleRate * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36);
  bytes.writeUInt32LE(sampleCount * 2, 40);
  for (let sample = 0; sample < sampleCount; sample++) bytes.writeInt16LE(Math.round(Math.sin(sample * 440 * 2 * Math.PI / sampleRate) * 4096), 44 + sample * 2);
  return bytes;
}

test('API saves and reopens projects, conflicts on stale edits, and invalidates content approval', async (t) => {
  const { request, save } = await temporaryApp(t);
  const creation = await request('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: 'School routine', mode: 'story' }) });
  assert.equal(creation.status, 201);
  const created = await creation.json() as EpisodeProject;
  const firstSave = await save({ ...created, transcript: 'First, put on your shoes.' });
  assert.equal(firstSave.status, 200);
  const saved = await firstSave.json() as EpisodeProject;
  assert.equal(saved.revision, 1);
  const reopen = await request(`/api/projects/${created.id}`);
  assert.deepEqual(await reopen.json(), saved);
  assert.equal((await save(created)).status, 409);
  const approval = await save({ ...saved, review: { contentApproved: true } });
  assert.equal(approval.status, 200);
  const approved = await approval.json() as EpisodeProject;
  assert.equal(approved.review.contentApproved, true);
  const editApproved = await save({ ...approved, title: 'A revised school routine' });
  assert.equal(editApproved.status, 200);
  assert.equal((await editApproved.json() as EpisodeProject).review.contentApproved, false);
});

test('API rejects unknown imported assets, unsafe references and nonexistent audio', async (t) => {
  const { request, save } = await temporaryApp(t);
  const response = await request('/api/projects/five-little-kangaroos-demo');
  const original = await response.json() as EpisodeProject;
  const unknownAsset = structuredClone(original) as unknown as { scenes: { characterIds: string[] }[] };
  unknownAsset.scenes[0].characterIds[0] = 'invented-character';
  const invalid = await request(`/api/projects/${original.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(unknownAsset) });
  assert.equal(invalid.status, 400);
  assert.match((await invalid.json() as { error: string }).error, /characterIds/);
  const traversal = await save({ ...original, audio: { master: '../private.wav' } });
  assert.equal(traversal.status, 400);
  const missing = await save({ ...original, audio: { master: `audio/${'b'.repeat(64)}.wav` } });
  assert.equal(missing.status, 400);
  assert.match((await missing.json() as { error: string }).error, /Import the audio file/);
  const unsafeId = await request('/api/projects/%2e%2e%2foutside');
  assert.equal(unsafeId.status, 400);
  const unchanged = await request(`/api/projects/${original.id}`);
  assert.deepEqual(await unchanged.json(), original);
});

test('API denies foreign origins and hosts while allowing local non-browser requests', async (t) => {
  const { request, url } = await temporaryApp(t);
  assert.equal((await request('/api/health')).status, 200);
  const hostileOrigin = await request('/api/health', { headers: { origin: 'https://untrusted.example' } });
  assert.equal(hostileOrigin.status, 403);
  // Node fetch rewrites Host; use the HTTP client to exercise the actual header boundary.
  const hostileHostStatus = await new Promise<number>((resolve, reject) => {
    const outgoing = httpRequest(`${url}/api/health`, { headers: { host: 'untrusted.example' } }, (response) => {
      response.resume();
      response.once('end', () => resolve(response.statusCode ?? 0));
    });
    outgoing.once('error', reject);
    outgoing.end();
  });
  assert.equal(hostileHostStatus, 403);
  const localEditor = await request('/api/health', { headers: { origin: 'http://127.0.0.1:5173' } });
  assert.equal(localEditor.status, 200);
});

test('render preflight blocks a sample without audio and explicit review before starting work', async (t) => {
  const { request } = await temporaryApp(t);
  const blocked = await request('/api/projects/five-little-kangaroos-demo/renders', { method: 'POST' });
  assert.equal(blocked.status, 400);
  const error = (await blocked.json() as { error: string }).error;
  assert.match(error, /master WAV or MP3/);
  assert.match(error, /approve/);
  const invalidAudio = await request('/api/projects/five-little-kangaroos-demo/audio?revision=0&filename=script.exe', { method: 'POST', headers: { 'content-type': 'application/octet-stream' }, body: new Uint8Array([1, 2, 3]) });
  assert.equal(invalidAudio.status, 400);
});

test('audio import preserves original bytes, derives timing and waveform, and resets prior approvals', async (t) => {
  if (!await toolAvailable(process.env.FFPROBE_PATH || 'ffprobe')) { t.skip('FFprobe is not installed.'); return; }
  const ffmpegAvailable = await toolAvailable(process.env.FFMPEG_PATH || 'ffmpeg');
  const { request, save, directory } = await temporaryApp(t);
  const original = await (await request('/api/projects/five-little-kangaroos-demo')).json() as EpisodeProject;
  const approval = await save({ ...original, rights: { source: 'Synthetic PCM tone and original SVG artwork.', notes: 'Integration test source.', confirmed: true }, review: { contentApproved: true } });
  assert.equal(approval.status, 200);
  const approved = await approval.json() as EpisodeProject;
  assert.equal(approved.review.contentApproved, true);
  assert.equal(approved.rights.confirmed, true);
  assert.ok(approved.mouthCues.length > 0);
  const wav = syntheticWav();
  const hash = createHash('sha256').update(wav).digest('hex');
  const imported = await request(`/api/projects/${approved.id}/audio?revision=${approved.revision}&filename=test-tone.wav`, { method: 'POST', headers: { 'content-type': 'audio/wav' }, body: wav });
  assert.equal(imported.status, 200);
  const project = await imported.json() as EpisodeProject;
  assert.equal(project.revision, approved.revision + 1);
  assert.equal(project.audio.master, `audio/${hash}.wav`);
  assert.equal(project.audio.originalName, 'test-tone.wav');
  assert.equal(project.durationSec, 1.5);
  assert.deepEqual(project.scenes.map((scene) => [scene.startSec, scene.endSec]), [[0, 0.5], [0.5, 1], [1, 1.5]]);
  assert.deepEqual(project.mouthCues, []);
  assert.equal(project.review.contentApproved, false);
  assert.equal(project.rights.confirmed, false);
  const stored = await readFile(path.join(directory, 'projects', project.id, project.audio.master!));
  assert.deepEqual(stored, wav);
  const media = await request(`/api/projects/${project.id}/media/audio/${hash}.wav`);
  assert.equal(media.status, 200);
  assert.deepEqual(Buffer.from(await media.arrayBuffer()), wav);
  const rendererOrigin = 'http://127.0.0.1:53981';
  const rendererMedia = await request(`/api/projects/${project.id}/media/audio/${hash}.wav`, { headers: { origin: rendererOrigin } });
  assert.equal(rendererMedia.status, 200);
  assert.equal(rendererMedia.headers.get('access-control-allow-origin'), rendererOrigin);
  assert.match(rendererMedia.headers.get('vary') ?? '', /\bOrigin\b/i);
  assert.deepEqual(Buffer.from(await rendererMedia.arrayBuffer()), wav);
  const rendererMutation = await request('/api/projects', { method: 'POST', headers: { origin: rendererOrigin, 'content-type': 'application/json' }, body: JSON.stringify({ title: 'Untrusted renderer write' }) });
  assert.equal(rendererMutation.status, 403);
  const foreignMedia = await request(`/api/projects/${project.id}/media/audio/${hash}.wav`, { headers: { origin: 'https://untrusted.example' } });
  assert.equal(foreignMedia.status, 403);
  const analysis = await (await request(`/api/projects/${project.id}/waveform`)).json() as { durationSec: number; sampleRateHz: number; waveform: number[]; waveformError?: string };
  assert.equal(analysis.durationSec, 1.5);
  assert.equal(analysis.sampleRateHz, 8000);
  if (ffmpegAvailable) {
    assert.equal(analysis.waveform.length, 320);
    assert.ok(analysis.waveform.some((peak) => peak > 0));
    assert.ok(analysis.waveform.every((peak) => peak >= 0 && peak <= 1));
  } else {
    assert.deepEqual(analysis.waveform, []);
    assert.match(analysis.waveformError ?? '', /Waveform unavailable/);
  }
  const reopened = await (await request(`/api/projects/${project.id}`)).json();
  assert.deepEqual(reopened, project);
  assert.deepEqual(await readdir(path.join(directory, 'projects', project.id, 'audio')), [`${hash}.wav`]);
});

test('an unreadable WAV is rejected without changing the project or leaving an imported file', async (t) => {
  if (!await toolAvailable(process.env.FFPROBE_PATH || 'ffprobe')) { t.skip('FFprobe is not installed.'); return; }
  const { request, directory } = await temporaryApp(t);
  const original = await (await request('/api/projects/five-little-kangaroos-demo')).json() as EpisodeProject;
  const invalid = await request(`/api/projects/${original.id}/audio?revision=${original.revision}&filename=invalid.wav`, { method: 'POST', headers: { 'content-type': 'audio/wav' }, body: Buffer.from('This file is not audio.') });
  assert.equal(invalid.status, 400);
  assert.match((await invalid.json() as { error: string }).error, /could not be read as audio/);
  assert.deepEqual(await (await request(`/api/projects/${original.id}`)).json(), original);
  assert.deepEqual(await readdir(path.join(directory, 'projects', original.id, 'audio')), []);
});
