import express from 'express';
import path from 'node:path';
import { mkdir, writeFile, readFile, access, rename, unlink } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { z, ZodError } from 'zod';
import { EpisodeProjectSchema, createBlankProject, preflightProject } from '../packages/core/index';
import { FileProjectRepository, StudioError } from './repository';
import { analyseAudio } from './audio';

type RenderJob = { id: string; status: 'queued' | 'rendering' | 'succeeded' | 'failed'; projectId: string; revision: number; error?: string; downloadUrl?: string };

export async function createStudioApp(dataDirectory: string, port = 4310) {
  const repository = new FileProjectRepository(path.resolve(dataDirectory));
  await repository.initialize();
  const app = express();
  const jobs = new Map<string, RenderJob>();
  app.disable('x-powered-by');
  app.use('/api', (req, res, next) => {
    const host = req.hostname;
    if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(host)) return res.status(403).json({ error: 'InteractiveStudio accepts local requests only.' });
    const origin = req.get('origin');
    // Remotion serves its render page on an ephemeral loopback port. Only immutable
    // audio reads need access from that page; write endpoints keep the editor allowlist.
    const mediaRead = ['GET', 'HEAD'].includes(req.method) && /^\/projects\/[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}\/media\/audio\/[a-f0-9]{64}\.(wav|mp3)$/.test(req.path);
    const mediaOrigin = origin?.match(/^http:\/\/(localhost|127\.0\.0\.1):(\d{1,5})$/);
    const loopbackMediaRead = mediaRead && mediaOrigin && Number(mediaOrigin[2]) >= 1 && Number(mediaOrigin[2]) <= 65535;
    if (origin && ![`http://127.0.0.1:${port}`, `http://localhost:${port}`, 'http://127.0.0.1:5173', 'http://localhost:5173'].includes(origin) && !loopbackMediaRead) return res.status(403).json({ error: 'This origin cannot access the local studio.' });
    if (origin && mediaRead) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Length, Content-Range');
      res.vary('Origin');
    }
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '5mb' }));
  app.get('/api/health', (_req, res) => res.json({ name: 'InteractiveStudio', version: '0.1.0', mode: 'local' }));
  app.get('/api/projects', async (_req, res) => res.json({ projects: await repository.list() }));
  app.post('/api/projects', async (req, res) => {
    const input = z.object({ title: z.string().trim().min(1).max(200), mode: z.enum(['song', 'story']).default('song') }).parse(req.body);
    res.status(201).json(await repository.create(createBlankProject(input.title, input.mode)));
  });
  app.get('/api/projects/:id', async (req, res) => res.json(await repository.get(req.params.id)));
  app.put('/api/projects/:id', async (req, res) => {
    const project = EpisodeProjectSchema.parse(req.body);
    if (project.id !== req.params.id) throw new StudioError('The project identifier cannot change during a save.');
    if (project.audio.master) await access(path.join(repository.projectDirectory(project.id), project.audio.master)).catch(() => { throw new StudioError('Import the audio file into this project before referencing it. JSON exports do not contain audio.'); });
    const current = await repository.get(project.id);
    // Editorial changes invalidate a previous content approval. A separate save can then approve the new revision.
    const editorial = (value: typeof project) => JSON.stringify({ ...value, review: undefined, rights: undefined, revision: undefined, updatedAt: undefined });
    if (editorial(project) !== editorial(current)) project.review.contentApproved = false;
    if (project.audio.master !== current.audio.master) project.rights.confirmed = false;
    res.json(await repository.save(project));
  });
  app.post('/api/projects/:id/audio', express.raw({ type: ['application/octet-stream', 'audio/*'], limit: '100mb' }), async (req, res) => {
    const current = await repository.get(req.params.id);
    if (Number(req.query.revision) !== current.revision) throw new StudioError('Save or reload your project before importing audio.', 409);
    const name = path.basename(String(req.query.filename ?? ''));
    const extension = path.extname(name).toLowerCase();
    if (!['.wav', '.mp3'].includes(extension) || !Buffer.isBuffer(req.body) || !req.body.length) throw new StudioError('Choose a nonempty WAV or MP3 file under 100 MB.');
    const hash = createHash('sha256').update(req.body).digest('hex');
    const master = `audio/${hash}${extension}`;
    const directory = repository.projectDirectory(current.id);
    await mkdir(path.join(directory, 'audio'), { recursive: true });
    const file = path.join(directory, master);
    const temporary = path.join(directory, 'audio', `${randomUUID()}${extension}`);
    await writeFile(temporary, req.body, { flag: 'wx' });
    let analysis: Awaited<ReturnType<typeof analyseAudio>>;
    try {
      analysis = await analyseAudio(temporary);
      await rename(temporary, file).catch(async (error) => {
        if (error.code === 'EEXIST') await unlink(temporary);
        else throw error;
      });
    } finally { await unlink(temporary).catch(() => {}); }
    const ratio = analysis.durationSec / current.durationSec;
    const project = EpisodeProjectSchema.parse({ ...current, durationSec: analysis.durationSec, audio: { master, originalName: name }, scenes: current.scenes.map((scene) => ({ ...scene, startSec: scene.startSec * ratio, endSec: scene.endSec * ratio })), mouthCues: [], rights: { ...current.rights, confirmed: false }, review: { contentApproved: false } });
    const saved = await repository.save(project);
    await writeFile(path.join(directory, `${hash}.analysis.json`), JSON.stringify(analysis));
    res.json(saved);
  });
  app.get('/api/projects/:id/waveform', async (req, res) => {
    const project = await repository.get(req.params.id);
    if (!project.audio.master) return res.json({ waveform: [] });
    const hash = path.basename(project.audio.master).split('.')[0];
    try { res.json(JSON.parse(await readFile(path.join(repository.projectDirectory(project.id), `${hash}.analysis.json`), 'utf8'))); }
    catch { res.json({ waveform: [], waveformError: 'No saved waveform is available. Reimport the source audio to analyse it.' }); }
  });
  app.get('/api/projects/:id/media/audio/:filename', async (req, res) => {
    const project = await repository.get(req.params.id);
    if (!/^([a-f0-9]{64})\.(wav|mp3)$/.test(req.params.filename)) throw new StudioError('Audio not found.', 404);
    res.sendFile(path.join(repository.projectDirectory(project.id), 'audio', req.params.filename));
  });
  app.post('/api/projects/:id/renders', async (req, res) => {
    const project = await repository.get(req.params.id);
    const issues = preflightProject(project).filter((issue) => issue.severity === 'error');
    if (issues.length) throw new StudioError(issues.map((issue) => issue.message).join(' '));
    if ([...jobs.values()].some((job) => job.status === 'queued' || job.status === 'rendering')) throw new StudioError('A render is already running. Please wait for it to finish.', 409);
    const job: RenderJob = { id: randomUUID(), status: 'queued', projectId: project.id, revision: project.revision };
    jobs.set(job.id, job);
    res.status(202).json(job);
    void (async () => {
      const directory = path.join(repository.directory, 'exports', job.id);
      try {
        await mkdir(directory, { recursive: true });
        await writeFile(path.join(directory, 'project.json'), JSON.stringify(project, null, 2));
        job.status = 'rendering';
        const { renderEpisode } = await import('../renderer/render');
        await renderEpisode(project, path.join(directory, 'episode.mp4'), { baseUrl: `http://127.0.0.1:${port}` });
        job.status = 'succeeded';
        job.downloadUrl = `/api/renders/${job.id}/download`;
      } catch (error) { job.status = 'failed'; job.error = error instanceof Error ? error.message : 'Render failed.'; }
      await writeFile(path.join(directory, 'job.json'), JSON.stringify(job, null, 2)).catch(() => {});
    })();
  });
  app.get('/api/renders/:id', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) throw new StudioError('Render job not found. Job tracking resets when the local service restarts; exported files remain in the data folder.', 404);
    res.json(job);
  });
  app.get('/api/renders/:id/download', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job || job.status !== 'succeeded') throw new StudioError('The export is not ready.', 404);
    res.download(path.join(repository.directory, 'exports', job.id, 'episode.mp4'), 'InteractiveStudio.mp4');
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Studio endpoint not found.' }));
  app.use(express.static(path.resolve('dist')));
  app.get('/', (_req, res) => res.sendFile(path.resolve('dist/index.html')));
  app.use((error: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = error instanceof ZodError ? 400 : error.status ?? 500;
    if (status >= 500) console.error(error);
    res.status(status).json({ error: error instanceof ZodError ? error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(' ') : error.message });
  });
  return { app, repository };
}
