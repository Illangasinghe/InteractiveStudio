import test from 'node:test';
import assert from 'node:assert/strict';
import { importRhubarbCues, recognizedWords } from './rhubarb';

test('Rhubarb cues convert without altering timing and reject unsafe cue ranges', () => {
  assert.deepEqual(importRhubarbCues({ mouthCues: [{ start: 0.2, end: 1.4, value: 'D' }] }, 2), [{ startSec: 0.2, endSec: 1.4, value: 'D' }]);
  for (const cues of [[{ start: 1, end: 3, value: 'B' }], [{ start: 1, end: 1, value: 'X' }], [{ start: 0, end: 1, value: 'B' }, { start: .5, end: 1.5, value: 'D' }]]) assert.throws(() => importRhubarbCues({ mouthCues: cues }, 2));
  assert.throws(() => importRhubarbCues({ mouthCues: [{ start: 0, end: 1, value: 'unknown' }] }, 2));
});

test('recognized words retain their suggestion status and sort by source timing', () => {
  assert.deepEqual(recognizedWords('DEBUG ##word[1.20-1.80]: little\nDEBUG ##word[0.25-0.90]: five\n'), [{ startSec: .25, endSec: .9, word: 'five', status: 'unreviewed' }, { startSec: 1.2, endSec: 1.8, word: 'little', status: 'unreviewed' }]);
});
