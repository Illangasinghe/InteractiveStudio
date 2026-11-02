import { Audio } from '@remotion/media';
import { AbsoluteFill, Composition, useCurrentFrame, useVideoConfig } from 'remotion';
import { createDemoProject, type EpisodeProject } from '../packages/core/index';
import { StudioScene } from './StudioScene';

export type StudioCompositionProps = {
  project: EpisodeProject;
  baseUrl: string;
  diagnostic: boolean;
  durationSec?: number;
};

function StudioComposition({ project, baseUrl, diagnostic }: StudioCompositionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioUrl = project.audio.master ? `${baseUrl}/api/projects/${encodeURIComponent(project.id)}/media/${project.audio.master}` : undefined;
  return (
    <AbsoluteFill style={{ background: '#edf3e8' }}>
      <StudioScene project={project} timeSec={frame / fps} />
      {audioUrl && <Audio src={audioUrl} />}
      {diagnostic && <div style={{ position: 'absolute', bottom: 20, right: 26, padding: '10px 16px', background: '#223d32e8', color: '#fff', borderRadius: 9, fontFamily: 'Arial, sans-serif', fontSize: 21 }}>Animation test{!audioUrl ? ' · no source audio' : ' · not approved for release'}</div>}
    </AbsoluteFill>
  );
}

export function RemotionRoot() {
  return (
    <Composition
      id="InteractiveStudio"
      component={StudioComposition}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={720}
      defaultProps={{ project: createDemoProject(), baseUrl: 'http://127.0.0.1:4310', diagnostic: true }}
      calculateMetadata={({ props }) => ({
        durationInFrames: Math.max(1, Math.round((props.durationSec ?? props.project.durationSec) * props.project.fps)),
        fps: props.project.fps,
      })}
    />
  );
}
