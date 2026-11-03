# Animation direction, Option B illustrated 2.5D pipeline and Three.js feasibility

Decision note & implementation architecture · November 2026

**InteractiveStudio uses an illustrated 2.5D picture-book production (Option B), with Three.js camera projection as a tested depth option.** This production combines the warm, tactile charm of classic children's picture books (*Beatrix Potter*, *Bluey*) with the modularity, lip-sync, and frame-rate precision of digital animation rigs.

---

## 1. Evolution: Flat Vector SVG to Option B 2.5D Illustrated Storybook

Initial animation used geometric SVG vectors (stroked circles, pill shapes, and flat color paths). In practice, flat geometric vectors felt stiff, created jarring border outlines, and failed to communicate authentic animal anatomy. 

After reviewing three architectural directions:
1. **Option A (Rigged vector puppet)**: Flat vectors with more joints. (Still suffered from artificial vector outlines and flat aesthetic).
2. **Option B (Warm illustrated 2.5D characters & sets)**: Richly textured watercolor and colored-pencil illustrations built into modular puppet rigs, composited into painterly widescreen environments. **(Selected & implemented)**.
3. **Option C (Stylised 3D models)**: Full 3D meshes and rigging in Blender/Three.js. (Deferred until asset proof, due to heavy CPU-rendering benchmarks on standard consumer hardware).

---

## 2. Authentic Kangaroo Anatomy & Rigging Rules

To look like genuine macropods rather than stumpy cartoon rabbits, all kangaroo characters adhere to core anatomical constraints:

1. **Horizontal Macropod Hind Feet**:
   - Long horizontal hind feet with prominent claws that ground flat on the mattress or floorboards.
   - Legs emerge from pajama cuffs or trousers with realistic marsupial ankles and foot pads.
2. **Muscular Tripod Tail**:
   - Thick, heavy tail anchored at the pelvic base (`(-68, 95)` on joeys), extending behind to form a stable tripod stance and resting naturally on the bed or floor.
   - Dynamic counter-swing during hops, leaps, and idle breathing.
3. **Sloping Marsupial Shoulders**:
   - Organic, sloping neck and shoulder silhouettes with seamless limb pivots (no disjointed circular shoulder sockets).
4. **Distinct Identity**:
   - Five distinct pastel bedtime pajama colorways for the five joeys (peach, sky blue, warm mustard, soft mint, and lavender) featuring sweet star patterns, white cuffs, and collar trims.

---

## 3. Harmonized Cast & Set Architecture

Every character and environment shares the exact same warm, softly textured watercolor and colored-pencil aesthetic:

| Entity | Component | Visual Design & Features | Animation Capabilities |
|---|---|---|---|
| **Child Kangaroos (5 Joeys)** | [`IllustratedJoey`](file:///c:/dev/InteractiveStudio/renderer/story/IllustratedJoey.tsx) | Golden fur, cream muzzle, 5 pajama colorways with star prints, long macropod feet and tripod tail. | Synchronous bounce, crouch anticipation, parabolic leap flight, squash & stretch landing, blinking eyelids, lip-sync mouth phonemes. |
| **Daddy Kangaroo** | [`IllustratedDad`](file:///c:/dev/InteractiveStudio/renderer/story/IllustratedDad.tsx) | Kind fatherly expression, round horn-rimmed glasses, spruce-teal buttoned cardigan robe, striped pajamas. | Idle watch, surprised reaction when joey leaps on head, smartphone held to ear, advisory pointing, finale waving, lip-sync. |
| **Doctor Kangaroo** | [`IllustratedDoctor`](file:///c:/dev/InteractiveStudio/renderer/story/IllustratedDoctor.tsx) | Pediatric doctor with forehead reflector mirror, stethoscope, white lab coat with ID badge, mint scrubs. | Phone consultation with Dad, advisory pointing gesture (*"No more kangaroos jumping on the bed!"*), singing lip-sync. |
| **Cozy Sleeping Cat** | [`IllustratedCat`](file:///c:/dev/InteractiveStudio/renderer/story/IllustratedCat.tsx) | Sweet ginger tabby kitten curled peacefully asleep on a teal braided rug. No sticker borders. | Gentle idle breathing, startled alert eyes and hop during reaction beat. |
| **Storybook Bedroom Set** | [`StoryBedroomSet`](file:///c:/dev/InteractiveStudio/renderer/story/Sets.tsx) | 1920×1080 widescreen landscape with peach curtains, morning sun, rolling hills, wooden toddler bed, bookshelf, succulent, arched mint doorway, honey wood floors. | Replaces 35+ lines of vector shapes. Joeys sit directly on the quilt (`x = 580..1200, y = 788`). |
| **Storybook Clinic Set** | [`StoryClinicSet`](file:///c:/dev/InteractiveStudio/renderer/story/Sets.tsx) | 1920×1080 widescreen landscape with animal symbol eye chart, examination bench with paper roll, white glass-door medicine cabinet. | Full environment for doctor dialogue shots. |

---

## 4. Technical Asset Pipeline: De-Haloing & Base64 Data URIs

To maintain 100% deterministic renders in Remotion, headless Chrome (Puppeteer), and local Vite previews:

1. **Soft Anti-Aliased Alpha Matting (De-Haloing)**:
   - High-resolution illustrations generated on solid cream paper backgrounds are extracted using flood-fill perimeter analysis.
   - Pixels along the transition edge are un-premultiplied against the background color (`(246, 239, 219)`) to eliminate white fringing, dark outlines, and "halo" artifacts.
   - Any outer white die-cut sticker borders are removed so characters integrate naturally into the scene.
2. **Base64 Data URI Inlining**:
   - All processed assets are compiled into TypeScript as Base64 Data URIs:
     - [`joeyAssets.ts`](file:///c:/dev/InteractiveStudio/renderer/story/assets/joeyAssets.ts): Head, tail, feet, and 5 colorway torsos/arms.
     - [`storyAssets.ts`](file:///c:/dev/InteractiveStudio/renderer/story/assets/storyAssets.ts): Bedroom background, clinic background, Daddy kangaroo, Doctor kangaroo, and sleeping cat.
   - **Why this is critical**: Eliminates external asset loading latency, file:// protocol sandbox errors, and CORS bundling bugs during headless Remotion rendering.

---

## 5. Staging, Camera Intent & Shot Framing

Each verse follows an authored story sequence:

| Shot | Purpose | Camera Motion | Visible Count Rule |
| --- | --- | --- | --- |
| **Wide** | Establish room, bed, and exact count | Locked or subtle slow push | All active children visible on bed; adults visually separated |
| **Medium** | Focus on character action and relevant prop | Gentle lateral follow | Action readable without losing bed context |
| **Close** | Character reaction, dialogue, or telephone call | Usually locked | Shows expressive acting, blinking, and lip-sync |
| **Detail** | Specific story moment (contact, bump, bandage) | Short, deliberate cut | Immediately returns to context |

- **Reduced Motion**: Locks camera moves, spring oscillations, and bounce squashing while preserving exact story states and visible counts.
- **Lip-Sync**: Assigned dynamically to the active speaker (`cue.value` mouth phonemes `A` through `H`), while non-speaking characters remain in natural resting smiles (`X`).

---

## 6. Three.js Feasibility & Future 3D Path

The isolated prototype in `renderer/three/` (Three.js 0.187.0) proves camera perspective and depth projection without WebGL overhead:
- `projection.ts` calculates perspective projection and spring landings onto SVG planes.
- Full 3D rendering (WebGL) remains deferred until dedicated 3D character assets are benchmarked. The current illustrated 2.5D SVG pipeline renders a 30-second episode in ~45 seconds on standard consumer CPUs, maintaining instant previews and low operational overhead.
