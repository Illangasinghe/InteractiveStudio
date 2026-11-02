import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { VERSION } from 'remotion';
import { EpisodeProjectSchema, preflightProject, type EpisodeProject } from '../packages/core/index';

export type RenderOptions = {
  baseUrl?: string;
  diagnostic?: boolean;
  durationSec?: number;
  browserExecutable?: string;
};

function installedWindowsBrowser() {
  if (process.platform !== 'win32') return undefined;
  const roots = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter((root): root is string => Boolean(root));
  const candidates = roots.flatMap(root => [path.join(root, 'Google', 'Chrome', 'Application', 'chrome.exe'), path.join(root, 'Microsoft', 'Edge', 'Application', 'msedge.exe')]);
  return candidates.find(candidate => existsSync(candidate));
}

/** Runs a single CPU render. Keep this adapter outside the HTTP request layer. */
export async function renderEpisode(projectInput: EpisodeProject, outputPath: string, options: RenderOptions = {}) {
  const project = EpisodeProjectSchema.parse(projectInput);
  const diagnostic = options.diagnostic ?? false;
  const blocking = preflightProject(project).filter(issue => issue.severity === 'error');
  if (!diagnostic && blocking.length) {
    throw new Error(`Export needs attention: ${blocking.map(issue => issue.message).join(' ')}`);
  }
  const durationSec = options.durationSec ?? project.durationSec;
  if (!Number.isFinite(durationSec) || durationSec <= 0 || durationSec > project.durationSec) {
    throw new Error('Render duration must be positive and within the project duration.');
  }
  if (project.audio.master && !options.baseUrl) {
    throw new Error('Audio rendering needs the local project service. Set baseUrl (CLI: --base-url=http://127.0.0.1:4310).');
  }
  const outputLocation = path.resolve(outputPath);
  await mkdir(path.dirname(outputLocation), { recursive: true });
  const serveUrl = await bundle({ entryPoint: path.resolve('renderer/index.ts') });
  const inputProps = { project, baseUrl: options.baseUrl ?? 'http://127.0.0.1:4310', diagnostic, durationSec };
  const browserExecutable = options.browserExecutable ?? process.env.REMOTION_BROWSER_EXECUTABLE ?? installedWindowsBrowser();
  const composition = await selectComposition({ serveUrl, id: 'InteractiveStudio', inputProps, browserExecutable, logLevel: 'error' });
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    pixelFormat: 'yuv420p',
    audioCodec: 'aac',
    sampleRate: 48000,
    outputLocation,
    inputProps,
    browserExecutable,
    concurrency: 1,
    scale: diagnostic ? 0.5 : 1,
    crf: diagnostic ? 26 : 18,
    overwrite: true,
    logLevel: 'error',
  });
  const manifest = {
    projectId: project.id,
    projectRevision: project.revision,
    projectSha256: createHash('sha256').update(JSON.stringify(project)).digest('hex'),
    renderer: `remotion@${VERSION}`,
    diagnostic,
    seed: project.seed,
    fps: project.fps,
    durationSec: composition.durationInFrames / composition.fps,
    width: diagnostic ? 960 : 1920,
    height: diagnostic ? 540 : 1080,
    sourceAudio: project.audio.master ?? null,
    sourceAudioSha256: project.audio.master?.match(/audio\/([a-f0-9]{64})\./)?.[1] ?? null,
    outputPath: outputLocation,
    createdAt: new Date().toISOString(),
  };
  await writeFile(`${outputLocation}.manifest.json`, JSON.stringify(manifest, null, 2));
  return manifest;
}
