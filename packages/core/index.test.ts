import test from 'node:test';
import assert from 'node:assert/strict';
import { createBlankProject, createDemoProject, EpisodeProjectSchema, preflightProject } from './index';

test('project JSON round-trip preserves the authored timeline and deterministic render inputs', () => {
  const project = createDemoProject();
  assert.deepEqual(EpisodeProjectSchema.parse(JSON.parse(JSON.stringify(project))), project);
  assert.deepEqual(project.scenes.map((scene) => scene.visibleCount), [5, 4, 4]);
});

test('rejects incorrect educational count, duplicate characters and unknown assets', () => {
  const project = createDemoProject();
  project.scenes[0].visibleCount = 4;
  assert.equal(EpisodeProjectSchema.safeParse(project).success, false);
  project.scenes[0].visibleCount = 5;
  project.scenes[0].characterIds[1] = 'roo-1';
  assert.equal(EpisodeProjectSchema.safeParse(project).success, false);
  const unknownAsset = structuredClone(createDemoProject()) as unknown as { scenes: { characterIds: string[] }[] };
  unknownAsset.scenes[0].characterIds[0] = 'invented-roo';
  assert.equal(EpisodeProjectSchema.safeParse(unknownAsset).success, false);
});

test('rejects blank frames, overlapping scenes and cues past the audio duration', () => {
  const gap = createDemoProject();
  gap.scenes[1].startSec += 0.25;
  assert.equal(EpisodeProjectSchema.safeParse(gap).success, false);
  const overlap = createDemoProject();
  overlap.scenes[1].startSec -= 0.25;
  assert.equal(EpisodeProjectSchema.safeParse(overlap).success, false);
  const longCue = createDemoProject();
  longCue.mouthCues = [{ startSec: 23, endSec: 25, value: 'A' }];
  assert.equal(EpisodeProjectSchema.safeParse(longCue).success, false);
  const overlappingCues = createDemoProject();
  overlappingCues.mouthCues[1].startSec = 0.5;
  assert.equal(EpisodeProjectSchema.safeParse(overlappingCues).success, false);
});

test('rejects filesystem traversal and external URLs in audio references', () => {
  for (const master of ['../song.wav', 'audio/../../song.wav', 'C:/private/song.wav', 'https://example.com/song.wav']) {
    const project = { ...createDemoProject(), audio: { master } };
    assert.equal(EpisodeProjectSchema.safeParse(project).success, false);
  }
  const valid = { ...createDemoProject(), audio: { master: `audio/${'a'.repeat(64)}.wav` } };
  assert.equal(EpisodeProjectSchema.safeParse(valid).success, true);
});

test('a sample cannot pass export preflight without actual audio, transcript, rights and human approval', () => {
  const issues = preflightProject(createDemoProject());
  assert.deepEqual(issues.filter((issue) => issue.severity === 'error').map((issue) => issue.code), ['missing-audio', 'missing-transcript', 'missing-rights-source', 'rights-unconfirmed', 'review-required']);
  const approved = createDemoProject();
  approved.audio.master = `audio/${'a'.repeat(64)}.wav`;
  approved.transcript = 'Verified spoken words.';
  approved.rights.source = 'Original recording and original SVG artwork.';
  approved.rights.confirmed = true;
  approved.review.contentApproved = true;
  assert.equal(preflightProject(approved).filter((issue) => issue.severity === 'error').length, 0);
});

test('new song and story projects begin private and unapproved', () => {
  const song = createBlankProject('My first song');
  const story = createBlankProject('My first story', 'story');
  assert.notEqual(song.id, story.id);
  assert.equal(story.mode, 'story');
  assert.equal(song.rights.confirmed, false);
  assert.equal(song.review.contentApproved, false);
  assert.equal(song.audio.master, undefined);
});

test('a zero-count scene is valid only when no characters remain visible', () => {
  const emptyScene = createBlankProject('No kangaroos on the bed');
  emptyScene.scenes[0].backgroundId = 'bedroom-day';
  emptyScene.scenes[0].characterIds = [];
  emptyScene.scenes[0].visibleCount = 0;
  emptyScene.scenes[0].caption = 'No kangaroos are jumping on the bed.';
  assert.equal(EpisodeProjectSchema.safeParse(emptyScene).success, true);
  emptyScene.scenes[0].visibleCount = 1;
  assert.equal(EpisodeProjectSchema.safeParse(emptyScene).success, false);
  emptyScene.scenes[0].visibleCount = 0;
  emptyScene.scenes[0].characterIds = ['roo-1'];
  assert.equal(EpisodeProjectSchema.safeParse(emptyScene).success, false);
});

test('a bedroom-to-garden counting story preserves supported background choices', () => {
  const project = createDemoProject();
  project.scenes[0].backgroundId = 'bedroom-day';
  project.scenes[1].backgroundId = 'bedroom-day';
  project.scenes[2].backgroundId = 'garden-day';
  const reopened = EpisodeProjectSchema.parse(JSON.parse(JSON.stringify(project)));
  assert.deepEqual(reopened.scenes.map((scene) => scene.backgroundId), ['bedroom-day', 'bedroom-day', 'garden-day']);
  const unsupported = { ...project, scenes: [{ ...project.scenes[0], backgroundId: 'imaginary-room', startSec: 0, endSec: 24 }] };
  assert.equal(EpisodeProjectSchema.safeParse(unsupported).success, false);
});
