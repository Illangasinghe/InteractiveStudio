# Five Little Kangaroos — story direction and timing evidence

Working editorial plan, 2 November 2026. This document proposes animation against the supplied recording; it does not replace the supplied lyrics or approve the finished episode.

The episode plays as one continuous family story in the Option B warm 2.5D illustrated picture-book aesthetic. Use a consistent watercolor bedroom, a recognisable Dad in glasses and teal robe, a distinct clinic doctor in a lab coat, and the five child kangaroos in their distinct pastel pajamas (peach, blue, warm mustard, mint, lavender). Establish the room before singing starts. Show each described action, then Dad's reaction, then the relevant call and advice. Return to the bedroom with the next verse's exact child count. Dad and visiting adults are supporting cast and must not increase the displayed child count.

All 5 child kangaroos are staged directly on the wooden toddler bed's patchwork quilt (`x = 580..1200, y = 788`) with grounded macropod feet and tripod tails. Dad stands attentively by the arched doorway (`x = 1510, y = 930`), and the sleeping ginger kitten rests peacefully on the teal braided rug (`x = 1750, y = 933`).

Use gentle physical comedy. A child landing on Dad's head is a soft, brief surprise with an immediate reassuring reaction. Keep the cat, nose bump and broken fan scenes non-graphic; show a startled character and a safe resolution. The trampoline ending should include adult supervision. These are editorial staging choices, rather than alterations to the supplied recording.

## Timing evidence

The original vocal stem is `data/projects/five-little-kangaroos-001/audio/0795c6b27b8100a354f6534db0bfe78bdda9699690f02681ce60ddf27b76f091.wav`. FFprobe measures 127.600884 seconds, stereo, 44.1 kHz. Analysis uses a separate first-32-second mono 16 kHz derivative under `data/analysis/story-timing/`; the source and authored project remain unchanged.

FFmpeg silence detection at −36 dB with a minimum pause of 0.15 seconds measures the following groups. These are signal boundaries, not verified word timestamps. The supplied lyric order makes the phrase associations plausible. Changing the threshold changes the measured start or tail slightly because breaths and reverberation remain in the stem.

| Vocal group | Measured signal span | Suggested lyric association | Evidence status |
| --- | --- | --- | --- |
| First sung line | 6.992–10.955 s | Five child kangaroos bouncing on the bed | Signal measured; phrase association inferred |
| First mishap line | 11.664–15.587 s | One leaps and lands on Dad's head | Signal measured; exact action words require review |
| First call line | 16.370–20.244 s | Dad calls the doctor; the doctor is introduced | Signal measured; exact role handoff requires review |
| First advice line | 20.827–24.828 s | Doctor's quoted advice | Signal measured; exact quoted-word alignment requires review |
| Second verse opening | 25.583–29.445 s | Four child kangaroos bouncing on the bed | Signal measured; phrase association inferred |

Local CPU `base.en` transcription substantially improves the action-word evidence over the initial Rhubarb recogniser. An unguided pass and a separate lyric-hinted pass both locate **leap at 12.78–13.06 s**, **landed at 13.36–13.74 s**, **Daddy's at 14.48–15.14 s**, and **head at 15.14–15.36 s**. They also agree on **called near 16.66–17.00 s**, the second **doctor near 19.08–19.42 s**, and **said near 19.40–20.06 s**. These are machine word suggestions, not human-verified alignment. The raw first word often extends into preceding silence, and the words *took*, *No*, and *put* have low model scores or divergent estimates.

The machine-readable proposal is `data/analysis/story-timing/first30-shotplan.json`. It includes exact proposed cuts, cast, source phrases, count state, camera intent and confidence notes. Raw unguided and hinted outputs remain alongside it. They require listening review before approval. Model word probabilities describe the recogniser's hypothesis, not factual accuracy or a guarantee of singing alignment.

## First 30 seconds — proposed shot sequence

There are ten editorial shot records and eleven boundary timestamps, including the final endpoint. The introduction has two unhurried compositions. The four-child shot continues through the real pause at 29.45 s to the 30 s endpoint, so there is no half-second reaction shot. Each boundary is a suggestion for review.

| Time | Phrase or cue | Story action and cast | Camera | Confidence |
| --- | --- | --- | --- | --- |
| 0.00–3.20 | Musical introduction | Establish five child kangaroos, the bed and Dad nearby; mouths idle | Wide, restrained push | Intro staging editorial |
| 3.20–6.99 | Introduction continues | Dad watches the same children with a fond, mildly concerned look; anticipate the first bounce | Medium Dad-and-bed composition | The 3.20 s camera change is editorial; 6.99 s vocal entry is signal measured |
| 6.99–11.66 | Five child kangaroos bouncing | Exactly five children bounce gently; hold through the line's real pause | Medium-wide count shot | Signal plus matching ASR phrase |
| 11.66–13.36 | One takes a leap | Identify roo-1, anticipate, then leap near the model's 12.78 s word estimate | Medium follow | Medium; exact takeoff needs listening review |
| 13.36–16.37 | Landing on Dad's head | Child lands softly; make the contact near 13.78 s, followed by a held reaction through the sung head phrase; Dad steadies the child | Medium Dad-and-child two-shot | Medium; both passes agree on key words |
| 16.37–18.70 | Dad calls the doctor | Show Dad pressing the phone and bringing it to his ear; the child stays safe beside him | Medium phone/action shot | Signal entry plus matching call words |
| 18.70–20.83 | The doctor is introduced | Show a distinct doctor in the clinic; establish the phone connection before the quote | Direct cut to doctor medium shot | Medium; role reveal motivated by second doctor phrase |
| 20.83–23.24 | First part of doctor's advice | Doctor gives a calm stop gesture; quoted dialogue is assigned deliberately | Doctor medium close-up | Medium for phrase; No has uncertain model start |
| 23.24–25.58 | Put them straight to bed | Return to Dad and the four active children settling on the bed; the leaping child stays out of this counting frame | Matching bedroom medium-wide | Low for exact 23.24 s handoff; phrase association clear |
| 25.58–30.00 | Four child kangaroos bouncing, then the phrase pause | Confirm exactly four children on the same bed and resume the bounce. Establish the resting cat safely in the background for the next verse. Hold through 29.45–30.00; stop before the flip | Matching wide count shot, held through the pause | Signal plus matching ASR phrase; no later cat consequence is shown in this excerpt |

Display a child-count graphic only in an unambiguous counting composition. In the leap and Dad reaction shots, five children may still exist in the wider story while four remain on the bed; hide the graphic rather than equating a moving child, a cropped close-up and the active bed count. Dad and the doctor never enter the child count.

## Continuous story treatment

The camera should follow the action with a few motivated cuts. During a sustained phrase, let the action develop in a single shot. Use wide shots for counting, a medium shot for the leap and reaction, then Dad's phone shot and a clear doctor shot. A later split screen could reinforce the phone relationship; this draft establishes it with matching phone props and a direct clinic cut. Avoid cutting at evenly spaced intervals.

Keep the child who leaves identifiable. Once the five-to-four change happens, move that child to a visible resting place with Dad or out of the active bed group; do not silently replace all five children. A count confirmation should refer to the children actively bouncing, with adults visually separated. Caption phrases should be taken from the supplied words and timed at phrase boundaries after review.

Mouth animation should follow the character currently delivering a line only when that assignment is explicitly authored. A single vocal stem is not evidence of separate singers. Narrated action may be illustrated without forcing a child's mouth to sing every word. Dad's call is an action beat; the doctor can deliver the quoted advice. Preserve a visible idle mouth outside each assigned speaking window.

## Full-song plan — untimed beyond the reviewed excerpt

| Verse | Active children | Action and consequence | Call and response | Continuity into next verse |
| --- | --- | --- | --- | --- |
| Five | Five on the bedroom bed | One takes a leap; a gentle landing on Dad's head; Dad steadies the child | Dad uses the phone; a distinct doctor gives the supplied advice | One child settles with Dad; four remain active on the bed |
| Four | Four on the same bed | One tries a flip; cut to the startled cat safely emerging from a soft cushion | Dad calls the vet; show the vet and the supplied helmet advice | Helmets become available; three children remain in the active group |
| Three | Three on the bed | A tossed soft toy reaches the ceiling fan; fan stops; Dad moves the children clear | Dad calls the handyman; show the heavy-duty-bed advice | Show a reinforced bed or the handyman inspecting it; two remain active |
| Two | Two on the bed | One makes a cannonball into a contained pretend splash; the bedspread gets wet | Dad calls the laundry man; show the big-towel response | Towels and a drying bedspread carry into the next scene; one remains active |
| One | One child on the bed | A small moonwalk; a soft bump; Dad reassures the child | Dad calls the dentist; show the Play-Doh suggestion | The last child joins the others in a calmer activity; no child remains bouncing on the bed |
| None on the bed | Zero on the bed; five together in the garden | Establish the empty bedroom, then reveal the supervised garden trampoline | Mommy calls to Dad; Dad delivers the final supplied line | End together in the garden with a gentle settling pose and clear finish |

The following full-song verse starts are **suggestions**, derived from the full local ASR output and nearby vocal-energy onsets. No later shot sequence has been timed or approved. Keep the table above as the valid untimed production plan until each verse is reviewed.

| Verse | Suggested vocal start | Raw ASR count-word start | Confidence note |
| --- | --- | --- | --- |
| Five | 6.99 s | 6.60 s | First32s signal onset is clearer than the model's early word start |
| Four | 25.58 s | 25.32 s | Signal plus recognised count phrase |
| Three | 44.07 s | 43.88 s | Full-song signal plus recognised count phrase |
| Two | 62.58 s | 62.30 s | Full-song signal plus recognised count phrase |
| One | 80.96 s | 79.92 s | Low confidence: model probability for One is about .06 and stretches across silence; energy resumes at 80.961 s |
| None on the bed | 99.31 s | 99.11 s | Full-song signal plus recognised count phrase; the later garden return has five children on a different activity |

The unusual professional choices and quoted responses belong to the supplied song. Keep them recognisable as this fictional family story. Do not silently replace the dentist with a different role or rewrite any source line.

## Local analysis and provenance

The optional local recogniser is [SYSTRAN faster-whisper](https://github.com/SYSTRAN/faster-whisper), using the publisher's [base.en converted Whisper model](https://huggingface.co/Systran/faster-whisper-base.en). CPU `int8` inference and word-timestamp output follow its documented interfaces. Downloaded model weights are used locally; no recording, lyrics, project or personal data is uploaded for analysis. Model and package evidence is kept with the ignored analysis outputs rather than added as a production dependency.

