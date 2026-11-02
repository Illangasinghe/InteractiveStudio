import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createBlankProject, EpisodeProjectSchema } from '../packages/core/index';
import { FileProjectRepository, StudioError } from './repository';

async function temporaryRepository(t: TestContext) {
  const parent = path.resolve(os.tmpdir());
  const prefix = 'interactive-studio-repository-test-';
  const directory = await mkdtemp(path.join(parent, prefix));
  t.after(async () => {
    const target = path.resolve(directory);
    assert.equal(path.dirname(target), parent, 'Cleanup must remain inside the OS temporary directory.');
    assert.ok(path.basename(target).startsWith(prefix), 'Cleanup must target this test fixture.');
    await rm(target, { recursive: true, force: true });
  });
  const repository = new FileProjectRepository(directory);
  await repository.initialize();
  return repository;
}

test('saved projects reopen with authored data and a preserved previous revision', async (t) => {
  const repository = await temporaryRepository(t);
  const original = await repository.create(createBlankProject('Reusable story', 'story'));
  const edited = { ...original, title: 'A story about sharing', transcript: 'May I have a turn, please?' };
  const saved = await repository.save(edited);
  assert.equal(saved.revision, 1);
  assert.equal(saved.createdAt, original.createdAt);
  const reopened = await new FileProjectRepository(repository.directory).get(original.id);
  assert.deepEqual(reopened, saved);
  assert.equal(reopened.transcript, edited.transcript);
  const previous = EpisodeProjectSchema.parse(JSON.parse(await readFile(path.join(repository.projectDirectory(original.id), 'revisions', '0.json'), 'utf8')));
  assert.deepEqual(previous, original);
});

test('two concurrent saves from one revision produce one success and one conflict', async (t) => {
  const repository = await temporaryRepository(t);
  const original = await repository.create(createBlankProject('Concurrent edits'));
  const results = await Promise.allSettled([
    repository.save({ ...original, title: 'First window' }),
    repository.save({ ...original, title: 'Second window' }),
  ]);
  const fulfilled = results.filter((result) => result.status === 'fulfilled');
  const rejected = results.filter((result) => result.status === 'rejected');
  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  assert.ok(rejected[0].reason instanceof StudioError);
  assert.equal(rejected[0].reason.status, 409);
  assert.equal((await repository.get(original.id)).revision, 1);
});

test('repository rejects unsafe identifiers and duplicate creation without overwriting a project', async (t) => {
  const repository = await temporaryRepository(t);
  for (const id of ['../outside', '..\\outside', 'C:\\outside', '/outside', '.', '']) {
    assert.throws(() => repository.projectDirectory(id), (error) => error instanceof StudioError && error.status === 400);
  }
  const original = await repository.create(createBlankProject('Keep this project'));
  await assert.rejects(repository.create({ ...original, title: 'Overwrite attempt' }), (error) => error instanceof StudioError && error.status === 409);
  assert.equal((await repository.get(original.id)).title, original.title);
});
