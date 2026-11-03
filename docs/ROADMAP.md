# InteractiveStudio implementation roadmap

Started 2 November 2026. The supplied v1.1 blueprint is design input; this roadmap records delivery stages and remaining work under the chosen InteractiveStudio name.

## Foundation milestone

The initial workspace establishes a local React/TypeScript editor, a shared versioned project model, a local project service and a reusable Remotion animation path. The sample episode is a 24-second illustrated counting fixture with manually authored sample mouth cues. It contains **no approved song or recording** and is not an audio-synchronisation demonstration.

The project model validates supported assets, nonoverlapping timeline coverage, mouth-cue boundaries and visible counts. Rights and content-review fields start unapproved. A technical animation preview or diagnostic render does not imply permission to publish an episode.

## P0: complete the real audio-to-video proof

- Import one approved 20–30 second master WAV/MP3, optional isolated vocal stem and verified lyrics.
- Save source and rights evidence for that recording and the chosen artwork.
- Generate/import Rhubarb cues; review singing alignment and repair sustained vowels manually.
- Show a visible five-to-four event, with a deliberate departure transition and a clear remaining count.
- Export a draft and standard H.264 MP4 with the original master audio.
- Watch and listen to the full export; confirm duration, audio/video sync, count accuracy and absence of blank frames.
- Reopen the saved project and reproduce the result from recorded renderer settings and source hashes.

**Exit:** a reviewed 20–30 second singing clip with plausible mouth movement and clean audio. A silent SVG demo alone does not satisfy this gate.

## P1: full episode and reuse

Produce a two-to-three minute episode from reusable rigs, scene templates and motion presets. Persist scene edits and corrections through restart. Add automated asset checks, render manifests and portable project archives. Prove the second episode reuses the first episode's rendering code and assets.

## P2: usable creative editor

Add waveform/section editing, cue repair, timeline snapping, version checkpoints and a constrained storyboard JSON handoff. Add narration using the same renderer. Support reduced motion, caption choices and deliberate pauses with an obvious preview of each change.

## P3: studio release

Add a rig/asset library, queued renders with diagnostics, complete rights records and explicit human release approval tied to a project revision. Create a useful private routine or narrated story and test whether an adult can change its steps and export without code.

## Hosted beta and productisation

Proceed after the local workflow is proven. Implement adult accounts, workspace authorization, private cloud storage, isolated queued render workers, usage budgets and operational monitoring. See [the productisation decision note](PRODUCTISATION.md) for the proposed architecture, commercial dependencies and validation questions.

No dates or revenue claims are assigned to later phases. Gate progress by working creative outcomes and measured operating costs.
