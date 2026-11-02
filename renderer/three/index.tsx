import { Composition, registerRoot } from 'remotion';
import { CameraBounceStudy } from './CameraBounceStudy';

function StudyRoot() {
  return <Composition id="CameraBounceStudy" component={CameraBounceStudy} width={1280} height={720} fps={30} durationInFrames={180} defaultProps={{ reducedMotion: false }} />;
}

registerRoot(StudyRoot);
