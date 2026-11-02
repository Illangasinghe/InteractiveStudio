import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { StudioError } from './repository';

const execute = promisify(execFile);

export async function analyseAudio(filename: string) {
  let result;
  try {
    result = await execute(process.env.FFPROBE_PATH || 'ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,sample_rate,channels', '-of', 'json', filename], { timeout: 30000, maxBuffer: 1024 * 1024, windowsHide: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new StudioError('FFprobe is required to verify audio duration. Install FFmpeg and run npm run doctor.', 503);
    throw new StudioError('The imported file could not be read as audio. Try a WAV or MP3 file.');
  }
  const metadata = JSON.parse(result.stdout);
  const durationSec = Number(metadata.format?.duration);
  if (!metadata.streams?.some((stream: { codec_type: string }) => stream.codec_type === 'audio') || !Number.isFinite(durationSec) || durationSec <= 0 || durationSec > 3600) throw new StudioError('Choose a valid audio file between 0 and 3,600 seconds.');
  let waveform: number[] = [];
  let waveformError: string | undefined;
  try {
    const pcm = await execute(process.env.FFMPEG_PATH || 'ffmpeg', ['-v', 'error', '-i', filename, '-vn', '-ac', '1', '-ar', '800', '-f', 's16le', 'pipe:1'], { encoding: 'buffer', timeout: 60000, maxBuffer: 8 * 1024 * 1024, windowsHide: true });
    const samples = pcm.stdout.length / 2;
    waveform = Array.from({ length: 320 }, (_, bin) => {
      let peak = 0;
      for (let i = Math.floor(bin * samples / 320); i < Math.floor((bin + 1) * samples / 320); i++) peak = Math.max(peak, Math.abs(pcm.stdout.readInt16LE(i * 2)) / 32768);
      return Number(peak.toFixed(4));
    });
  } catch { waveformError = 'Waveform unavailable. Check FFmpeg with npm run doctor.'; }
  return { durationSec, waveform, waveformError, sampleRateHz: Number(metadata.streams.find((stream: { codec_type: string }) => stream.codec_type === 'audio')?.sample_rate) || null };
}
