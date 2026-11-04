# InteractiveStudio implementation roadmap

Started 2 November 2026. The supplied v1.1 blueprint is design input; this roadmap records delivery stages and remaining work under the chosen InteractiveStudio name.

## Foundation milestone (COMPLETED)

The initial workspace establishes a local React/TypeScript editor, a shared versioned project model, a local project service and a reusable Remotion animation path.

## P0: complete the real audio-to-video proof (COMPLETED)

- [x] Import approved 20–30 second master WAV/MP3, isolated vocal stem and verified lyrics.
- [x] Save source and rights evidence for recording and artwork (`data/projects/five-little-kangaroos-001/audio_source.json`).
- [x] Generate/import Rhubarb cues; singing alignment and sustained vowels.
- [x] Show a visible five-to-four event with parabolic leap arc, bounce, and floor landing.
- [x] Export standard H.264 MP4 with master audio (`data/exports/five-little-kangaroos-story-draft.mp4`, 6.12 MB).
- [x] Verified duration (30.0s), audio/video sync, count accuracy, and 0 blank frames across 25 passing test suites.

## P1: Pose-based 2.5D illustrated production for full episode (IN PROGRESS)

Core production paradigm: **"Fewer moving parts, richer action-specific illustrated assets"** (*Bluey* / *Beatrix Potter* style).

- [x] **Option B Warm Illustrated Aesthetic**: Soft watercolor palette, authentic kangaroo anatomy (horizontal feet, muscular tripod tail, sloping neck, 5 pajama colorways).
- [x] **Action-State Assets Delivered**:
  - `daddy_kangaroo_standing.png` & `daddy_kangaroo_phone.png` (organic phone pose with worried expression).
  - `doctor_kangaroo_phone.png` & `doctor_kangaroo_advice.png` (advisory wagging finger).
  - `sleeping_cat.png` (curled tabby on braided rug).
  - 5 Joey colorways in polka-dot pajamas.
- [x] **Theatrical Staging**: Landing on floor rug (`x = 1360, y = 925`) avoiding Daddy collision (`x = 1600`).
- [ ] **Verse 4 (Four)**: Flip/roll mishap, `cat_startled_cushion`, `vet_kangaroo_phone`, `vet_kangaroo_advice`, `joey_wearing_helmet`.
- [ ] **Verse 3 (Three)**: Ceiling fan contact, `handyman_kangaroo`, `ceiling_fan_prop`, `heavy_duty_bed`.
- [ ] **Verse 2 (Two)**: Cannonball pretend splash, `laundry_kangaroo`, `laundry_towel_wrap`.
- [ ] **Verse 1 (One)**: Moonwalk bump, `dentist_kangaroo`, soothing play-doh advice.
- [ ] **Verse 0 (Finale)**: Supervised garden trampoline, `mommy_kangaroo_waving`, full family celebration.
- [ ] Complete 2-minute episode render and multi-episode asset reuse proof.

## P2: usable creative editor

Add waveform/section editing, cue repair, timeline snapping, version checkpoints and a constrained storyboard JSON handoff. Add narration using the same renderer. Support reduced motion, caption choices and deliberate pauses with an obvious preview of each change.

## P3: studio release

Add a rig/asset library, queued renders with diagnostics, complete rights records and explicit human release approval tied to a project revision.

## Hosted beta and productisation

Proceed after the local workflow is proven. Implement adult accounts, workspace authorization, private cloud storage, isolated queued render workers, usage budgets and operational monitoring.
