import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoProject, EpisodeProjectSchema } from './index';
import { cameraPose } from './camera';

test('story shots preserve legacy projects and validate supporting actors and camera limits', () => {
  const original = createDemoProject();
  assert.deepEqual(EpisodeProjectSchema.parse(original), original);
  const project = structuredClone(original);
  project.scenes[0].backgroundId = 'bedroom-day';
  project.scenes[0].story = { beatId: 'dad-phone', actorIds: ['dad'], featuredCharacterId: 'roo-1' };
  project.scenes[0].camera = { shot: 'close', move: 'push-in', intensity: .5 };
  project.scenes[0].timingStatus = 'draft';
  assert.ok(EpisodeProjectSchema.safeParse(project).success);
  assert.equal(EpisodeProjectSchema.safeParse({ ...project, scenes: [{ ...project.scenes[0], camera: { ...project.scenes[0].camera, intensity: 2 } }, ...project.scenes.slice(1)] }).success, false);
  assert.equal(EpisodeProjectSchema.safeParse({ ...project, scenes: [{ ...project.scenes[0], story: { beatId: 'dad-phone', actorIds: ['dad', 'dad'] } }, ...project.scenes.slice(1)] }).success, false);
  assert.equal(EpisodeProjectSchema.safeParse({ ...project, scenes: [{ ...project.scenes[0], story: { beatId: 'dad-phone', actorIds: ['dad'], speakingActorId: 'doctor' } }, ...project.scenes.slice(1)] }).success, false);
  assert.equal(EpisodeProjectSchema.safeParse({ ...project, scenes: [{ ...project.scenes[0], story: { beatId: 'bed-bounce', actorIds: ['doctor'] } }, ...project.scenes.slice(1)] }).success, false);
  assert.equal(EpisodeProjectSchema.safeParse({ ...project, scenes: [{ ...project.scenes[0], story: { beatId: 'empty-bed', actorIds: ['dad'] } }, ...project.scenes.slice(1)] }).success, false);
});

test('camera sampling is deterministic, bounded and still under reduced motion', () => {
  const settings = { shot: 'medium', move: 'push-in', intensity: .7 } as const;
  const expected = cameraPose(settings, .7, { x: 1220, y: 430 });
  cameraPose(settings, .1);
  assert.deepEqual(cameraPose(settings, .7, { x: 1220, y: 430 }), expected);
  assert.ok(cameraPose(settings, 1).scale > cameraPose(settings, 0).scale);
  assert.deepEqual(cameraPose(settings, 0, undefined, true), cameraPose(settings, 1, undefined, true));
  for (const progress of [-2, 0, .5, 1, 10]) {
    const pose = cameraPose({ shot: 'detail', move: 'pan-right', intensity: 1 }, progress, { x: -500, y: 2000 });
    assert.ok(pose.x <= 0 && pose.y <= 0);
    assert.ok(pose.x >= 1920 * (1 - pose.scale) && pose.y >= 1080 * (1 - pose.scale));
  }
  assert.throws(() => cameraPose(settings, Number.NaN));
});
