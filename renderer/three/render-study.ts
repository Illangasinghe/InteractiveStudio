import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const directory = path.resolve('data/exports/three-camera-study');
await mkdir(directory, { recursive: true });
const browserCandidates = [process.env.REMOTION_BROWSER_EXECUTABLE, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter((candidate): candidate is string => Boolean(candidate));
let browserExecutable: string | undefined;
for (const candidate of browserCandidates) {
  try { await access(candidate); browserExecutable = candidate; break; } catch { /* Try the next installed browser. */ }
}
if (!browserExecutable) throw new Error('Set REMOTION_BROWSER_EXECUTABLE to an installed Chrome/Edge executable for this isolated study.');
const serveUrl = await bundle({ entryPoint: path.resolve('renderer/three/index.tsx') });
const composition = await selectComposition({ serveUrl, id: 'CameraBounceStudy', browserExecutable, logLevel: 'error' });
for (const frame of [0, 18, 38, 179]) {
  await renderStill({ serveUrl, composition, browserExecutable, output: path.join(directory, `frame-${String(frame).padStart(3, '0')}.png`), frame, imageFormat: 'png', logLevel: 'error' });
}
if (process.argv.includes('--video')) {
  await renderMedia({ serveUrl, composition, browserExecutable, outputLocation: path.join(directory, 'camera-bounce-study.mp4'), codec: 'h264', concurrency: 1, pixelFormat: 'yuv420p', logLevel: 'error', overwrite: true });
}
await writeFile(path.join(directory, 'README.txt'), 'Isolated Three.js camera + analytic spring study. Perspective camera projects a flat kangaroo and a bed into SVG. No WebGL, 3D character rig, collision physics or lip-sync is claimed. Frames are deterministic and can be sampled in any order.\n');
console.log(`Camera study written to ${directory}`);
