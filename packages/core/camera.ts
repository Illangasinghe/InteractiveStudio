import type { Scene } from './index';

export type ShotFocus = { x: number; y: number; width?: number; height?: number };
export type CameraPose = { scale: number; x: number; y: number; transform: string; backdropTransform: string; foregroundTransform: string };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export const smoothProgress = (progress: number) => {
  const p = clamp(progress, 0, 1);
  // Quintic smootherstep for zero-jerk ease-in/ease-out
  return p * p * p * (p * (p * 6 - 15) + 10);
};

/** Absolute-time camera curves: seeking/rendering frames out of order has identical results. */
export function cameraPose(settings: Scene['camera'], progress: number, focus: ShotFocus = { x: 960, y: 540 }, reducedMotion = false): CameraPose {
  if (![progress, focus.x, focus.y].every(Number.isFinite)) throw new Error('Camera progress and focus must be finite.');
  if (!settings) {
    return { scale: 1, x: 0, y: 0, transform: 'translate(0 0) scale(1)', backdropTransform: 'translate(0 0)', foregroundTransform: 'translate(0 0)' };
  }
  const p = smoothProgress(progress);
  const intensity = clamp(settings.intensity, 0, 1);
  const move = reducedMotion ? 'locked' : settings.move;
  let scale = { wide: 1, medium: 1.24, close: 1.65, detail: 2.05 }[settings.shot];
  let targetX = focus.x; let targetY = focus.y;
  if (move === 'pan-left' || move === 'pan-right' || move === 'follow-action') scale = Math.max(scale, 1.12);
  if (move === 'push-in') scale += .18 * intensity * p;
  if (move === 'pull-out') scale += .18 * intensity * (1 - p);
  if (move === 'pan-left') targetX -= (p - .5) * 180 * intensity;
  if (move === 'pan-right') targetX += (p - .5) * 180 * intensity;
  scale = clamp(scale, 1, 2.3);
  const x = clamp(960 - targetX * scale, 1920 * (1 - scale), 0);
  const y = clamp(540 - targetY * scale, 1080 * (1 - scale), 0);
  const shiftX = (x + 960 * (scale - 1)) / scale;
  const shiftY = (y + 540 * (scale - 1)) / scale;
  const bgX = reducedMotion ? 0 : clamp(-shiftX * 0.08, -28, 28);
  const bgY = reducedMotion ? 0 : clamp(-shiftY * 0.05, -18, 18);
  const fgX = reducedMotion ? 0 : clamp(shiftX * 0.06, -24, 24);
  const fgY = reducedMotion ? 0 : clamp(shiftY * 0.04, -14, 14);
  return {
    scale,
    x,
    y,
    transform: `translate(${x} ${y}) scale(${scale})`,
    backdropTransform: `translate(${bgX} ${bgY})`,
    foregroundTransform: `translate(${fgX} ${fgY})`,
  };
}
