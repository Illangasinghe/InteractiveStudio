import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createDemoProject, EpisodeProjectSchema } from '../packages/core/index';
import { renderEpisode } from '../renderer/render';

const args = process.argv.slice(2);
const value = (name: string) => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const diagnostic = args.includes('--diagnostic');
const projectPath = value('project');
const duration = value('duration');

try {
  const project = projectPath ? EpisodeProjectSchema.parse(JSON.parse(await readFile(path.resolve(projectPath), 'utf8'))) : createDemoProject();
  const output = value('output') ?? path.join('data', 'exports', diagnostic ? 'diagnostic.mp4' : `${project.id}.mp4`);
  const result = await renderEpisode(project, output, {
    diagnostic,
    durationSec: duration === undefined ? undefined : Number(duration),
    baseUrl: value('base-url'),
  });
  process.stdout.write(`Rendered ${result.diagnostic ? 'animation diagnostic' : 'episode'}: ${result.outputPath}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
