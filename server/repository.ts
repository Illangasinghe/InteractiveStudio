import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { EpisodeProjectSchema, createDemoProject, type EpisodeProject } from '../packages/core/index';

export class StudioError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export interface ProjectRepository {
  list(): Promise<EpisodeProject[]>;
  get(id: string): Promise<EpisodeProject>;
  create(project: EpisodeProject): Promise<EpisodeProject>;
  save(project: EpisodeProject): Promise<EpisodeProject>;
}

export class FileProjectRepository implements ProjectRepository {
  private pending = new Map<string, Promise<unknown>>();
  constructor(public readonly directory: string) {}

  projectDirectory(id: string) {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(id)) throw new StudioError('Invalid project identifier.');
    return path.join(this.directory, 'projects', id);
  }

  private async serial<T>(id: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.pending.get(id) ?? Promise.resolve();
    const current = previous.catch(() => {}).then(operation);
    this.pending.set(id, current);
    try { return await current; }
    finally { if (this.pending.get(id) === current) this.pending.delete(id); }
  }

  async initialize() {
    await mkdir(path.join(this.directory, 'projects'), { recursive: true });
    if (!(await readdir(path.join(this.directory, 'projects'))).length) await this.create(createDemoProject());
  }

  async list() {
    const ids = await readdir(path.join(this.directory, 'projects'));
    const projects: EpisodeProject[] = [];
    for (const id of ids) projects.push(await this.get(id));
    return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string) {
    try { return EpisodeProjectSchema.parse(JSON.parse(await readFile(path.join(this.projectDirectory(id), 'project.json'), 'utf8'))); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new StudioError('Project not found.', 404);
      throw error;
    }
  }

  async create(input: EpisodeProject) {
    const project = EpisodeProjectSchema.parse(input);
    return this.serial(project.id, async () => {
      const directory = this.projectDirectory(project.id);
      await mkdir(directory, { recursive: true });
      try { await writeFile(path.join(directory, 'project.json'), JSON.stringify(project, null, 2), { flag: 'wx' }); }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new StudioError('Project already exists.', 409);
        throw error;
      }
      return project;
    });
  }

  async save(input: EpisodeProject) {
    const project = EpisodeProjectSchema.parse(input);
    return this.serial(project.id, async () => {
      const current = await this.get(project.id);
      if (project.revision !== current.revision) throw new StudioError('This project changed in another window. Reload it before saving.', 409);
      const saved = EpisodeProjectSchema.parse({ ...project, createdAt: current.createdAt, updatedAt: new Date().toISOString(), revision: current.revision + 1 });
      const directory = this.projectDirectory(project.id);
      await mkdir(path.join(directory, 'revisions'), { recursive: true });
      await writeFile(path.join(directory, 'revisions', `${current.revision}.json`), JSON.stringify(current, null, 2), { flag: 'wx' }).catch((error) => { if (error.code !== 'EEXIST') throw error; });
      const temporary = path.join(directory, `${randomUUID()}.tmp`);
      await writeFile(temporary, JSON.stringify(saved, null, 2));
      await rename(temporary, path.join(directory, 'project.json'));
      return saved;
    });
  }
}
