# Story iteration verification

Checked locally on Windows, November 2026.

## 1. Option B Illustrated 2.5D Verification

- **Automated Test Suite**: `npm test`: 25 passed, 0 failed, 0 skipped. All story schema, camera bounds, Rhubarb lip-sync conversion, Three.js projection, and audio timing tests pass deterministically.
- **Illustrated Character Rigs**:
  - `IllustratedJoey`: 5 colorways verified on the bed (`x = 580..1200, y = 788`), with long macropod feet grounded on mattress, heavy tripod tail at pelvic base, dynamic bounce and leap flight, blinking eyelids, and phoneme mouth shapes.
  - `IllustratedDad`: Adult kangaroo father with horn-rimmed glasses and spruce-teal cardigan robe standing by doorway (`x = 1510, y = 930`), verified in idle watch, leap reaction on head, phone call with doctor, and waving.
  - `IllustratedDoctor`: Pediatric kangaroo doctor in clinic (`x = 985, y = 932`), verified with stethoscope, head mirror, phone call consultation, and singing advice with pointing gesture.
  - `IllustratedCat`: Ginger tabby kitten on round teal braided rug, verified with de-haloed edges (zero white border sticker artifacts), idle breathing, and startled alert eyes.
- **Illustrated Widescreen Sets**:
  - `StoryBedroomSet`: 1920×1080 watercolor bedroom with peach curtains, morning sun, rolling hills, wooden toddler bed with lavender quilt, bookshelf with succulent, and arched mint doorway.
  - `StoryClinicSet`: 1920×1080 watercolor pediatric clinic with animal eye chart, examination bench with paper roll, and medicine cabinet.
  - `StoryBedForeground`: Geometric vector rail discarded so watercolor bed frames scene naturally.

## 2. Render Artifacts & Stills

13 Remotion QA stills rendered under `data/exports/story-qa/`:

| Shot | Time | Beat / Action | Verified Feature |
|---|---|---|---|
| `shot-01.png` | 1.60 s | `room-establish` | 5 joeys in colorway pajamas seated on bed, Dad watching from door |
| `shot-02.png` | 5.10 s | `daddy-notices` | Dad looking on with fond expression |
| `shot-03.png` | 9.32 s | `five-on-the-bed` | 5 kangaroos bouncing in sync with count UI pill "5 ON THE BED" |
| `shot-04.png` | 12.51 s | `the-big-leap` | Roo 1 crouch anticipation and parabolic takeoff |
| `shot-05.png` | 14.87 s | `daddy-surprised` | Roo 1 landing on Dad's head, Dad reacting with surprised mouth & eyes |
| `shot-06.png` | 17.54 s | `the-phone-call` | Dad holding phone to ear calling doctor, Roo 1 standing safely beside him |
| `shot-07.png` | 19.77 s | `doctor-listens` | Doctor Kangaroo listening on smartphone in pediatric clinic |
| `shot-08.png` | 22.03 s | `doctor-replies` | Doctor singing advice with lip-sync mouth shape and speech bubble |
| `shot-09.png` | 24.41 s | `a-gentler-bedtime` | 4 joeys settling back on the bed |
| `shot-10.png` | 27.79 s | `four-and-a-cat` | 4 joeys bouncing, Dad watching, sleeping cat curled on rug |
| `shot-11.png` | 13.10 s | `leap-flight` | Apex of flight arc across the bedroom |
| `shot-12.png` | 13.50 s | `contact-approach` | Roo 1 descending towards Dad |
| `shot-13.png` | 13.80 s | `contact-landed` | Contact landing and spring damping |

Full Episode Render:
- `data/exports/five-little-kangaroos-story-draft.mp4`: H.264, 960×540, 30 fps, 900 frames, 30.000 seconds, AAC 48 kHz stereo soundtrack. File size: 6,000,933 bytes.

## 3. Git Provenance

- Code and assets committed and pushed to `main` at commit `d0c56e7`.
- Pipeline reference: [ILLUSTRATED_2.5D_PIPELINE.md](ILLUSTRATED_2.5D_PIPELINE.md).
- Animation direction: [ANIMATION_DIRECTION.md](ANIMATION_DIRECTION.md).
- Storyboard treatment: [STORYBOARD.md](STORYBOARD.md).
