# Story iteration verification

Checked locally on Windows, 2 November 2026.

- `npm test`: 25 passed, none failed or skipped. New checks cover story/cast validity, camera bounds and deterministic seeking, Three.js perspective/parallax and analytic spring motion, and reduced motion.
- `npm run build` and TypeScript checks passed. `npm audit --audit-level=high` reported zero vulnerabilities.
- Browser loaded the separate ten-shot story project. The doctor reply shot selected `speaker=doctor`, `framing=close`, and `environment=clinic-day`; no captured console errors or warnings.
- Shot frames and jump approach/contact frames were inspected before rendering. A final contact sheet was checked after the scale-continuity and sleeve-outline refinements. Wide count shots show five and four children on the bed; adults are outside that count.
- The story MP4 is H.264, 960×540, 30 fps, 900 frames, 30.000 seconds, plus AAC 48 kHz stereo audio lasting 30.016 seconds. Signal analysis measured mean −19.4 dB and maximum −4.0 dB. The manifest records project revision 1, the project hash and the derived soundtrack hash.
- The separate six-second Three.js study rendered at 1280×720, 30 fps. Four study frames were inspected. It projects a flat character and perspective bed into SVG; no WebGL or complete 3D rig is claimed.

The earlier lip-sync pilot, full MP3, both WAV stems and all six supplied verses remain preserved. The story project uses a lossless 0–30-second WAV excerpt. Word/phrase timing came from local CPU transcription plus measured pauses and includes editorial choices. All shot timing, content and rights approvals remain unconfirmed; this is an animation draft, not a release approval or a completed full-song animation.

Artifacts:

- `data/exports/five-little-kangaroos-story-draft.mp4`
- `data/exports/story-final-qa/contact-sheet.png`
- `data/exports/three-camera-study/camera-bounce-study.mp4`

For the full-song plan, read [STORYBOARD.md](STORYBOARD.md). For camera, motion, Three.js and asset decisions, read [ANIMATION_DIRECTION.md](ANIMATION_DIRECTION.md).
