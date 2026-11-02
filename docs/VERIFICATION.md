# Initial foundation verification

Checked locally on Windows, 2 November 2026.

| Check | Evidence |
| --- | --- |
| Build and TypeScript | `npm run build` passed |
| Automated checks | `npm test`: 15 passed, 0 failed, 0 skipped |
| Dependency audit | `npm audit --audit-level=high`: 0 reported vulnerabilities |
| Audio tooling | FFmpeg/FFprobe 8.0.1 detected; optional Rhubarb not installed |
| Local app | Editor and proxied project API returned HTTP 200 |
| Browser flow | Edited a scene caption, saved, reloaded and confirmed persistence; restored the sample caption, selected the second scene and confirmed the preview changed to four characters at 8 seconds |
| Browser diagnostics | No errors or warnings in the captured console logs |
| Silent diagnostic | H.264, 960×540, 30 fps, 60 frames, 2.000 seconds; rendered frame visually inspected |
| Audio render test | Generated test tone served through an isolated media endpoint; H.264 1920×1080 at 30 fps, 2.000-second video and AAC 48 kHz audio lasting 2.005 seconds (codec padding); non-silent audio verified |

Local render artifacts are in `data/exports/` and ignored by Git. The test-tone render uses synthetic QA material; it does not represent a production episode or a user content approval. Test fixtures did not import audio into or approve the sample episode.

The real singing proof remains open: approved master/vocals and words, reviewed mouth cues, deliberate departure animation, visual/audio review, and repeatability against that recording. Hosted accounts, billing and cloud workers have not been implemented or deployed.
