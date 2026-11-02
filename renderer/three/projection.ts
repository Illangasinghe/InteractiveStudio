import { PerspectiveCamera, Vector3 } from 'three';

export type Point3 = readonly [number, number, number];
export type CameraStudySettings = {
  shot: 'wide' | 'medium' | 'close' | 'detail';
  move: 'locked' | 'push-in' | 'pull-out' | 'pan-left' | 'pan-right' | 'follow-action';
  intensity: number;
};
export type ProjectedPoint = { x: number; y: number; depth: number; visible: boolean };

const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
const smooth = (progress: number) => progress * progress * (3 - 2 * progress);

/** A small Three.js camera adapter; no DOM, WebGL context, wall clock or mutable simulation. */
export function createStageProjection(options: {
  frame: number;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  settings: CameraStudySettings;
  reducedMotion?: boolean;
  actionFocus?: Point3;
}) {
  const { frame, fps, width, height, durationInFrames, settings, reducedMotion = false } = options;
  if (![frame, fps, width, height, durationInFrames, settings.intensity].every(Number.isFinite) || fps <= 0 || width <= 0 || height <= 0 || durationInFrames < 1) {
    throw new Error('Camera projection needs finite frame, timing and positive viewport values.');
  }
  const progress = smooth(clamp(frame / Math.max(1, durationInFrames - 1), 0, 1));
  const intensity = clamp(settings.intensity, 0, 1);
  const shot = {
    wide: { distance: 11.8, height: 3.4, targetY: 1.65 },
    medium: { distance: 9, height: 3.3, targetY: 1.8 },
    close: { distance: 7.3, height: 3.2, targetY: 2.05 },
    detail: { distance: 5.8, height: 2.8, targetY: 1.8 },
  }[settings.shot];
  const position = new Vector3(0, shot.height, shot.distance);
  const target = new Vector3(0, shot.targetY, 0);
  const move = reducedMotion ? 'locked' : settings.move;
  if (move === 'push-in') position.z *= 1 - 0.16 * intensity * progress;
  if (move === 'pull-out') position.z *= 1 - 0.16 * intensity * (1 - progress);
  if (move === 'pan-left' || move === 'pan-right') {
    const offset = (move === 'pan-left' ? -1 : 1) * 0.9 * intensity * progress;
    position.x += offset;
    target.x += offset;
  }
  if (move === 'follow-action' && options.actionFocus) {
    const [focusX, focusY] = options.actionFocus;
    if (![focusX, focusY].every(Number.isFinite)) throw new Error('The camera focus must be finite.');
    const followX = clamp(focusX, -2.5, 2.5) * 0.35 * intensity;
    const followY = clamp(focusY - 1.8, -0.7, 0.7) * 0.18 * intensity;
    position.x += followX;
    target.x += followX;
    position.y += followY;
    target.y += followY;
  }
  const camera = new PerspectiveCamera(42, width / height, 0.1, 60);
  camera.position.copy(position);
  camera.lookAt(target);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();

  const project = (point: Point3): ProjectedPoint => {
    if (!point.every(Number.isFinite)) throw new Error('Stage positions must be finite.');
    const world = new Vector3(...point);
    const view = world.clone().applyMatrix4(camera.matrixWorldInverse);
    const normalized = world.project(camera);
    return {
      x: (normalized.x + 1) * width / 2,
      y: (1 - normalized.y) * height / 2,
      depth: -view.z,
      visible: view.z < -camera.near && normalized.z >= -1 && normalized.z <= 1 && Math.abs(normalized.x) <= 1 && Math.abs(normalized.y) <= 1,
    };
  };

  return { project, position: position.toArray(), target: target.toArray(), fov: camera.fov };
}

/** Closed-form staging motion, sampled at an absolute frame. It is not a physics engine. */
export function sampleBedBounce(frame: number, fps: number, reducedMotion = false) {
  if (!Number.isFinite(frame) || !Number.isFinite(fps) || fps <= 0) throw new Error('Bounce sampling needs a finite frame and positive fps.');
  if (reducedMotion) return { height: 0, squashY: 1, tiltDeg: 0, mattressOffset: 0 };
  const time = Math.max(0, frame) / fps;
  const period = 1.45;
  const takeoff = 0.2;
  const flight = 0.9;
  const phase = time % period;
  const u = clamp((phase - takeoff) / flight, 0, 1);
  const height = phase >= takeoff && phase <= takeoff + flight ? 4 * 1.05 * u * (1 - u) : 0;
  const crouch = phase < takeoff ? Math.sin(phase / takeoff * Math.PI) : 0;
  let mattressOffset = 0;
  const cycle = Math.floor(time / period);
  for (let impact = Math.max(0, cycle - 3); impact <= cycle; impact++) {
    const elapsed = time - (impact * period + takeoff + flight);
    if (elapsed >= 0) mattressOffset -= 0.18 * Math.exp(-9 * elapsed) * Math.sin(24 * elapsed);
  }
  return {
    height,
    squashY: 1 - 0.1 * crouch + 0.055 * Math.sin(u * Math.PI),
    tiltDeg: height > 0 ? Math.sin(u * 2 * Math.PI) * 3.5 : 0,
    mattressOffset: clamp(mattressOffset, -0.15, 0.05),
  };
}
