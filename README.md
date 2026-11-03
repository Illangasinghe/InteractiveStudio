# InteractiveStudio

A local-first studio for personalised songs, narrated stories and visual learning. This is the initial project foundation, based on the supplied WonderSteps Studio v1.1 blueprint and renamed **InteractiveStudio**.

## Start on Windows

Requires Node.js 22.12 or newer and npm. FFmpeg and FFprobe must be on `PATH` for audio imports (or set `FFMPEG_PATH` and `FFPROBE_PATH` in your shell). Rendering reuses installed Chrome or Edge on Windows. You can set `REMOTION_BROWSER_EXECUTABLE` to an absolute browser executable path; otherwise Remotion downloads a browser when no installed browser is found.

```powershell
cd C:\dev\InteractiveStudio
npm ci
npm run doctor
npm run dev
```

Open http://127.0.0.1:5173. The editor and local API run together; stop them with Ctrl+C. They bind to this computer. The API uses port 4310. To serve a compiled editor locally, use `npm run build` then `npm start` and open http://127.0.0.1:4310.

## What you can do now

- **Option B Warm 2.5D Illustrated Picture-Book Pipeline**: Characters and environments use soft watercolor/storybook aesthetics (*Beatrix Potter* / *Bluey* inspired) with authentic kangaroo anatomy (horizontal macropod feet, thick muscular tripod tail supporting the pelvic base, sloping marsupial neck, large expressive ears, and 5 distinct polka-dot pajama colorways).
- **Modular SVG/React Puppetry**: Dynamic joint articulation and expressive acting across the cast:
  - `IllustratedJoey`: 5 individual joeys on the bed quilt with layered limb hierarchy, procedural bouncing arcs, and head tilt.
  - `IllustratedDad`: Worried glasses, turquoise robe, and right arm holding a smartphone to his ear during the emergency call.
  - `IllustratedDoctor`: Lavender clinician coat, reflective head mirror, stethoscope, and stern wagging finger during medical admonishment.
  - `IllustratedCat`: Sleeping ginger tabby on the teal bedroom rug with gentle rhythmic breathing.
- **Robust Base64 Inlining**: All illustrated textures and puppet parts are pre-cleaned (anti-aliased de-haloing, die-cut sticker rim removal) and inlined as Base64 Data URIs directly in TypeScript ([`joeyAssets.ts`](file:///c:/dev/InteractiveStudio/renderer/story/joeyAssets.ts) and [`storyAssets.ts`](file:///c:/dev/InteractiveStudio/renderer/story/storyAssets.ts)). This guarantees zero latency, deterministic rendering, and avoids CORS or headless file sandboxing issues in Remotion and Vite.
- Open the illustrated counting demo, scrub/play its animation and edit scenes, motions, captions and visible counts.
- Create song or story projects, edit their objectives and transcript, undo/redo changes, and save/reopen them.
- Import a WAV or MP3. The service preserves a content-hashed copy, verifies its duration with FFprobe, scales the initial scene timing to match, and calculates a waveform with FFmpeg. Importing clears sample mouth cues and prior approvals.
- Validate project JSON, download it, and import it into a project. JSON contains project data; audio files must be imported separately.
- Select meadow, bedroom or garden/trampoline scenes, including an empty scene for a count of zero. Import standard Rhubarb cue JSON and adjust the first ten cues in the audio view; additional cues remain editable in project JSON.
- Stage supported story moments with Daddy, the doctor and the cat; choose the speaking character, shot framing, bounded camera moves and cut/dissolve transitions. A clinic cutaway and an empty bed validate their own cast/count state. Shot timing reviews reset when the shot changes.
- Record source and rights notes, review the content, then request a CPU-rendered 1080p MP4. Export is blocked while required preflight checks fail.

The source-code demo contains original vector artwork and manually authored example mouth cues. **The reusable demo does not bundle a licensed recording or verified lip-sync.** The private local Five Little Kangaroos pilot preserves the supplied MP3, both WAV stems and lyrics under the ignored `data/` folder. Its first 30 seconds have generated vocal-stem mouth-cue suggestions and a diagnostic MP4. See [the pilot notes](docs/SONG_PILOT.md).

Local song preparation is available through `npm run import:song`, `npm run import:stem` and `npm run lipsync`. Rhubarb can be on `PATH`, supplied through `RHUBARB_PATH`, or unpacked into `.tools/rhubarb/Rhubarb-Lip-Sync-1.14.0-Windows/`. Original source files are copied without changing their bytes. Imported vocals are used for analysis; the master mix remains the soundtrack.

The **Five Little Kangaroos · Story draft** project is a complete 30-second excerpt with ten cinematic shots: bedroom establishing, five-child count, continuous leap/landing, Daddy's phone call, doctor cutaway, and the subsequent four-child count. It renders using the Option B 2.5D illustrated rigs and watercolor environments:
- [Illustrated 2.5D Pipeline Specification](docs/ILLUSTRATED_2.5D_PIPELINE.md)
- [Animation Direction & Anatomy Standards](docs/ANIMATION_DIRECTION.md)
- [Story Verification & QA Stills](docs/STORY_VERIFICATION.md)
- [Storyboard & Shot Staging](docs/STORYBOARD.md)

`npm run study:camera` renders an isolated Three.js perspective/spring study. It uses real Three.js projection with flat artwork and analytic motion; the main song renderer remains SVG. No WebGL or full 3D character rig has been introduced. The study and its tests help evaluate a later depth/prop pipeline before committing to full 3D rendering.

Save editorial changes before approving content. Subsequent editorial edits clear that approval. An automated preflight result does not establish publication readiness.

## Project layout

| Location | Purpose |
| --- | --- |
| `app/` | React/TypeScript editor |
| `packages/core/` | Versioned project schema, sample project and validation |
| `server/` | Local API, project repository, audio analysis and render jobs |
| `renderer/` | Shared SVG scene, Remotion composition and CPU render adapter |
| `scripts/` | Environment check and command-line render |
| `docs/` | Blueprint, implementation roadmap and productisation decisions |
| `data/projects/<id>/` | Saved project, revision checkpoints and imported audio |
| `data/exports/` | MP4s, render manifests and project snapshots |

`data/`, generated files and dependencies are ignored by Git. Originals in Downloads are never modified. Project saves use schema validation, revision checks and an atomic replacement; local revision checkpoints preserve earlier saves. The initial repository uses JSON files. SQLite is deferred until project indexing warrants it; the repository interface keeps that choice separate from the editor.

Copy the **entire project folder under `data/projects/`** to back up an episode, including its `audio/` directory. A JSON download alone is not a media archive. There is no automatic off-device backup. Render tracking runs in memory and resets when the local service restarts; finished exports remain on disk. One render runs at a time.

## Checks and animation diagnostic

```powershell
npm test
npm run build
npm run doctor
npm run render:diagnostic
```

The `render:diagnostic` command writes a short silent animation diagnostic to `data/exports/diagnostic.mp4`.

To render the 30-second **Five Little Kangaroos · Story draft** with full audio and Option B 2.5D illustrated puppetry:

```powershell
npm run render -- --project=data/projects/five-little-kangaroos-story/project.json --diagnostic --duration=30 --base-url=http://127.0.0.1:4310 --output=data/exports/five-little-kangaroos-story-draft.mp4
```

To render a saved, approved episode while the service is running:

```powershell
npm run render -- --project=data/projects/PROJECT_ID/project.json --base-url=http://127.0.0.1:4310
```

## Future online service

Yes: the same schema, editor and scene components can support an online product. The API, storage interface and render adapter are separated for that purpose. A hosted release still needs adult accounts, workspace authorization, private storage, durable render queues, quotas, deletion controls, operational support and commercial licensing review. This local single-user service is not intended to be exposed to the internet.

See [the productisation decision](docs/PRODUCTISATION.md), [the roadmap](docs/ROADMAP.md), [verification results](docs/VERIFICATION.md), and [the renamed reference blueprint](docs/BLUEPRINT.md). Hosting and billing have not been provisioned. InteractiveStudio is the selected working name; domain and trademark availability have not been checked.
