import { STORY_ACTOR_OPTIONS, type Scene } from '../packages/core';

const moments = [
  ['establish', 'Introduce the room'], ['bed-bounce', 'Kangaroos bounce on the bed'],
  ['leap', 'A kangaroo takes a leap'], ['dad-reaction', 'Daddy reacts'],
  ['dad-phone', 'Daddy calls for advice'], ['doctor-advice', 'The doctor replies'],
  ['cat-reaction', 'The cat reacts'], ['empty-bed', 'The bed is empty'],
  ['trampoline', 'Jumping in the garden'], ['family-finale', 'Family ending'],
] as const;
const actorNames = { dad: 'Daddy', mum: 'Mommy', doctor: 'Doctor', vet: 'Vet', handyman: 'Handyman', laundry: 'Laundry worker', dentist: 'Dentist', cat: 'Cat' } as const;
type Change = (mutate: (scene: Scene) => void) => void;

export function ShotControls({ scene, disabled, onChange }: { scene: Scene; disabled: boolean; onChange: Change }) {
  const camera = scene.camera ?? { shot: 'wide', move: 'locked', intensity: .5 };
  const beat = scene.story?.beatId;
  const stagedActors = scene.story ? STORY_ACTOR_OPTIONS[scene.story.beatId] : ['dad'] as const;
  const changeCamera = (key: keyof typeof camera, value: string | number) => onChange(next => { next.camera = { ...camera, [key]: value } as NonNullable<Scene['camera']>; });
  return <section className="shot-controls" aria-labelledby="shot-control-title">
    <h4 id="shot-control-title" className="inspector-subheading">Story & camera</h4>
    <label className="check-field compact-check"><input type="checkbox" checked={Boolean(scene.story)} disabled={disabled} onChange={event => onChange(next => {
      next.story = event.target.checked ? { beatId: 'establish', actorIds: ['dad'] } : undefined;
      if (event.target.checked) next.backgroundId = 'bedroom-day';
      next.timingStatus = 'draft';
    })} /><span>Stage this as a story moment</span></label>
    {scene.story && <>
      <label className="field-label" htmlFor="story-moment">Story moment</label>
      <select id="story-moment" value={scene.story.beatId} disabled={disabled} onChange={event => onChange(next => {
        const beatId = event.target.value as NonNullable<Scene['story']>['beatId'];
        const actorIds: NonNullable<Scene['story']>['actorIds'] = beatId === 'doctor-advice' ? ['doctor'] : beatId === 'cat-reaction' ? ['dad', 'cat'] : ['dad'];
        next.story = { ...next.story!, beatId, actorIds, speakingActorId: undefined };
        if (!['leap', 'dad-reaction', 'dad-phone'].includes(beatId)) next.story.featuredCharacterId = undefined;
        if (beatId === 'empty-bed' || beatId === 'doctor-advice') { next.characterIds = []; next.visibleCount = beatId === 'empty-bed' ? 0 : undefined; }
        next.backgroundId = beatId === 'doctor-advice' ? 'clinic-day' : ['trampoline', 'family-finale'].includes(beatId) ? 'garden-day' : 'bedroom-day';
        next.timingStatus = 'draft';
      })}>{!moments.some(([value]) => value === scene.story!.beatId) && <option value={scene.story.beatId} disabled>Imported moment · staging pending</option>}{moments.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      {beat === 'bed-bounce' && <><label className="field-label" htmlFor="bed-activity">Bed activity</label><select id="bed-activity" value={scene.actionId === 'idle' ? 'idle' : 'bounce'} disabled={disabled} onChange={event => onChange(next => { next.actionId = event.target.value as Scene['actionId']; })}><option value="idle">Settled</option><option value="bounce">Bouncing</option></select></>}
      <label className="field-label" htmlFor="featured-character">Kangaroo in the action</label>
      <select id="featured-character" value={scene.story.featuredCharacterId ?? ''} disabled={disabled || !['leap', 'dad-reaction', 'dad-phone'].includes(beat ?? '')} onChange={event => onChange(next => { next.story!.featuredCharacterId = event.target.value ? event.target.value as NonNullable<Scene['story']>['featuredCharacterId'] : undefined; })}><option value="">No separate action</option>{[1, 2, 3, 4, 5].map(id => <option value={`roo-${id}`} key={id}>Kangaroo {id}</option>)}</select>
      <label className="field-label" htmlFor="speaking-character">Speaking character</label>
      <select id="speaking-character" value={scene.story.speakingActorId ?? ''} disabled={disabled} onChange={event => onChange(next => { next.story!.speakingActorId = event.target.value ? event.target.value as NonNullable<Scene['story']>['speakingActorId'] : undefined; })}><option value="">Lead kangaroo, when visible</option>{[...new Set([...scene.characterIds, ...scene.story.actorIds.filter(id => id !== 'cat'), ...(scene.story.featuredCharacterId ? [scene.story.featuredCharacterId] : [])])].map(id => <option key={id} value={id}>{id.startsWith('roo-') ? `Kangaroo ${id.slice(4)}` : actorNames[id as keyof typeof actorNames]}</option>)}</select>
      <fieldset className="supporting-actors"><legend>Supporting characters</legend>{stagedActors.map(id => <label key={id}><input type="checkbox" checked={scene.story!.actorIds.includes(id)} disabled={disabled} onChange={event => onChange(next => { const ids = new Set(next.story!.actorIds); if (event.target.checked) ids.add(id); else ids.delete(id); next.story!.actorIds = [...ids]; })} />{actorNames[id]}</label>)}</fieldset>
    </>}
    <div className="two-fields"><div><label className="field-label" htmlFor="camera-shot">Framing</label><select id="camera-shot" value={camera.shot} disabled={disabled} onChange={event => changeCamera('shot', event.target.value)}><option value="wide">Wide</option><option value="medium">Medium</option><option value="close">Close</option><option value="detail">Detail</option></select></div><div><label className="field-label" htmlFor="camera-move">Camera move</label><select id="camera-move" value={camera.move} disabled={disabled} onChange={event => changeCamera('move', event.target.value)}><option value="locked">Still</option><option value="push-in">Move closer</option><option value="pull-out">Pull back</option><option value="pan-left">Pan left</option><option value="pan-right">Pan right</option><option value="follow-action">Follow action</option></select></div></div>
    <label className="field-label" htmlFor="camera-intensity">Movement amount</label><input id="camera-intensity" type="range" min="0" max="1" step=".05" value={camera.intensity} disabled={disabled} onChange={event => changeCamera('intensity', Number(event.target.value))} />
    <label className="field-label" htmlFor="shot-transition">Enter this shot</label><select id="shot-transition" value={scene.transition ?? 'cut'} disabled={disabled} onChange={event => onChange(next => { next.transition = event.target.value as Scene['transition']; })}><option value="cut">Cut</option><option value="dissolve">Soft dissolve</option></select>
    {scene.story && <label className="check-field compact-check"><input type="checkbox" checked={scene.timingStatus === 'reviewed'} disabled={disabled} onChange={event => onChange(next => { next.timingStatus = event.target.checked ? 'reviewed' : 'draft'; })} /><span>I checked this shot against the sung phrase.</span></label>}
  </section>;
}
