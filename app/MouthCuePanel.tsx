import { CircleAlert, Play, Upload } from 'lucide-react';
import { MOUTH_SHAPES, type MouthCue } from '../packages/core';

type Props = {
  cues: MouthCue[];
  busy: boolean;
  onImport: () => void;
  onSeek: (timeSec: number) => void;
  onChange: (index: number, field: 'startSec' | 'endSec' | 'value', value: number | MouthCue['value']) => void;
};

export function MouthCuePanel({ cues, busy, onImport, onSeek, onChange }: Props) {
  return <section className="mouth-cue-panel" aria-labelledby="mouth-cue-heading">
    <div className="cue-heading"><div><h4 id="mouth-cue-heading">Mouth cue timing</h4><p>{cues.length ? `${cues.length.toLocaleString()} cues in this episode` : 'No mouth cues added · the character uses its idle mouth'}</p></div><button className="button" disabled={busy} onClick={onImport}><Upload size={13} /> Import cues</button></div>
    <p className="small-note"><CircleAlert size={14} /><span>Audio import does not create lip-sync. Rhubarb JSON supplies timing suggestions; review every cue against the recording, especially sustained sung vowels. Imported cues require content approval again.</span></p>
    {cues.length > 0 && <details className="cue-details"><summary>Inspect and adjust the first {Math.min(10, cues.length)} cues</summary><p>Start and end times are seconds. Other cues can be edited in project JSON.</p><div className="cue-table-scroll"><table className="cue-table"><thead><tr><th scope="col">Cue</th><th scope="col">Start</th><th scope="col">End</th><th scope="col">Mouth</th><th scope="col"><span className="visually-hidden">Preview</span></th></tr></thead><tbody>{cues.slice(0, 10).map((cue, index) => <tr key={index}><th scope="row">{index + 1}</th><td><input type="number" step="0.001" min="0" aria-label={`Cue ${index + 1} start in seconds`} value={Number(cue.startSec.toFixed(3))} disabled={busy} onChange={(event) => onChange(index, 'startSec', Number(event.target.value))} /></td><td><input type="number" step="0.001" min="0" aria-label={`Cue ${index + 1} end in seconds`} value={Number(cue.endSec.toFixed(3))} disabled={busy} onChange={(event) => onChange(index, 'endSec', Number(event.target.value))} /></td><td><select value={cue.value} aria-label={`Cue ${index + 1} mouth shape`} disabled={busy} onChange={(event) => onChange(index, 'value', event.target.value as MouthCue['value'])}>{MOUTH_SHAPES.map((shape) => <option key={shape} value={shape}>{shape}</option>)}</select></td><td><button className="icon-button" aria-label={`Preview cue ${index + 1}`} title={`Preview at ${cue.startSec.toFixed(3)} seconds`} onClick={() => onSeek(cue.startSec)}><Play size={12} /></button></td></tr>)}</tbody></table></div></details>}
  </section>;
}
