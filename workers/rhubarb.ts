import { z } from 'zod';
import { MouthCueSchema, type MouthCue } from '../packages/core/index';

const RhubarbOutputSchema = z.object({ mouthCues: z.array(z.object({ start: z.number().finite().nonnegative(), end: z.number().finite().positive(), value: MouthCueSchema.shape.value })).max(100000) });

export function importRhubarbCues(value: unknown, durationSec: number): MouthCue[] {
  if (!Number.isFinite(durationSec) || durationSec <= 0) throw new Error('Audio duration must be positive.');
  const parsed = RhubarbOutputSchema.parse(value);
  let end = 0;
  return parsed.mouthCues.map(cue => {
    if (cue.start < end - 0.000001 || cue.end <= cue.start || cue.end > durationSec + 0.000001) throw new Error('Rhubarb cues must be ordered, nonoverlapping and within the source duration.');
    end = cue.end;
    return { startSec: cue.start, endSec: cue.end, value: cue.value };
  });
}

export function recognizedWords(log: string) {
  return Array.from(log.matchAll(/##word\[([\d.]+)-([\d.]+)\]:\s*([^\r\n]+)/g), match => ({ startSec: Number(match[1]), endSec: Number(match[2]), word: match[3].trim(), status: 'unreviewed' as const })).filter(item => item.endSec > item.startSec).sort((a, b) => a.startSec - b.startSec);
}
