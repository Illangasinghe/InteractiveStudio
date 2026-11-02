import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { createStageProjection, sampleBedBounce, type CameraStudySettings, type Point3 } from './projection';

const defaultSettings: CameraStudySettings = { shot: 'wide', move: 'push-in', intensity: 0.65 };

/** Schematic, isolated camera study. The kangaroo is a flat illustrated billboard, not a 3D rig. */
export function CameraBounceStudy({ settings = defaultSettings, reducedMotion = false }: { settings?: CameraStudySettings; reducedMotion?: boolean }) {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const bounce = sampleBedBounce(frame, fps, reducedMotion);
  const camera = createStageProjection({ frame, fps, width, height, durationInFrames, settings, reducedMotion });
  const point = (world: Point3) => camera.project(world);
  const polygon = (vertices: Point3[]) => vertices.map((vertex) => { const p = point(vertex); return `${p.x},${p.y}`; }).join(' ');
  const mattressY = 1.05 + bounce.mattressOffset;
  const foot = point([0, mattressY + bounce.height, 0]);
  const head = point([0, mattressY + bounce.height + 2.4, 0]);
  const spriteScale = (foot.y - head.y) / 260;
  const springCenter = point([0, mattressY, 0.8]);
  const labelSize = Math.max(14, Math.round(width / 68));
  return <AbsoluteFill style={{ background: '#f7f0df' }}>
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" role="img" aria-label="Three.js perspective camera study: a kangaroo bouncing on a springy bed" style={{ fontFamily: 'Arial, sans-serif' }}>
      <rect width={width} height={height} fill="#f5ecdb" />
      <polygon points={polygon([[-15, 0, -3], [15, 0, -3], [15, 0, 10], [-15, 0, 10]])} fill="#d8bea0" />
      <polygon points={polygon([[-4.8, 2.1, -2.8], [-2, 2.1, -2.8], [-2, 4.6, -2.8], [-4.8, 4.6, -2.8]])} fill="#d5e5df" stroke="#fcf8ee" strokeWidth="12" />
      <polygon points={polygon([[-3, 0.85, -1.45], [3, 0.85, -1.45], [3, 1.85, -1.45], [-3, 1.85, -1.45]])} fill="#c6a07d" stroke="#a27d5d" strokeWidth="8" strokeLinejoin="round" />
      {[-2, -1, 0, 1, 2].map((x) => {
        const top = point([x, 1.7, -1.44]);
        const bottom = point([x, 0.9, -1.44]);
        return <line key={`headboard-${x}`} x1={top.x} y1={top.y} x2={bottom.x} y2={bottom.y} stroke="#ad8563" strokeWidth="7" />;
      })}
      {[-2.8, 2.8].flatMap((x) => [-1.2, 1.2].map((z) => {
        const top = point([x, 0.85, z]);
        const bottom = point([x, 0, z]);
        return <line key={`${x}-${z}`} x1={top.x} y1={top.y} x2={bottom.x} y2={bottom.y} stroke="#a27859" strokeWidth={Math.max(12, spriteScale * 18)} strokeLinecap="round" />;
      }))}
      <polygon points={polygon([[-3, 0.9, -1.35], [3, 0.9, -1.35], [3, 0.9, 1.35], [-3, 0.9, 1.35]])} fill="#b9916e" stroke="#a27d5d" strokeWidth="4" />
      <polygon points={polygon([[-2.9, mattressY, -1.3], [2.9, mattressY, -1.3], [2.9, mattressY, 1.3], [-2.9, mattressY, 1.3]])} fill="#88b5ad" stroke="#6d9992" strokeWidth="5" />
      <polygon points={polygon([[-2.9, mattressY, 1.3], [2.9, mattressY, 1.3], [2.9, 0.73, 1.3], [-2.9, 0.73, 1.3]])} fill="#6f9f99" />
      {[-2, -1, 0, 1, 2].map((x) => {
        const back = point([x, mattressY + 0.01, -1.3]);
        const front = point([x, mattressY + 0.01, 1.3]);
        return <line key={x} x1={back.x} y1={back.y} x2={front.x} y2={front.y} stroke="#d6e4d7" opacity="0.55" strokeWidth="3" />;
      })}
      <polygon points={polygon([[-2.5, mattressY + 0.08, -1.1], [-0.6, mattressY + 0.08, -1.1], [-0.6, mattressY + 0.08, -0.2], [-2.5, mattressY + 0.08, -0.2]])} fill="#fff8e9" stroke="#e8dbc4" strokeWidth="9" strokeLinejoin="round" />
      <ellipse cx={springCenter.x} cy={springCenter.y} rx={75 * spriteScale} ry={13 * spriteScale} fill="#476c63" opacity={0.16 - bounce.height * 0.04} />
      <g transform={`translate(${foot.x} ${foot.y}) scale(${spriteScale}) rotate(${bounce.tiltDeg}) scale(1 ${bounce.squashY})`}>
        <path d="M27-62 Q112-30 125-1 Q53 11 12-33Z" fill="#bd855f" />
        <ellipse cx="-23" cy="-7" rx="37" ry="11" fill="#bd855f" /><ellipse cx="31" cy="-7" rx="35" ry="11" fill="#bd855f" />
        <ellipse cy="-72" rx="47" ry="65" fill="#bd855f" /><ellipse cy="-66" rx="29" ry="42" fill="#f0d1ab" />
        <path d="M-30-110 Q-65-91-58-61 M31-110 Q64-97 57-66" fill="none" stroke="#bd855f" strokeWidth="18" strokeLinecap="round" />
        <g transform="translate(0 -155)">
          <path d="M-24-39 Q-57-119-37-111 Q-10-87-7-44 M11-44 Q21-119 39-111 Q52-86 31-37" fill="#bd855f" />
          <path d="M-25-53 Q-44-98-36-96 M23-53 Q36-98 36-94" fill="none" stroke="#dfaf9b" strokeWidth="10" strokeLinecap="round" />
          <ellipse rx="43" ry="48" fill="#bd855f" /><ellipse cy="18" rx="35" ry="24" fill="#f0d1ab" />
          <ellipse cx="-18" cy="-4" rx="4" ry="6" fill="#493a31" /><ellipse cx="18" cy="-4" rx="4" ry="6" fill="#493a31" />
          <path d="M-6 16 Q0 10 6 16 L0 23Z" fill="#6d4837" /><path d="M-10 29 Q0 37 10 29" fill="none" stroke="#6d4837" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
      <rect x="25" y="22" width={width - 50} height="62" rx="14" fill="#fffaf0" opacity="0.94" />
      <text x="44" y="47" fontSize={labelSize} fill="#3c5d50" fontWeight="700">Camera + spring study</text>
      <text x="44" y="69" fontSize={labelSize * 0.75} fill="#62766a">Three.js perspective · flat character · frame-based motion · {settings.move}</text>
      <text x="30" y={height - 24} fontSize={labelSize * 0.7} fill="#5f6d5e">Schematic prototype · no lip-sync or full 3D character rig</text>
    </svg>
  </AbsoluteFill>;
}
