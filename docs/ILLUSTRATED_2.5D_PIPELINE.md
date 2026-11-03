# Option B: Illustrated 2.5D Storybook Pipeline

Technical Reference · InteractiveStudio · November 2026

This document details the architecture, image processing algorithms, and SVG/React rigging used to deliver the Option B warm 2.5D illustrated picture-book production.

---

## 1. Pipeline Overview

```mermaid
flowchart TD
    A["Image Generation Brief\n(Beatrix Potter / Picture-Book Style)"] --> B["High-Res Illustration\n(Solid Cream Background)"]
    B --> C["Alpha Matting & De-Haloing\n(BFS Flood-Fill & Edge Un-premultiplication)"]
    C --> D["Part Slicing & Colorway Generation\n(Head, Torso, Limbs, Tail, Feet)"]
    D --> E["Base64 Data URI Inlining\n(joeyAssets.ts & storyAssets.ts)"]
    E --> F["Modular SVG/React Rigging\n(IllustratedJoey, IllustratedDad, IllustratedDoctor, IllustratedCat)"]
    F --> G["Remotion Video Bundling\n(Vite Preview & Headless MP4 Renderer)"]
```

---

## 2. Image Processing & De-Haloing

Generated characters on paper backgrounds contain watercolor grain and warm tinted paper fibers (e.g. `RGB ≈ 246, 239, 219`). Standard color-keying leaves ugly white fringes or dark jagged halos.

### The De-Haloing Algorithm

1. **Outer Boundary Sampling**: Sample image perimeter pixels to determine exact background paper tone $(R_{bg}, G_{bg}, B_{bg})$.
2. **BFS Flood-Fill from Borders**: Flood from all four image boundaries, classifying pixels by color distance:
   $$\text{dist} = \sqrt{(R - R_{bg})^2 + (G - G_{bg})^2 + (B - B_{bg})^2}$$
   This ensures cream patches *inside* the character (such as chest patches, white collars, or lab coats) are not accidentally cut away.
3. **Soft Alpha & Color Un-premultiplication**:
   For transition edge pixels with alpha $\alpha \in (0, 1)$:
   $$R_{clean} = \max\left(0, \min\left(255, \frac{R_{sample} - (1 - \alpha) R_{bg}}{\alpha}\right)\right)$$
   This strips the tinted background paper color out of semi-transparent fur and whisker pixels, eliminating the halo completely.
4. **Sticker Rim Removal**: For spot illustrations (such as the sleeping cat), any outer die-cut white border is flood-filled and trimmed so the subject blends directly into the scene.

---

## 3. Asset Modules & Base64 Data URI Inlining

External image file paths (`file://` or relative URLs) introduce latency, CORS restrictions, and path-resolution failures when rendering through Remotion's headless Chrome instances.

All processed assets are converted to Base64 strings and exported as TypeScript constants:

| Asset File | Output TS File | Exported Identifier | Purpose |
|---|---|---|---|
| `storybook_bedroom_bg.jpg` | `storyAssets.ts` | `storybookBedroomDataUri` | 1920×1080 Widescreen Bedroom Background |
| `storybook_clinic_bg.jpg` | `storyAssets.ts` | `storybookClinicDataUri` | 1920×1080 Widescreen Clinic Background |
| `daddy_kangaroo.png` | `storyAssets.ts` | `daddyKangarooDataUri` | Full-body standing kangaroo father |
| `daddy_kangaroo_phone.png` | `storyAssets.ts` | `daddyKangarooPhoneDataUri` | Full-body Daddy holding telephone receiver to ear |
| `doctor_kangaroo.png` | `storyAssets.ts` | `doctorKangarooDataUri` | Kangaroo doctor holding phone in clinic |
| `doctor_kangaroo_advice.png` | `storyAssets.ts` | `doctorKangarooAdviceDataUri` | Kangaroo doctor wagging finger in gentle advice |
| `sleeping_cat.png` | `storyAssets.ts` | `sleepingCatDataUri` | Curled sleeping kitten on braided rug |
| `joey/head.png` | `joeyAssets.ts` | `headDataUri` | Baby kangaroo head & ears |
| `joey/tail.png` | `joeyAssets.ts` | `tailDataUri` | Baby kangaroo tripod tail |
| `joey/foot_left.png` | `joeyAssets.ts` | `footLeftDataUri` | Near hind foot (3/4 angle) |
| `joey/foot_right.png` | `joeyAssets.ts` | `footRightDataUri` | Far hind foot (horizontal ground) |
| `joey/torso_*.png` | `joeyAssets.ts` | `COLORWAY_TORSOS` | 5 bedtime pajama colorways |
| `joey/arm_*.png` | `joeyAssets.ts` | `COLORWAY_ARMS_*` | Left and right pajama arms |

---

## 4. Rigging Architecture

### 4.1 IllustratedJoey Rigging (`IllustratedJoey.tsx`)

Layer stack inside the root `<g>` transform:
1. **Contact Shadow**: Scaled dynamically with bounce height (`ellipse cx="10" cy="2"`).
2. **Layer 1 (Tail)**: Anchored at pelvic base `(-68, 95)` behind body, counter-swinging with bounce phase:
   $$\text{tailSwing} = \cos(\text{phase} - 0.5) \times 11^\circ$$
3. **Layer 2 (Hind Feet)**: Macropod horizontal feet placed at `y = 136..142`, grounded under pajama leg cuffs.
4. **Layer 3 (Torso)**: Pajama body with distinct colorway patterns and star prints.
5. **Layer 4 (Limbs)**: Left and right arms with shoulder pivots `(-42, -72)` and `(38, -72)`, supporting bounce arm-flaps, leaps, and waves.
6. **Layer 5 (Head & Face)**: Head graphic with soft mouth opacity during singing phonemes; natural illustrated closed mouth used during resting states without crude dark vector ellipses.

### 4.2 IllustratedDad Rigging (`IllustratedDad.tsx`)

1. **Standing Pose**: Stands by bedroom door (`x = 1600, y = 930`). Round spectacles and eyes are organically painted in watercolor—no synthetic vector pupil dots or glasses wireframes overlay the face.
2. **Phone Consultation**: Switches to `daddyKangarooPhoneDataUri` when calling the doctor (`pose === 'phone'`). His arm and paw naturally hold a vintage telephone receiver to his ear, with caring, worried eyebrows behind his spectacles—eliminating the pasted-on vector smartphone box.
3. **Natural Lip-Sync & Acting**: Subtle head nod (`talkBob = Math.sin(time * 12) * 1.8`) when speaking into the phone.

### 4.3 IllustratedDoctor Rigging (`IllustratedDoctor.tsx`)

1. **Clinic Call (`pose === 'phone'`)**: Renders `doctorKangarooDataUri` listening on the clinic telephone.
2. **Advisory Stance (`pose === 'point'`)**: Switches seamlessly to `doctorKangarooAdviceDataUri` when singing *"No more kangaroos jumping on the bed!"*. Doctor Kangaroo stands with one hand in his coat pocket and the other paw gently wagging an index finger with a natural sway (`adviceWag`). Vector stick arms and cartoon dialogue boxes are completely eliminated.

### 4.4 IllustratedCat Rigging (`IllustratedCat.tsx`)

1. **Idle State**: Curled peacefully on teal braided rug with soft respiratory bobbing (`Math.sin(time * 2.2) * 1.5`).
2. **Startled State**: Cute alert eyes and startle hop during the reaction cutaway.

---

## 5. Sets & Staging Alignment

1. **Bed Group Coordinates**: 5 joeys positioned across the mattress quilt (`x = 580..1200, y = 788`).
2. **Leap & Floor Landing**: The featured joey leaps off the bed in a continuous parabolic flight arc, landing cleanly onto the braided floor rug at `x = 1360, y = 925` beside the foot of the bed. This avoids flying through Daddy Kangaroo (`x = 1600`), giving clear theatrical separation.
3. **Doctor Clinic**: Doctor stands centered in the examination room (`x = 985, y = 932`) with full medical background cabinetry and window garden views.
   $$\text{bedX}(i) = 580 + (i - 1) \times 155 \quad \text{for } i \in [1, 5]$$
   Places the five kangaroos between $x = 580$ and $x = 1200$ directly atop the illustrated toddler bed's mattress and purple quilt at $y = 788$.
2. **Leap Trajectory**:
   $$\begin{aligned}
   x(p) &= x_{\text{start}} + (1510 - x_{\text{start}}) \times p \\
   y(p) &= 788 + (535 - 788) \times p - 220 \times 4p(1 - p) \\
   \text{rot}(p) &= -18^\circ + 27^\circ \times p
   \end{aligned}$$
   Creates a smooth parabolic arc from the bed onto Daddy Kangaroo's head/shoulders.

