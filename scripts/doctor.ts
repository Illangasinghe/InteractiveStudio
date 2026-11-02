import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import path from 'node:path';

console.log(`InteractiveStudio environment\nNode ${process.version} (${process.platform}, ${process.arch})`);
const require = createRequire(import.meta.url);
for (const name of ['react', 'vite', 'remotion', '@remotion/renderer']) {
  try { console.log(`${name}: ${require(`${name}/package.json`).version}`); }
  catch { console.log(`${name}: not installed; run npm ci`); process.exitCode = 1; }
}
for (const [name, executable, args] of [
  ['FFmpeg', process.env.FFMPEG_PATH || 'ffmpeg', ['-version']],
  ['FFprobe', process.env.FFPROBE_PATH || 'ffprobe', ['-version']],
  ['Rhubarb', process.env.RHUBARB_PATH || (existsSync(path.resolve('.tools/rhubarb/Rhubarb-Lip-Sync-1.14.0-Windows/rhubarb.exe')) ? path.resolve('.tools/rhubarb/Rhubarb-Lip-Sync-1.14.0-Windows/rhubarb.exe') : 'rhubarb'), ['--version']],
] as const) {
  try { console.log(`${name}: ${execFileSync(executable, [...args], { encoding: 'utf8', timeout: 10000, windowsHide: true }).trim().split(/\r?\n/)[0]}`); }
  catch { console.log(`${name}: not detected on PATH`); }
}
console.log('\nLocal data stays in ./data by default. Rendering finds installed Chrome/Edge on Windows; Remotion can download a browser otherwise.');
