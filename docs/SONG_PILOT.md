# Five Little Kangaroos: first recording pilot

The original pilot below is preserved for comparison. A subsequent separate 30-second, ten-shot **Story draft** adds acting, locations, a phone call, doctor dialogue and camera direction. See [the storyboard](STORYBOARD.md) and [animation direction](ANIMATION_DIRECTION.md); its output is `data/exports/five-little-kangaroos-story-draft.mp4`.

Prepared locally on 2 November 2026. Working project ID: `five-little-kangaroos-001`.

## Sources preserved

The complete MP3 master (127.600 seconds), vocals WAV (127.600884 seconds), other WAV stem (127.601020 seconds) and all six supplied lyric verses are stored in `data/projects/five-little-kangaroos-001/`. Audio files use immutable content-hashed names. `audio_source.json` records original filenames, hashes, durations and source status. The Downloads originals have not been modified. Source duration agreement does not establish vocal alignment; listen before approving it.

## Current result

`data/exports/five-little-kangaroos-first30s-draft.mp4` is a 30-second, 960×540, 30 fps H.264 diagnostic with the original MP3 mix encoded as AAC 48 kHz stereo. The final audio stream lasts 30.016 seconds because of codec padding. Signal analysis confirmed non-silent audio; a frame at 10.7 seconds shows the selected D mouth cue rendered on the lead kangaroo. This confirms infrastructure, not subjective singing quality.

Rhubarb generated 89 mouth cues from the first 30 seconds of the vocal stem. Both the cues and detected first vocal at 6.96 seconds are unreviewed suggestions. Spoken-word recognition was inaccurate on this sung recording and was not used as verified lyrics or verse boundaries. From 30 seconds onward, the saved full-song project has an idle mouth and an explicit storyboard-pending scene.

The test uses one lead kangaroo in a bedroom and hides the optional count badge. It does not claim to illustrate the full five-to-zero sequence. `storyboard-plan.json` preserves an untimed plan for all six verses, an empty bed, and the final garden trampoline. Approve event timing before turning that plan into counted shots. Captions are off until their timing is reviewed.

Rights confirmation and content approval remain false. The watermark identifies the MP4 as an animation test. No publication or external audio upload occurred.

## Reproduce and refine

Start the service/editor with `npm run dev`, then inspect **Five Little Kangaroos** in **Audio & words**. All supplied words and the generated cues can be inspected there. The first ten cues have direct editing controls; the remaining cues can be corrected in project JSON.

To regenerate the first excerpt deliberately, replacing its current cues:

```powershell
npm run lipsync -- --id=five-little-kangaroos-001 --duration=30 --replace
```

The command uses the archived vocal stem automatically. Analysis outputs and provenance are written into a new project `derived/` subfolder. Existing cues are protected unless `--replace` is supplied, and replacing cues clears content approval.

With the local service running, render the same diagnostic:

```powershell
npm run render -- --project=data/projects/five-little-kangaroos-001/project.json --diagnostic --duration=30 --base-url=http://127.0.0.1:4310 --output=data/exports/five-little-kangaroos-first30s-draft.mp4
```

The Windows tool came from the [official Rhubarb v1.14.0 release](https://github.com/DanielSWolf/rhubarb-lip-sync/releases/tag/v1.14.0). Its locally calculated archive SHA-256 is `62fa416a8d5e382a3828ee4bef358ce520d0b4cabdeaea75a7ac266d098d1fe3`; no publisher checksum was supplied. The extracted package and its license files are retained under ignored `.tools/`.

## Checks

- `npm test`: 19 passed, including audio source preservation, cue range validation, zero-count scenes and the renderer's restricted audio CORS access.
- `npm run build`: passed after the editor, schema and worker changes.
- Browser: full song project, supplied lyrics, real waveform and 89-cue panel loaded; captured console had no errors or warnings.
- Render: H.264/AAC streams, 900 frames, source audio levels and a post-vocal-start frame checked.

The next editorial step is to review the first excerpt's sustained vowels and event timing, then build the actual count changes, supporting characters and full episode. This remains a production draft.
