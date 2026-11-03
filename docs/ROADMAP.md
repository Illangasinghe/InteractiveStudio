# InteractiveStudio implementation roadmap

Started 2 November 2026. The supplied v1.1 blueprint is design input; this roadmap records delivery stages and remaining work under the chosen InteractiveStudio name.

## Foundation milestone

The initial workspace establishes a local React/TypeScript editor, a shared versioned project model, a local project service and a reusable Remotion animation path. The sample episode is a 24-second illustrated counting fixture with manually authored sample mouth cues. It contains **no approved song or recording** and is not an audio-synchronisation demonstration.

The project model validates supported assets, nonoverlapping timeline coverage, mouth-cue boundaries and visible counts. Rights and content-review fields start unapproved. A technical animation preview or diagnostic render does not imply permission to publish an episode.

## P0: complete the real audio-to-video proof (COMPLETED)

- [x] Import one approved 20–30 second master WAV/MP3, optional isolated vocal stem and verified lyrics.
- [x] Save source and rights evidence for that recording and the chosen artwork (`data/projects/five-little-kangaroos-001/audio_source.json`).
- [x] Generate/import Rhubarb cues; review singing alignment and repair sustained vowels.
- [x] Show a visible five-to-four event, with a continuous parabolic leap trajectory, mattress recoil, and clear remaining count.
- [x] Export a draft and standard H.264 MP4 with the original master audio (`data/exports/five-little-kangaroos-story-draft.mp4`).
- [x] Watch and listen to the full export; confirm duration (30.0s), audio/video sync, count accuracy and absence of blank frames.
- [x] Reopen the saved project and reproduce the result from recorded renderer settings and source hashes.

**Exit Status:** Satisfied. Reviewed 30-second singing story excerpt with synchronized mouth movement and clean master audio.

## P1: 2.5D illustrated puppetry, full episode and reuse (FOUNDATION DELIVERED)

- [x] **Option B Warm 2.5D Illustrated Picture-Book Puppetry**: Replaced early geometric flat SVG shapes with warm, painterly watercolor characters (*Beatrix Potter* / *Bluey* aesthetic).
- [x] **Kangaroo Anatomy Rules**: Implemented horizontal macropod feet, muscular tripod tail rooted at the pelvic base, sloping marsupial neck, and 5 distinct polka-dot pajama colorways.
- [x] **Modular Rigs & Cast**:
  - `IllustratedJoey`: Head, torso, ears, paws, feet, and tail layered with procedural bouncing, tilt, and mouth cues.
  - `IllustratedDad`: Worried glasses, turquoise robe, and articulated right arm holding a phone.
  - `IllustratedDoctor`: Lavender coat, head mirror, stethoscope, and stern wagging finger.
  - `IllustratedCat`: Curled sleeping tabby on bedroom rug with rhythmic breathing cycle.
- [x] **Painterly Environments**: Layered `StoryBedroomSet` (window, headboard, mattress, rug) and `StoryClinicSet` (diploma, cabinet, exam couch).
- [x] **Zero-Latency Base64 Pipeline**: Anti-aliased edge de-haloing and inlined Data URIs in [`joeyAssets.ts`](../renderer/story/joeyAssets.ts) and [`storyAssets.ts`](../renderer/story/storyAssets.ts) preventing CORS and headless Chrome asset loading failures.
- [x] **Multi-Shot Story Progression**: 10-shot storyboard across 30 seconds verified with 13 Remotion QA stills.
- [ ] Extend countdown sequence across all 6 verses (verses 4 to 0) to produce the complete 2-minute episode.
- [ ] Garden trampoline scene for final zero-count resolution.
- [ ] Automated episode archive export and cross-episode asset reuse verification.

## P2: usable creative editor

Add waveform/section editing, cue repair, timeline snapping, version checkpoints and a constrained storyboard JSON handoff. Add narration using the same renderer. Support reduced motion, caption choices and deliberate pauses with an obvious preview of each change.

## P3: studio release

Add a rig/asset library, queued renders with diagnostics, complete rights records and explicit human release approval tied to a project revision. Create a useful private routine or narrated story and test whether an adult can change its steps and export without code.

## Hosted beta and productisation

Proceed after the local workflow is proven. Implement adult accounts, workspace authorization, private cloud storage, isolated queued render workers, usage budgets and operational monitoring. See [the productisation decision note](PRODUCTISATION.md) for the proposed architecture, commercial dependencies and validation questions.

No dates or revenue claims are assigned to later phases. Gate progress by working creative outcomes and measured operating costs.
