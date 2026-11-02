import test from 'node:test';
import assert from 'node:assert/strict';
import { createStageProjection, sampleBedBounce, type CameraStudySettings } from './projection';

function projection(frame: number, settings: CameraStudySettings, reducedMotion = false) {
  return createStageProjection({ frame, fps: 30, width: 1280, height: 720, durationInFrames: 180, settings, reducedMotion });
}

test('arbitrary frame order yields the same camera and bounce without simulation history', () => {
  const settings: CameraStudySettings = { shot: 'wide', move: 'push-in', intensity: 0.6 };
  const sample = (frame: number) => ({ point: projection(frame, settings).project([1, 1, 0]), bounce: sampleBedBounce(frame, 30) });
  const expected = sample(93);
  sample(179);
  sample(0);
  assert.deepEqual(sample(93), expected);
});

test('perspective produces depth parallax and a bounded push-in increases actor size', () => {
  const settings: CameraStudySettings = { shot: 'wide', move: 'push-in', intensity: 1 };
  const beginning = projection(0, settings);
  const ending = projection(179, settings);
  assert.ok(ending.position[2] >= beginning.position[2] * 0.84 - 0.000001);
  const height = (camera: ReturnType<typeof projection>) => camera.project([0, 1, 0]).y - camera.project([0, 3, 0]).y;
  assert.ok(height(ending) > height(beginning));
  assert.ok(Math.abs(beginning.project([1, 1, 1]).x - 640) > Math.abs(beginning.project([1, 1, -1]).x - 640));
  assert.equal(beginning.project([0, 1, 20]).visible, false);
});

test('reduced motion locks camera movement and the staged spring for every sample', () => {
  const settings: CameraStudySettings = { shot: 'medium', move: 'pan-left', intensity: 1 };
  assert.deepEqual(projection(0, settings, true).position, projection(179, settings, true).position);
  assert.deepEqual(projection(0, settings, true).project([1, 1, 0]), projection(179, settings, true).project([1, 1, 0]));
  assert.deepEqual(sampleBedBounce(0, 30, true), sampleBedBounce(179, 30, true));
});

test('staged landing remains bounded and invalid numeric inputs fail explicitly', () => {
  let sawFlight = false;
  let sawCompression = false;
  for (let frame = 0; frame <= 600; frame++) {
    const sample = sampleBedBounce(frame, 30);
    assert.ok(sample.height >= 0 && sample.height <= 1.05);
    assert.ok(sample.mattressOffset >= -0.15 && sample.mattressOffset <= 0.05);
    sawFlight ||= sample.height > 1;
    sawCompression ||= sample.mattressOffset < -0.05;
  }
  assert.ok(sawFlight && sawCompression);
  assert.throws(() => sampleBedBounce(1, 0));
  assert.throws(() => projection(Number.NaN, { shot: 'wide', move: 'locked', intensity: 0 }));
});
