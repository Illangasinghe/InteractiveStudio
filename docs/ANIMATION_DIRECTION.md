# Animation direction and Three.js feasibility

Decision note · 2 November 2026

**Use a story-led 2.5D puppet production for the current song, with Three.js camera projection as a tested option.** Three.js is a useful route to depth, perspective and future 3D props. It does not supply a finished kangaroo rig, acting, scene timing or a storyboard. Those remain the main quality work.

## What should improve the actual episode

Each verse needs a readable setup, an action, a reaction and a resulting state. Establish the animals on the bed, make the named action understandable, show the response, then confirm the remaining count. The ending needs an empty-bed beat followed by the kangaroos together on the garden trampoline. Keep the supplied lyrics as the editorial reference; review timing against the performed recording.

Use the camera to direct attention at those beats:

| Shot | Purpose | Suitable motion |
| --- | --- | --- |
| Wide | Establish the room, bed and accurate visible count | Locked or a slow, small push |
| Medium | Show the acting character and the relevant prop | Gentle push or a short lateral move |
| Close | Show an expression, a spoken response or a clear reaction | Usually locked |
| Detail | Show the important object or contact point | Short, deliberate cut; return to context afterwards |

Begin each shot from an authored composition. Keep moves bounded, ease them at their ends and avoid continuous drifting. A pan or zoom should reveal a story detail. Count-confirmation shots must keep all counted animals visible. Reduced motion locks the camera and removes bounce/spring movement; it must preserve the same story states.

Character improvements should include anticipation before a jump, a coherent flight arc, contact and recovery, a small tail follow-through, eye direction and an appropriate reaction pose. Add a prop only when the action needs it. Repeated idle bouncing alone will not communicate the different verse events.

## Core Paradigm: Pose-Based Action Assets vs. Over-Jointed Puppets

A critical architectural learning from the early iterations is the clear superiority of **action-specific illustrated assets** over **over-jointed mechanical puppets**:

### Why Over-Jointed Skeletal 2D Puppets Fail in Storybook Animation
1. **Mechanical Seams & Edge Creases**: Slicing a painted character into 10+ micro-limbs (upper arm, forearm, hand, chin, snout) and rotating them programmatically causes awkward gaps, dislocated shoulders, and visible joint overlaps. In watercolor and colored pencil styles, cloth folds and directional shadows cannot simply rotate without breaking the illusion.
2. **Floating Vector Overlays**: When a generic standing puppet has to perform an action (e.g. holding a phone, pointing a finger, or wearing glasses), attempting to paste flat geometric shapes (`<rect>`, `<ellipse>`) or vector stick arms onto painted fur results in a jarring "sticker-on-sticker" visual clash.
3. **Rigid, Lifeless Silhouettes**: A single static body mesh rotated mechanically cannot convey a genuine change in emotional state (e.g., a father standing calmly vs. a father hunched over in worry speaking into an emergency receiver).

### The Pose-Based Asset Solution: Fewer Moving Parts, Richer Actions
Instead of building complex mechanical armatures with dozens of moving joints, the production follows the classical picture-book animation paradigm (*Bluey*, *Beatrix Potter*, *Sarah & Duck*):

* **Dedicated, Natively Painted Action Assets**: Create complete, handcrafted watercolor illustrations for specific narrative beats:
  - `daddy_kangaroo_standing.png` (relaxed bedtime supervision)
  - `daddy_kangaroo_phone.png` (worried fatherly posture holding phone handset to ear)
  - `doctor_kangaroo_phone.png` (listening attentively on clinic telephone)
  - `doctor_kangaroo_advice.png` (advisory wagging finger with paw in coat pocket)
  - `joey_bounce.png` (upright joyful bounce on mattress)
  - `joey_landing_rug.png` (sitting gently on braided rug holding bumped head)
* **Integrated Props & Hands**: Props (phones, stethoscopes, bandages, helmets) are painted organically into the character's paws with correct perspective, occlusion, and lighting.
* **Scene-Level Dynamics**: Movement is driven by high-level physical transforms rather than micro-joint rotations:
  - **Parabolic Trajectory**: Flight arcs calculated via clean projectile physics ($y(t) = y_0 + v_0 t - \frac{1}{2} g t^2$).
  - **Squash & Stretch**: Dynamic volume-preserving scaling ($S_x \times S_y \approx 1$) on anticipation and landing.
  - **Secondary Motion**: Organic breathing cycles, advisory sways, and synchronized speech bobs (`talkBob`).
* **Deterministic, CPU-Friendly Renders**: Swapping and transforming complete illustrated assets renders in milliseconds per frame in Remotion without WebGL shader overhead, Z-fighting, or alpha sorting bugs.

---

## 2.5D now, full 3D after an asset proof

The current SVG approach can separate the rear wall, room props, bed, character bodies and foreground details. Placing those layers at different authored depths adds parallax while preserving the existing visual style. Three.js's perspective camera and vector projection provide standard 3D-to-screen calculations; this can project a 2D character billboard alongside a perspective bed or prop. See the official [PerspectiveCamera implementation and API documentation comments](https://raw.githubusercontent.com/mrdoob/three.js/r187/src/cameras/PerspectiveCamera.js) and [Vector3 implementation](https://raw.githubusercontent.com/mrdoob/three.js/r187/src/math/Vector3.js).

A full 3D version would require approved character meshes, a skeleton, skinning, facial/mouth shapes, textures and reusable acting clips. It would also need a room and prop pipeline, lighting decisions and render benchmarks. A camera orbit that reveals a flat puppet's side is inappropriate; restrict the current production to shots supported by the artwork.

Three.js can later be used for a limited 3D room or bed while characters remain illustrated. Prove one recognisable 3D prop and one useful shot before replacing the main renderer.

## Implemented isolated prototype

The main song renderer now also has an authored story-shot layer: supporting characters, phone and advice props, a clinic set, an action kangaroo, and an explicitly assigned speaking actor. Its camera wrapper implements wide/medium/close/detail framing, bounded push/pull/pan/follow moves and cut/dissolve transitions. Count badges remain outside camera transforms and refer to the child group on the bed. Reduced motion freezes camera tracks and staged movement. These main-renderer camera transforms use SVG; they do not claim the Three.js prototype's perspective projection.

The 30-second story project has ten timed draft shots. Imported story data rejects unimplemented moments, actors without a staging position, speakers absent from the shot, and child groups in empty-bed/doctor cutaways. Later verse events remain production work in the full-song storyboard. They are not exposed as working editor choices merely because an outfit has been drawn.

The prototype in `renderer/three/` uses **Three.js 0.187.0** and matching `@types/three` **0.187.0**. It creates a real `PerspectiveCamera`, projects world points with `Vector3`, draws a schematic bed and a flat kangaroo into SVG, and samples a small spring response from the current frame. It does not create a WebGL context.

| File | Responsibility |
| --- | --- |
| `projection.ts` | Bounded camera tracks, perspective projection and an analytic bed-bounce sample |
| `projection.test.ts` | Deterministic seeking, depth parallax, movement limits, reduced motion and numeric validation |
| `CameraBounceStudy.tsx` | Remotion frame-driven, schematic visual study |
| `index.tsx` | Separate six-second study composition; the episode composition is unaffected |
| `render-study.ts` | Four frame PNGs and an optional six-second MP4 |

Run from the repository root:

```powershell
node --import tsx --test renderer/three/projection.test.ts
node --import tsx renderer/three/render-study.ts --video
```

The render helper uses an installed Chrome/Edge executable, or `REMOTION_BROWSER_EXECUTABLE`, and writes under `data/exports/three-camera-study/`. Its artifact is a camera-and-motion feasibility study, not the finished song animation. The main editor does not automatically switch to this study.

The settings use the same shot and movement vocabulary intended for scene cameras: wide/medium/close/detail and locked/push-in/pull-out/pan-left/pan-right/follow-action, with intensity from zero to one. The helper owns no project schema or saved scene data. Integrating its projection into the main renderer remains a separate decision.

## Simulate the effect, preserve repeatability

For this production, use authored trajectories and closed-form motion: a parabolic flight arc, squash on anticipation, and a damped spring after mattress contact. Every value must be a function of the absolute frame and explicit settings. This supports scrubbing and rendering frames in any order.

The implemented spring is a staged visual effect. It does not solve collisions, bed deformation, anatomy or forces. The scene author must set contact positions and make the action convincing. Introduce a physics engine only if a specific shot needs interactions that authored curves cannot reasonably express; record or deterministically bake the result before final rendering.

## A future WebGL integration

Remotion provides `@remotion/three` to connect React Three Fiber to Remotion. Its `ThreeCanvas` documentation requires animation to be derived from `useCurrentFrame()` rather than a live `useFrame()` loop, and requires explicit canvas dimensions. See [Remotion's Three integration](https://www.remotion.dev/docs/three) and [ThreeCanvas](https://www.remotion.dev/docs/three-canvas).

That route adds React Three Fiber and a version-matched `@remotion/three`. The current project has Remotion 4.0.539, so a future experiment should align all Remotion packages to one exact version instead of independently installing the latest Three integration. No React Three Fiber or `ThreeCanvas` dependency is needed by this projection study.

WebGL rendering can benefit substantially from GPU support. For Remotion 4 on a machine without a GPU, the official backend guidance recommends `swangle` and notes that rendering can be slow. Benchmark an actual representative shot before committing to full 3D; reduce geometry, texture size, shadows and post-processing as needed. This study uses CPU camera maths and ordinary SVG rendering, so it does not require that WebGL backend. See [Remotion GPU guidance](https://www.remotion.dev/docs/gpu) and [GL backend recommendations](https://www.remotion.dev/docs/gl-options).

Measure preview responsiveness, export time, memory and visual consistency on the actual Windows machine. The number of scene objects alone is not a reliable performance promise.

## Licensing

Three.js is MIT-licensed and permits commercial use and modification, subject to preserving its copyright and license notice. It can be used in a proprietary InteractiveStudio product; this does not remove Remotion's separate licensing requirements or licenses for any imported 3D assets. See the [Three.js r187 license](https://raw.githubusercontent.com/mrdoob/three.js/r187/LICENSE) and the existing [productisation note](PRODUCTISATION.md).

The immediate success criterion remains a coherent, editable scene that tells the lyric's story. The projection study establishes a camera and spring technique; it does not establish a complete 3D animation pipeline.
