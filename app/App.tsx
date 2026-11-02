import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownToLine, AudioLines, CheckCircle2, CircleAlert, Clapperboard, Download, FileJson, Film, FolderOpen, Headphones, Leaf, LoaderCircle, LockKeyhole, Pause, Play, Plus, Redo2, Save, Settings2, ShieldCheck, Sparkles, Undo2, Upload, X } from 'lucide-react';
import { CHARACTER_IDS, MouthCueSchema, EpisodeProjectSchema, preflightProject, type EpisodeProject, type MouthCue, type Scene } from '../packages/core';
import { StudioScene } from '../renderer/StudioScene';
import { MouthCuePanel } from './MouthCuePanel';
import { ShotControls } from './ShotControls';

type Tab = 'storyboard' | 'audio' | 'review';
type RenderJob = { id: string; status: 'queued' | 'rendering' | 'succeeded' | 'failed'; error?: string; downloadUrl?: string };

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'The request could not be completed.');
  return body as T;
}

function castSize(scene: Scene) { return new Set([...scene.characterIds, ...(scene.story?.actorIds ?? []), ...(scene.story?.featuredCharacterId ? [scene.story.featuredCharacterId] : [])]).size; }
function seconds(value: number) { return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`; }
function mediaUrl(project: EpisodeProject) { return project.audio.master ? `/api/projects/${encodeURIComponent(project.id)}/media/${project.audio.master}` : undefined; }
function downloadJson(project: EpisodeProject) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${project.id}.json`; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const SceneThumbnail = memo(function SceneThumbnail({ project, timeSec }: { project: EpisodeProject; timeSec: number }) {
  const thumbnail = useMemo(() => ({ ...project, preferences: { ...project.preferences, captions: false } }), [project]);
  return <StudioScene project={thumbnail} timeSec={timeSec} />;
});

export function App() {
  const [projects, setProjects] = useState<EpisodeProject[]>([]);
  const [project, setProject] = useState<EpisodeProject | null>(null);
  const [tab, setTab] = useState<Tab>('storyboard');
  const [selectedScene, setSelectedScene] = useState(0);
  const [history, setHistory] = useState<EpisodeProject[]>([]);
  const [future, setFuture] = useState<EpisodeProject[]>([]);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [job, setJob] = useState<RenderJob | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMode, setNewMode] = useState<'song' | 'story'>('song');
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);
  const jsonInput = useRef<HTMLInputElement>(null);
  const cueInput = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!showCreate) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) { setShowCreate(false); return; }
      if (event.key !== 'Tab' || !modalRef.current) return;
      const controls = Array.from(modalRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]'));
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previousFocus?.focus(); };
  }, [showCreate, busy]);

  const replaceProject = useCallback((next: EpisodeProject) => {
    setProject(next); setHistory([]); setFuture([]); setDirty(false); setTime(0); setPlaying(false); setSelectedScene(0); setJob(null);
  }, []);

  useEffect(() => {
    let active = true;
    api<{ projects: EpisodeProject[] }>('/api/projects').then(({ projects: items }) => {
      if (active) { setProjects(items); if (items[0]) replaceProject(items[0]); }
    }).catch((cause) => active && setError(cause.message)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [replaceProject]);

  const update = (mutate: (next: EpisodeProject) => void) => {
    if (!project) return;
    const next = structuredClone(project); mutate(next);
    const editorial = (value: EpisodeProject) => JSON.stringify({ ...value, review: undefined, rights: undefined, revision: undefined, updatedAt: undefined });
    if (editorial(project) !== editorial(next)) next.review.contentApproved = false;
    setHistory((items) => [...items.slice(-49), project]); setFuture([]); setProject(next); setDirty(true); setNotice('');
  };
  const updateScene = (mutate: (scene: Scene) => void) => update((next) => { const shot = next.scenes[selectedScene]; if (!shot) return; const before = JSON.stringify({ ...shot, timingStatus: undefined }); mutate(shot); if (shot.story?.speakingActorId && ![...shot.characterIds, ...shot.story.actorIds, shot.story.featuredCharacterId].includes(shot.story.speakingActorId)) shot.story.speakingActorId = undefined; if (shot.story && JSON.stringify({ ...shot, timingStatus: undefined }) !== before) shot.timingStatus = 'draft'; });
  const updateCue = (index: number, field: 'startSec' | 'endSec' | 'value', value: number | MouthCue['value']) => update((next) => {
    const cue = next.mouthCues[index];
    if (!cue) return;
    if (field === 'value' && typeof value === 'string') cue.value = value;
    if (typeof value !== 'number' || !Number.isFinite(value)) return;
    if (field === 'startSec') cue.startSec = Math.max(next.mouthCues[index - 1]?.endSec ?? 0, Math.min(cue.endSec - .001, value));
    if (field === 'endSec') cue.endSec = Math.min(next.mouthCues[index + 1]?.startSec ?? next.durationSec, Math.max(cue.startSec + .001, value));
  });
  const setSceneBoundary = (boundary: 'start' | 'end', value: number) => {
    if (!Number.isFinite(value)) return;
    update((next) => {
      const index = selectedScene; const current = next.scenes[index];
      if (!current) return;
      const frame = 1 / next.fps;
      if (boundary === 'start' && index > 0) {
        const previous = next.scenes[index - 1];
        const point = Math.max(previous.startSec + frame, Math.min(current.endSec - frame, value));
        previous.endSec = point; current.startSec = point; if (previous.story) previous.timingStatus = 'draft'; if (current.story) current.timingStatus = 'draft';
      } else if (boundary === 'end' && index < next.scenes.length - 1) {
        const following = next.scenes[index + 1];
        const point = Math.max(current.startSec + frame, Math.min(following.endSec - frame, value));
        current.endSec = point; following.startSec = point; if (current.story) current.timingStatus = 'draft'; if (following.story) following.timingStatus = 'draft';
      }
    });
  };
  const undo = () => { if (!project || !history.length) return; setFuture((items) => [project, ...items]); setProject(history[history.length - 1]); setHistory((items) => items.slice(0, -1)); setDirty(true); };
  const redo = () => { if (!project || !future.length) return; setHistory((items) => [...items, project]); setProject(future[0]); setFuture((items) => items.slice(1)); setDirty(true); };

  const persist = async (): Promise<EpisodeProject> => {
    if (!project) throw new Error('Choose a project first.');
    if (!dirty) return project;
    const saved = await api<EpisodeProject>(`/api/projects/${project.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(project) });
    setProject(saved); setDirty(false); setHistory([]); setFuture([]);
    setProjects((items) => items.map((item) => item.id === saved.id ? saved : item));
    return saved;
  };
  const task = async (work: () => Promise<void>) => {
    setBusy(true); setError(''); setNotice('');
    try { await work(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Something went wrong.'); } finally { setBusy(false); }
  };
  const save = () => task(async () => { await persist(); setNotice('Project saved on this computer.'); });
  const openProject = (id: string) => task(async () => { await persist(); const next = await api<EpisodeProject>(`/api/projects/${id}`); replaceProject(next); });
  const createProject = () => task(async () => {
    if (project) await persist();
    const next = await api<EpisodeProject>('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTitle.trim() || 'Untitled episode', mode: newMode }) });
    setProjects((items) => [next, ...items]); replaceProject(next); setShowCreate(false); setNewTitle(''); setTab('audio'); setNotice('Your new project is ready. Start with approved audio.');
  });

  const seek = useCallback((value: number) => {
    const bounded = Math.max(0, Math.min(project?.durationSec ?? 0, value));
    setTime(bounded);
    if (audioRef.current && Math.abs(audioRef.current.currentTime - bounded) > .08) audioRef.current.currentTime = bounded;
  }, [project?.durationSec]);

  useEffect(() => {
    if (!playing || !project) return;
    let frame = 0; let previous = performance.now();
    const tick = (now: number) => {
      const delta = (now - previous) / 1000; previous = now;
      if (project.audio.master && audioRef.current) setTime(audioRef.current.currentTime);
      else setTime((current) => { const next = current + delta; if (next >= project.durationSec) { setPlaying(false); return project.durationSec; } return next; });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, project?.id, project?.audio.master, project?.durationSec]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.play().catch(() => { setError('Audio playback could not start. Try the play button again.'); setPlaying(false); });
    else audioRef.current.pause();
  }, [playing]);

  useEffect(() => {
    setWaveform([]);
    if (!project?.audio.master) return;
    let active = true;
    api<{ waveform: number[] }>(`/api/projects/${project.id}/waveform`).then((analysis) => { if (active) setWaveform(analysis.waveform.filter(Number.isFinite)); }).catch(() => { /* Playback still works when waveform data is unavailable. */ });
    return () => { active = false; };
  }, [project?.id, project?.audio.master]);

  useEffect(() => {
    if (!job || !['queued', 'rendering'].includes(job.status)) return;
    let active = true;
    const interval = setInterval(() => { api<RenderJob>(`/api/renders/${job.id}`).then((next) => { if (active) setJob(next); }).catch((cause) => { if (active) { setError(cause.message); setJob((current) => current ? { ...current, status: 'failed', error: cause.message } : null); } }); }, 1500);
    return () => { active = false; clearInterval(interval); };
  }, [job?.id, job?.status]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;
      if (event.code === 'Space') { event.preventDefault(); if (project) { if (time >= project.durationSec) seek(0); setPlaying((current) => !current); } }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); if (!busy) void save(); }
    };
    document.addEventListener('keydown', handler); return () => document.removeEventListener('keydown', handler);
  });

  const importAudio = (file?: File) => {
    if (!file || !project) return;
    void task(async () => {
      if (!/\.(wav|mp3)$/i.test(file.name)) throw new Error('Choose a WAV or MP3 audio file.');
      const saved = await persist();
      const query = new URLSearchParams({ filename: file.name, revision: String(saved.revision) });
      const next = await api<EpisodeProject>(`/api/projects/${saved.id}/audio?${query}`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file });
      replaceProject(next); setProjects((items) => items.map((item) => item.id === next.id ? next : item));
      setNotice('Audio imported. Review scene timing against the full recording.');
    });
  };
  const importJson = (file?: File) => {
    if (!file || !project) return;
    void task(async () => {
      let value: unknown;
      try { value = JSON.parse(await file.text()); } catch { throw new Error('This file is not valid JSON.'); }
      const parsed = EpisodeProjectSchema.safeParse(value);
      if (!parsed.success) throw new Error(`Project could not be imported: ${parsed.error.issues.slice(0, 3).map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
      const next = { ...parsed.data, id: project.id, revision: project.revision, createdAt: project.createdAt, audio: parsed.data.audio.master === project.audio.master ? parsed.data.audio : {}, review: { contentApproved: false } };
      setHistory((items) => [...items.slice(-49), project]); setFuture([]); setProject(next); setDirty(true); setTime(0); setPlaying(false); setSelectedScene(0);
      setNotice('JSON loaded into this project. Review the changes and save. Audio from another project must be imported separately.');
    });
  };
  const importCues = (file?: File) => {
    if (!file || !project) return;
    void task(async () => {
      let source: unknown;
      try { source = JSON.parse(await file.text()); } catch { throw new Error('This mouth-cue file is not valid JSON.'); }
      const rawCues = Array.isArray(source) ? source : typeof source === 'object' && source !== null && 'mouthCues' in source ? source.mouthCues : undefined;
      if (!Array.isArray(rawCues)) throw new Error('Choose Rhubarb JSON containing a mouthCues array with start, end and value fields.');
      const converted = rawCues.map((cue: unknown) => {
        if (typeof cue !== 'object' || cue === null) return cue;
        const value = cue as Record<string, unknown>;
        return { startSec: value.startSec ?? value.start, endSec: value.endSec ?? value.end, value: value.value };
      });
      const validatedCues = MouthCueSchema.array().max(100000).safeParse(converted);
      if (!validatedCues.success) throw new Error(`Mouth cues could not be imported: ${validatedCues.error.issues.slice(0, 3).map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
      const validatedProject = EpisodeProjectSchema.safeParse({ ...project, mouthCues: validatedCues.data });
      if (!validatedProject.success) throw new Error(`Mouth cues could not be imported: ${validatedProject.error.issues.slice(0, 3).map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
      update((next) => { next.mouthCues = validatedProject.data.mouthCues; next.review.contentApproved = false; });
      setNotice(`${validatedCues.data.length} mouth cues imported as timing suggestions. Listen and review them against the recording before approval.`);
    });
  };
  const render = () => task(async () => {
    const saved = await persist();
    const next = await api<RenderJob>(`/api/projects/${saved.id}/renders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    setJob(next); setTab('review');
  });

  const issues = useMemo(() => project ? preflightProject(project) : [], [project]);
  const hasEditorialChanges = useMemo(() => {
    if (!project || !dirty) return false;
    const saved = projects.find((item) => item.id === project.id);
    const editorial = (value: EpisodeProject) => JSON.stringify({ ...value, review: undefined, rights: undefined, revision: undefined, updatedAt: undefined });
    return !saved || editorial(saved) !== editorial(project);
  }, [project, projects, dirty]);
  const blockers = issues.filter((issue) => issue.severity === 'error');
  const scene = project?.scenes[Math.min(selectedScene, project.scenes.length - 1)];
  const activeScene = project?.scenes.findIndex((item) => time >= item.startSec && time < item.endSec) ?? 0;
  const renderRunning = job?.status === 'queued' || job?.status === 'rendering';

  return <div className="studio-shell">
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="InteractiveStudio home"><span className="brand-mark"><Clapperboard size={22} strokeWidth={1.6} /></span><span>Interactive<span className="brand-light">Studio</span></span></a>
      <div className="workspace-tag"><span className="online-dot" /> Personal workspace <LockKeyhole size={12} /></div>
      <div className="sidebar-label">CREATE SOMETHING MEANINGFUL</div>
      <button className="new-project" onClick={() => setShowCreate(true)} disabled={busy}><Plus size={17} /> New episode</button>
      <div className="sidebar-section"><span>YOUR PROJECTS</span><span>{projects.length.toString().padStart(2, '0')}</span></div>
      <nav className="project-list" aria-label="Projects">{projects.map((item) => <button disabled={busy} key={item.id} className={`project-link ${project?.id === item.id ? 'selected' : ''}`} onClick={() => { if (item.id !== project?.id) void openProject(item.id); }}><span className="project-icon"><Film size={18} /></span><span><strong>{item.title}</strong><small>{item.mode === 'song' ? 'Song & animation' : 'Narrated story'}</small></span>{project?.id === item.id && <span className="project-dot" />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="seed-note"><Leaf size={23} /><p>Little stories.<br /><strong>Room to grow.</strong></p></div><div className="private-note"><LockKeyhole size={14} /><span>Local & private by default<small>Files stay on this computer.</small></span></div><div className="build-label">INTERACTIVESTUDIO <span>FOUNDATION · 0.1</span></div></div>
    </aside>

    <main className="main-workspace">
      <header className="topbar"><div className="breadcrumbs"><FolderOpen size={15} /><span>Workspace</span><span>/</span><strong>Episode studio</strong></div><span className="local-pill"><span /> Local workspace</span></header>
      <div className="workspace-content">
        <div className="page-heading"><div><div className="eyebrow">YOUR IDEAS, BROUGHT TO LIFE</div><h1>Make a little wonder.</h1><p>Turn familiar songs and stories into moments of learning.</p></div><div className="heading-accent"><Sparkles size={22} /><span>Made with care.<br /><strong>Created by you.</strong></span></div></div>

        {error && <div role="alert" className="message error-message"><CircleAlert size={18} /><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError('')}><X size={16} /></button></div>}
        {notice && <div role="status" className="message notice-message"><CheckCircle2 size={18} /><span>{notice}</span><button aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={16} /></button></div>}
        {loading ? <div className="loading-state"><LoaderCircle className="spin" size={28} /> Opening your workspace…</div> : !project ? <div className="empty-state"><Clapperboard size={38} /><h2>Your first story starts here.</h2><p>Create an episode, bring your approved audio, and make it your own.</p><button className="button primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Create an episode</button></div> : <>
          <div className="project-toolbar"><div className="episode-heading"><span className="episode-symbol"><Film size={21} /></span><div><div className="episode-kicker">{project.mode === 'song' ? 'SONG EPISODE' : 'NARRATED STORY'}<span className="draft-pill">Draft</span></div><h2>{project.title}</h2></div></div><div className="toolbar-actions"><span className={`save-state ${dirty ? 'is-dirty' : ''}`}><span />{busy ? 'Working…' : dirty ? 'Unsaved changes' : 'Saved locally'}</span><button className="icon-button" disabled={!history.length || busy} onClick={undo} aria-label="Undo" title="Undo"><Undo2 size={17} /></button><button className="icon-button" disabled={!future.length || busy} onClick={redo} aria-label="Redo" title="Redo"><Redo2 size={17} /></button><button className="button save-button" disabled={busy || !dirty} onClick={() => void save()}><Save size={15} /> Save</button><button className="button primary" disabled={busy || !!renderRunning || blockers.length > 0} title={blockers.length ? 'Complete the checks in Review before exporting' : 'Render your episode to MP4'} onClick={() => void render()}>{renderRunning ? <LoaderCircle size={16} className="spin" /> : <ArrowDownToLine size={16} />} Export video</button></div></div>

          <div className="tabs-row"><nav className="tabs" aria-label="Editor views"><button className={tab === 'storyboard' ? 'active' : ''} onClick={() => setTab('storyboard')}><Clapperboard size={16} /> Storyboard</button><button className={tab === 'audio' ? 'active' : ''} onClick={() => setTab('audio')}><AudioLines size={17} /> Audio & words{!project.audio.master && <span className="tab-dot" />}</button><button className={tab === 'review' ? 'active' : ''} onClick={() => setTab('review')}><ShieldCheck size={17} /> Review{blockers.length > 0 && <span className="tab-count">{blockers.length}</span>}</button></nav><div className="json-actions"><button disabled={busy} onClick={() => jsonInput.current?.click()}><Upload size={14} /> Import JSON</button><button onClick={() => downloadJson(project)}><FileJson size={14} /> Project JSON</button></div></div>

          <div className="editor-grid">
            <section className="editor-main">
              <div className="preview-card"><div className="panel-heading"><span className="panel-title"><span className="preview-live-dot" /> EPISODE PREVIEW</span><span className="preview-size">16:9 <span>·</span> {project.fps} FPS</span></div><div className="preview-stage"><StudioScene project={project} timeSec={Math.min(time, project.durationSec - 1 / project.fps)} />{!project.audio.master && <span className="sample-badge"><Sparkles size={12} /> Animation sample · no audio</span>}</div><div className="playback-controls"><button className="play-button" aria-label={playing ? 'Pause preview' : 'Play preview'} onClick={() => { if (time >= project.durationSec) seek(0); setPlaying(!playing); }}>{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button><span className="playback-time">{seconds(time)} <span>/ {seconds(project.durationSec)}</span></span><input className="scrubber" aria-label="Preview position" type="range" min="0" max={project.durationSec} step="0.01" value={time} onChange={(event) => seek(Number(event.target.value))} /><span className="preview-note">{project.audio.master ? 'Original audio' : 'Visual preview'}</span></div></div>

              {tab === 'storyboard' && <section className="scene-panel"><div className="section-heading"><div><h3>Your storyboard <span>{project.scenes.length} scenes</span></h3><p>A small story, one moment at a time.</p></div><span className="duration-chip">{seconds(project.durationSec)} total</span></div><div className="scene-timeline" aria-label="Scene timeline">{project.scenes.map((item, index) => <button key={item.id} style={{ flex: Math.max(.1, item.endSec - item.startSec) }} className={`${selectedScene === index ? 'selected' : ''} ${activeScene === index ? 'playing-scene' : ''}`} onClick={() => { setSelectedScene(index); seek(item.startSec); }}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.title}</strong><small>{seconds(item.startSec)}–{seconds(item.endSec)}</small></button>)}</div><div className="scene-cards">{project.scenes.map((item, index) => <button key={item.id} className={`scene-card ${selectedScene === index ? 'selected' : ''}`} onClick={() => { setSelectedScene(index); seek(item.startSec); }}><div className="scene-thumbnail"><SceneThumbnail project={project} timeSec={item.startSec + .2} /><span>{String(index + 1).padStart(2, '0')}</span></div><div className="scene-card-info"><strong>{item.title}</strong><span>{castSize(item)} {castSize(item) === 1 ? 'character' : 'characters'} <span>·</span> {item.endSec - item.startSec < 10 ? '0' : ''}{(item.endSec - item.startSec).toFixed(1)}s</span></div></button>)}</div></section>}

              {tab === 'audio' && <section className="detail-card audio-panel"><div className="section-heading"><div><h3>Give your story a voice</h3><p>Bring an approved song or narration.</p></div><Headphones size={22} /></div><button disabled={busy} className={`audio-dropzone ${project.audio.master ? 'has-audio' : ''}`} onClick={() => audioInput.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (!busy) importAudio(event.dataTransfer.files[0]); }}><span className="upload-circle">{project.audio.master ? <AudioLines size={23} /> : <Upload size={23} />}</span><strong>{project.audio.originalName || 'Drop your audio here'}</strong><span>{project.audio.master ? 'Click to replace the recording · source files are preserved' : 'or click to choose a file · WAV or MP3'}</span></button><label className="field-label" htmlFor="transcript">{project.mode === 'song' ? 'Approved lyrics' : 'Approved transcript'}<span>Use the words in the actual recording.</span></label><textarea id="transcript" rows={6} value={project.transcript} disabled={busy} placeholder="Paste the verified words here…" onChange={(event) => update((next) => { next.transcript = event.target.value; next.review.contentApproved = false; })} /><MouthCuePanel cues={project.mouthCues} busy={busy} onImport={() => cueInput.current?.click()} onSeek={seek} onChange={updateCue} /></section>}

              {tab === 'review' && <section className="detail-card review-panel"><div className="section-heading"><div><h3>A little care before sharing</h3><p>Review your recording, timing and permissions.</p></div><ShieldCheck size={24} /></div><div className={`review-summary ${blockers.length ? '' : 'complete'}`}><span>{blockers.length ? <CircleAlert size={22} /> : <CheckCircle2 size={22} />}</span><div><strong>{blockers.length ? `${blockers.length} ${blockers.length === 1 ? 'check needs' : 'checks need'} attention` : 'Required checks completed'}</strong><p>{blockers.length ? 'Finish these checks to enable MP4 export.' : 'Watch the whole video before choosing where to share it.'}</p></div></div><ul className="review-issues">{issues.map((issue, index) => <li key={`${issue.code}-${index}`} className={issue.severity}><span>{issue.severity === 'error' ? <CircleAlert size={16} /> : <CircleAlert size={16} />}</span><div>{issue.message}<small>{issue.severity === 'error' ? 'Required for export' : 'Review note'}</small></div></li>)}</ul><div className="rights-fields"><label className="field-label" htmlFor="rights-source">Audio and asset source</label><input id="rights-source" value={project.rights.source} placeholder="For example: original recording, track ID and licence evidence" disabled={busy} onChange={(event) => update((next) => { next.rights.source = event.target.value; next.rights.confirmed = false; })} /><label className="field-label" htmlFor="rights-notes">Permissions and review notes</label><textarea id="rights-notes" rows={3} disabled={busy} value={project.rights.notes} placeholder="Record where the material came from and how it may be used." onChange={(event) => update((next) => { next.rights.notes = event.target.value; next.rights.confirmed = false; })} /><label className="check-field"><input type="checkbox" checked={project.rights.confirmed} disabled={busy} onChange={(event) => update((next) => { next.rights.confirmed = event.target.checked; })} /><span><strong>I have reviewed the rights to this material.</strong><small>I have the permissions needed for the intended use.</small></span></label><label className="check-field"><input type="checkbox" checked={project.review.contentApproved} disabled={busy || hasEditorialChanges} onChange={(event) => update((next) => { next.review.contentApproved = event.target.checked; })} /><span><strong>I have reviewed the content and visual timing.</strong><small>{hasEditorialChanges ? 'Save your editorial changes before approving this revision.' : 'Words, counts and scenes are accurate and suitable for my audience.'}</small></span></label></div>{job && <div className={`render-job ${job.status}`} role="status">{renderRunning ? <LoaderCircle className="spin" size={20} /> : job.status === 'succeeded' ? <CheckCircle2 size={20} /> : <CircleAlert size={20} />}<div><strong>{renderRunning ? 'Rendering your episode on this computer…' : job.status === 'succeeded' ? 'Your video is ready' : 'The render could not finish'}</strong><p>{job.error || (renderRunning ? 'You can keep this workspace open. CPU rendering may take a few minutes.' : 'Your project and source files remain saved locally.')}</p>{job.downloadUrl && <a className="button primary" href={job.downloadUrl} download><Download size={15} /> Download MP4</a>}</div></div>}</section>}

              <section className="audio-track"><div className="track-label"><span className="track-icon"><AudioLines size={18} /></span><div><strong>{project.audio.master ? project.audio.originalName || 'Master audio' : 'Your audio goes here'}</strong><small>{project.audio.master ? 'MASTER RECORDING' : 'NO RECORDING IMPORTED'}</small></div>{!project.audio.master && <button disabled={busy} onClick={() => { setTab('audio'); audioInput.current?.click(); }}><Plus size={15} /> Add audio</button>}</div><div className={`waveform ${!waveform.length ? 'empty' : ''}`}>{waveform.length ? <svg viewBox="0 0 880 54" preserveAspectRatio="none" aria-label="Audio waveform">{waveform.map((value, i) => <rect key={i} x={(i + .2) * 880 / waveform.length} y={27 - Math.max(2, value * 25)} width={Math.max(1, 880 / waveform.length * .5)} height={Math.max(4, value * 50)} rx="2" />)}</svg> : <div className="waveform-placeholder"><span /><span>{project.audio.master ? 'Waveform unavailable · audio can still play' : 'Import a song or narration to see its waveform'}</span><span /></div>}</div></section>
            </section>

            <aside className="inspector"><div className="inspector-title"><Settings2 size={17} /><h3>{tab === 'storyboard' ? 'Scene details' : 'Episode settings'}</h3></div>{tab === 'storyboard' && scene ? <><div className="inspector-scene"><span className="number-tag">{String(selectedScene + 1).padStart(2, '0')}</span><span>MAKE THIS MOMENT YOURS</span></div><label className="field-label" htmlFor="scene-title">Scene name</label><input id="scene-title" value={scene.title} disabled={busy} onChange={(event) => updateScene((next) => { next.title = event.target.value; })} /><div className="two-fields"><div><label className="field-label" htmlFor="scene-start">Start <span>seconds</span></label><input id="scene-start" type="number" min="0" step="0.1" value={scene.startSec} disabled={busy || selectedScene === 0} onChange={(event) => setSceneBoundary('start', Number(event.target.value))} /></div><div><label className="field-label" htmlFor="scene-end">End <span>seconds</span></label><input id="scene-end" type="number" min="0" step="0.1" value={scene.endSec} disabled={busy || selectedScene === project.scenes.length - 1} onChange={(event) => setSceneBoundary('end', Number(event.target.value))} /></div></div>{!scene.story && <><label className="field-label" htmlFor="scene-action">Movement</label><select id="scene-action" value={scene.actionId} disabled={busy} onChange={(event) => updateScene((next) => { next.actionId = event.target.value as Scene['actionId']; })}><option value="idle">Gentle idle</option><option value="bounce">Happy bounce</option><option value="jump">Little jump</option><option value="wave">Friendly wave</option></select></>}<label className="field-label" htmlFor="scene-count">{scene.story && scene.backgroundId === 'bedroom-day' ? 'Kangaroos on the bed' : 'Kangaroos in the group'}</label><div className="count-control"><button disabled={busy || scene.characterIds.length === 0} onClick={() => updateScene((next) => { next.characterIds = next.characterIds.slice(0, -1); next.visibleCount = next.characterIds.length; })} aria-label="Remove one character">−</button><span>{scene.characterIds.length}</span><button disabled={busy || scene.characterIds.length >= 5 || ['empty-bed', 'doctor-advice'].includes(scene.story?.beatId ?? '')} onClick={() => updateScene((next) => { const id = CHARACTER_IDS.find((item) => !next.characterIds.includes(item)); if (id) next.characterIds.push(id); next.visibleCount = next.characterIds.length; })} aria-label="Add one character">+</button></div><label className="field-label" htmlFor="scene-caption">On-screen words</label><textarea id="scene-caption" rows={3} value={scene.caption} disabled={busy} onChange={(event) => updateScene((next) => { next.caption = event.target.value; })} /><label className="field-label" htmlFor="scene-environment">Environment</label><select id="scene-environment" value={scene.backgroundId} disabled={busy || Boolean(scene.story)} onChange={(event) => updateScene((next) => { next.backgroundId = event.target.value as Scene['backgroundId']; })}><option value="meadow-day">Sunny meadow</option><option value="bedroom-day">Bedroom</option><option value="garden-day">Garden trampoline</option><option value="clinic-day">Doctor's room</option></select><ShotControls scene={scene} disabled={busy} onChange={updateScene} /><div className="inspector-divider" /></> : <><label className="field-label" htmlFor="project-title">Episode title</label><input id="project-title" value={project.title} disabled={busy} onChange={(event) => update((next) => { next.title = event.target.value; })} /><label className="field-label" htmlFor="learning-objective">Learning intention</label><textarea id="learning-objective" rows={4} value={project.learningObjective} disabled={busy} onChange={(event) => update((next) => { next.learningObjective = event.target.value; })} placeholder="One small thing to explore together…" /><div className="inspector-divider" /></>}
              <h4 className="inspector-subheading">A comfortable experience</h4><label className="switch-row"><span><strong>On-screen captions</strong><small>Show each scene’s words</small></span><input type="checkbox" role="switch" checked={project.preferences.captions} disabled={busy} onChange={(event) => update((next) => { next.preferences.captions = event.target.checked; })} /></label><label className="switch-row"><span><strong>Reduced motion</strong><small>A quieter visual pace</small></span><input type="checkbox" role="switch" checked={project.preferences.reducedMotion} disabled={busy} onChange={(event) => update((next) => { next.preferences.reducedMotion = event.target.checked; })} /></label><div className="gentle-note"><Leaf size={16} /><p>Every learner is different.<br />Preview together and adjust what feels right.</p></div>
            </aside>
          </div><footer className="workspace-footer"><span><LockKeyhole size={12} /> This is your private creative space.</span><span>Original characters. Thoughtful stories. Little possibilities.</span></footer>
          {project.audio.master && <audio key={`${project.id}-${project.audio.master}`} ref={audioRef} src={mediaUrl(project)} preload="metadata" onEnded={() => { setPlaying(false); setTime(project.durationSec); }} />}
        </>}
      </div>
    </main>
    <input ref={audioInput} className="visually-hidden" type="file" accept=".wav,.mp3,audio/wav,audio/mpeg" onChange={(event) => { importAudio(event.target.files?.[0]); event.target.value = ''; }} />
    <input ref={cueInput} className="visually-hidden" type="file" accept=".json,application/json" onChange={(event) => { importCues(event.target.files?.[0]); event.target.value = ''; }} />
    <input ref={jsonInput} className="visually-hidden" type="file" accept=".json,application/json" onChange={(event) => { importJson(event.target.files?.[0]); event.target.value = ''; }} />
    {showCreate && <div className="modal-backdrop" onClick={() => !busy && setShowCreate(false)}><section ref={modalRef} className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-title" onClick={(event) => event.stopPropagation()}><button className="modal-close icon-button" aria-label="Close new episode" onClick={() => setShowCreate(false)} disabled={busy}><X size={20} /></button><span className="modal-symbol"><Sparkles size={27} /></span><div className="eyebrow">A NEW LITTLE POSSIBILITY</div><h2 id="create-title">What will you create?</h2><p>Start small. You can make it your own along the way.</p><form onSubmit={(event) => { event.preventDefault(); void createProject(); }}><label className="field-label" htmlFor="new-title">Episode name</label><input autoFocus id="new-title" value={newTitle} maxLength={160} placeholder="A little adventure…" onChange={(event) => setNewTitle(event.target.value)} disabled={busy} /><fieldset className="mode-options"><legend>Choose a starting point</legend><label className={newMode === 'song' ? 'selected' : ''}><input type="radio" name="mode" value="song" checked={newMode === 'song'} onChange={() => setNewMode('song')} /><AudioLines size={22} /><strong>A song</strong><small>Music & movement</small></label><label className={newMode === 'story' ? 'selected' : ''}><input type="radio" name="mode" value="story" checked={newMode === 'story'} onChange={() => setNewMode('story')} /><Clapperboard size={22} /><strong>A story</strong><small>Words & imagination</small></label></fieldset><button className="button primary create-submit" type="submit" disabled={busy}>{busy ? <LoaderCircle size={16} className="spin" /> : <Plus size={16} />} Create episode</button></form></section></div>}
  </div>;
}






