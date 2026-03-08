# Cedar Voxel Editor — Project Context

## What This Is

A browser-based voxel editor (think MagicaVoxel) built for the Cedar Summer Internship tech challenge. Users place and remove colored cubes on a 3D grid to sculpt structures. Evaluated on: quality/UX (30%), technical execution (25%), AI tool usage (25%), communication (20%).

**Submission:** Public GitHub repo + live Vercel URL + AI chat logs.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **3D:** React Three Fiber + `@react-three/drei` + Three.js
- **Styling:** Tailwind CSS v4 — custom colors defined in `app/globals.css` via `@theme inline` block (no `tailwind.config.ts` — Tailwind v4 is CSS-based)
- **Tests:** Vitest + jsdom + `@testing-library/react` (run: `npm run test`)
- **AI:** Not included in this build (removed from scope)
- **Deploy:** Vercel free tier
- **Font:** Space Grotesk (variable: `--font-space-grotesk`)

## Cedar Design Language

| Token | Value | Usage |
|---|---|---|
| `--color-cedar-black` | `#000000` | Canvas + page background |
| `--color-cedar-orange` | `#FF6B35` | Active state, ghost voxel, accent |
| `--color-cedar-gray` | `#1A1A1A` | UI panel backgrounds |
| `--color-cedar-gray-light` | `#2A2A2A` | Hover states, borders |
| `--color-cedar-border` | `#333333` | Subtle dividers |

These colors were chosen intentionally to mirror Cedar's brand — this is a product thinking decision, not just aesthetics.

---

## Running the Project

```bash
npm run dev        # Dev server → localhost:3000
npm run test       # Vitest unit tests (pure logic: voxel store, history, raycasting)
npm run build      # Production build
```

---

## Architecture Notes

**Voxel Storage** — `Map<"x,y,z", Voxel>` with O(1) lookup. All mutations return new Maps (immutable) to enable React re-renders and undo/redo without complexity.

**Rendering** — `THREE.InstancedMesh` with 10,000 pre-allocated slots. Iterates the Map each frame, calls `setMatrixAt` + `setColorAt` per voxel. One draw call = 1000+ voxels at 60fps.

**Raycasting** — Two targets: (1) large invisible floor `PlaneGeometry` for ground placement, (2) the instanced mesh for face-adjacent placement. `snapToGrid` uses the intersection face normal to offset adjacently rather than placing inside existing voxels.

**Undo/Redo** — Command pattern: `{ type: 'add' | 'remove', voxel }`. Past + future stacks. New action clears future stack. Pure TS functions in `lib/history.ts`.

**Grid Size** — Configurable via toolbar button. Cycles 16→32→64. `gridSize` state lives in `app/page.tsx`, flows to `VoxelScene` (Grid component args + fadeDistance) and `SceneInteraction` (floor placement bounds = `[-(gridSize/2)+1, gridSize/2]`).

---

## Milestone 1: Project Foundation (DONE)

**Goal:** Get a fully configured Next.js project with all dependencies, design system, and testing infrastructure in place so every subsequent milestone builds on a solid base.

- **Task 1.1 — Bootstrap:** `create-next-app` with TypeScript + Tailwind v4 + ESLint + App Router. Install `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three`, `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`.
- **Task 1.2 — Config:** `vitest.config.ts` (jsdom env, React plugin, `@` alias, `passWithNoTests`). `vitest.setup.ts` (imports jest-dom matchers). `package.json` test + test:watch scripts. `globals.css` Cedar brand color tokens in `@theme inline`. `layout.tsx` Space Grotesk font + correct metadata.
- **Success Criteria:** `npm run dev` serves on :3000 without errors. `npm run test` exits 0. Tailwind `text-cedar-orange` compiles. Space Grotesk loads in browser.

---

## Milestone 2: Base 3D Scene (TODO)

**Goal:** A full-viewport Three.js canvas with lighting, a grid floor, and orbit controls — so the 3D environment is navigable before any voxel logic exists.

- **Task 2.1 — Page shell:** `app/page.tsx` — full-viewport `div` (100vw × 100vh, no overflow), renders `<VoxelScene />` plus a `<div>` overlay anchor for HUD.
- **Task 2.2 — Canvas setup:** `components/VoxelScene.tsx` (`'use client'`). R3F `<Canvas>` with `gl={{ antialias: true }}`, `camera={{ position: [15, 15, 15], fov: 60 }}`. Scene background `#000000`. `<ambientLight intensity={0.4} />`. `<directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />`.
- **Task 2.3 — Grid + controls:** `<gridHelper args={[32, 32, '#333333', '#222222']} />` for the floor reference. `<OrbitControls enableDamping dampingFactor={0.05} />` from `@react-three/drei`. Right-drag = pan, left-drag = orbit, scroll = zoom.
- **Success Criteria:** Dark canvas renders. Grid visible at y=0. Orbit/zoom/pan all work. No console errors. `npm run test` still passes.

---

## Milestone 3: Voxel State & Data Model (TODO)

**Goal:** Build the pure-TypeScript data layer that every other feature (render, raycast, undo, AI) depends on — and prove it correct with unit tests before wiring it to React.

- **Task 3.1 — `lib/voxelStore.ts`:** Export `Voxel` type `{ x, y, z, color: string }`. Export `VoxelMap = Map<string, Voxel>`. Functions: `voxelKey(x,y,z)`, `addVoxel(map, voxel): VoxelMap` (returns new Map — never mutates), `removeVoxel(map, x, y, z): VoxelMap`, `hasVoxel(map, x, y, z): boolean`, `listVoxels(map): Voxel[]`.
- **Task 3.2 — `hooks/useVoxels.ts`:** React hook holding `useState<VoxelMap>`. Exposes `{ voxels, placeVoxel(x,y,z,color), removeVoxel(x,y,z), setVoxels(map) }`. This is the single source of truth passed down to all 3D components.
- **Task 3.3 — `lib/voxelStore.test.ts`:** `addVoxel` creates entry at correct key. `removeVoxel` removes entry without mutating original. `hasVoxel` false on empty map. Key collision: adding same `x,y,z` twice updates color. `listVoxels` returns all entries as array.
- **Success Criteria:** All Vitest tests pass. `npm run test` green.

---

## Milestone 4: Voxel Rendering — Instanced Mesh (TODO)

**Goal:** Render every voxel in the `VoxelMap` as a colored cube, performantly enough to handle 1000+ voxels at 60fps via a single GPU draw call.

- **Task 4.1 — `components/VoxelInstances.tsx`:** `useRef<THREE.InstancedMesh>`. Pre-allocate 10,000 instances. On each frame (via `useFrame` or `useEffect` on `voxels`): iterate Map, call `mesh.setMatrixAt(i, matrix)` (translate to voxel position) and `mesh.setColorAt(i, color)` per voxel. Set `count = voxels.size`. Mark `instanceMatrix.needsUpdate` and `instanceColor.needsUpdate`. Geometry: `<boxGeometry args={[1, 1, 1]} />`. Material: `<meshLambertMaterial vertexColors />`.
- **Task 4.2 — Wire into scene:** Add `<VoxelInstances voxels={voxels} />` inside `VoxelScene`. Pass `voxels` down from root page state.
- **Success Criteria:** Placing test voxels programmatically renders colored cubes. Placing 1,000 voxels stays at 60fps (check DevTools Performance tab). Removing a voxel from the Map removes it from the render.

---

## Milestone 5: Raycasting — Place & Remove (TODO)

**Goal:** Left-click places a voxel on the grid or adjacent to an existing block. Right-click (or Erase tool + left-click) removes. This is the core editing loop.

- **Task 5.1 — `lib/raycasting.ts`:** Pure TS helper `snapToGrid(point: Vector3, normal: Vector3): {x,y,z}`. When normal points up (floor hit): round x/z to integers, y=0. When normal points sideways (voxel face hit): offset the hit point by the face normal (place adjacent, not inside). Export `getPlacementPosition` and `getRemovalKey`.
- **Task 5.2 — `lib/raycasting.test.ts`:** `snapToGrid` floor hit rounds to nearest integer. `snapToGrid` face hit places adjacent (not overlapping). Edge cases: negative coordinates, boundary positions.
- **Task 5.3 — `hooks/useVoxelInteraction.ts`:** Accepts `{ voxels, tool, color, placeVoxel, removeVoxel }`. Handles `onPointerDown` on the Canvas. Cast ray against floor plane + instanced mesh. Left-click in `place` mode → `placeVoxel`. Left-click in `erase` mode → `removeVoxel`. Prevent placing voxels that overlap existing ones.
- **Task 5.4 — Invisible floor plane:** Large `<mesh rotation={[-Math.PI/2, 0, 0]}>` with `<planeGeometry args={[100, 100]} />` and `<meshBasicMaterial visible={false} />` at y=0 to catch raycasts on empty ground.
- **Success Criteria:** Click on empty grid → block appears. Click on face of existing block → adjacent block appears. Right-click on block → block disappears. No blocks placed inside existing blocks.

---

## Milestone 6: Ghost Voxel — Placement Preview (TODO)

**Goal:** A semi-transparent voxel tracks the cursor to show exactly where the next block will land before the user clicks — key UX affordance.

- **Task 6.1 — `components/GhostVoxel.tsx`:** Runs `snapToGrid` on every `onPointerMove` event (same raycasting logic as Milestone 5). Renders `<mesh position={[x, y, z]}>` with `<meshLambertMaterial color="#FF6B35" transparent opacity={0.45} depthWrite={false} />`. Hidden (`visible={false}`) when cursor leaves a valid surface.
- **Task 6.2 — Color by tool:** Orange (`#FF6B35`) in `place` mode. Red (`#FF3535`) in `erase` mode. Receives `tool` prop.
- **Success Criteria:** Orange ghost cube tracks mouse in real time. Snaps to correct grid position. Disappears when cursor leaves the canvas. Changes to red in erase mode.

---

## Milestone 7: UI Chrome — Color Palette & Tool Mode (TODO)

**Goal:** Build the HUD overlay: color picker, tool toggle (place/erase), keyboard shortcuts. This is the main UI expression of the Cedar design system.

- **Task 7.1 — `components/ColorPalette.tsx`:** 16 preset swatches: earthy tones, primaries, Cedar orange (`#FF6B35`) as default selected. Grid layout (4×4). Active swatch: `ring-2 ring-cedar-orange`. Custom color via `<input type="color" />`. Calls `onColorChange(hex)` prop. Styled: `bg-cedar-gray border border-cedar-border` panel, Space Grotesk Bold labels.
- **Task 7.2 — `components/Toolbar.tsx`:** Place button (pencil icon) and Erase button (eraser icon). Active tool: `bg-cedar-orange text-black`. Inactive: `bg-cedar-gray text-white`. Keyboard shortcuts: `B` → place, `E` → erase. Undo (`↩`) and Redo (`↪`) buttons, greyed when stack empty. Grid size cycle button. Voxel count badge: `237 voxels`.
- **Task 7.3 — Wire state:** `app/page.tsx` owns `tool`, `color`, `voxels`. Passes to `VoxelScene` (for 3D) and toolbar overlay (for UI). `useEffect` keyboard listener for `B`/`E` shortcuts.
- **Success Criteria:** 16 swatches render. Picking a swatch + placing a block uses that color. Tool toggle changes mode. Ghost voxel color updates. Keyboard shortcuts work. Count updates live.

---

## Milestone 8: Undo / Redo (TODO)

**Goal:** Ctrl+Z undoes the last action; Ctrl+Shift+Z redoes. Essential for any editing tool and directly demonstrates robust state management.

- **Task 8.1 — `lib/history.ts`:** Types: `Command = { type: 'add' | 'remove', voxel: Voxel }`, `History = { past: Command[], future: Command[] }`. Functions: `pushCommand(history, cmd): History` (clears future on new action), `undo(history, voxels): { history, voxels }`, `redo(history, voxels): { history, voxels }`. All pure — no React, no side effects.
- **Task 8.2 — `lib/history.test.ts`:** `undo` after add → voxel removed, command in future. `redo` after undo → voxel restored. New action after undo → future cleared. `undo` on empty history → no-op, no crash. `redo` on empty future → no-op.
- **Task 8.3 — Integrate into `useVoxels`:** Every `placeVoxel` / `removeVoxel` call goes through `pushCommand`. Expose `undo()` and `redo()` from the hook. Track `canUndo` / `canRedo` booleans.
- **Task 8.4 — Keyboard + UI:** `useEffect` in root layout for `Ctrl+Z` (undo) and `Ctrl+Shift+Z` / `Ctrl+Y` (redo). Undo/redo buttons in toolbar reflect `canUndo` / `canRedo`.
- **Success Criteria:** All Vitest tests green. Ctrl+Z removes last placed block. Ctrl+Z on a removed block re-adds it. Ctrl+Shift+Z redoes. Undo button greyed when history empty.

---

## Milestone 9: Grid Size Control (DONE)

**Goal:** Let users resize the grid via the toolbar — a simple button cycles through 16×16, 32×32, and 64×64 grids.

- **Task 9.1 — State:** `gridSize: number` (default 32) in `app/page.tsx`. Prop-drilled to `Toolbar`, `VoxelScene`, `SceneInteraction`.
- **Task 9.2 — Toolbar button:** Cycles `16 → 32 → 64 → 16`. Labeled `GRID 32×32`.
- **Task 9.3 — VoxelScene:** `<Grid args={[gridSize, gridSize]} fadeDistance={gridSize * 2} />`. Passes `gridSize` down to `SceneInteraction`.
- **Task 9.4 — SceneInteraction bounds:** Floor placement clamped to `x/z ∈ [-(gridSize/2)+1, gridSize/2]`. Ghost also hidden outside bounds.
- **Success Criteria:** Clicking the grid button expands/shrinks the grid; floor placement respects new bounds; existing voxels unaffected.

---

## Milestone 10: "Why Me" Page (TODO)

**Goal:** A `/about` page that functions as a product pitch — demonstrating alignment with Cedar's mission and intentional design decisions before the debrief call.

- **Task 10.1 — `app/about/page.tsx`:** Sections: (1) brief intro tying your background to Cedar's work at the intersection of 3D geometry + spatial data + real-time interfaces, (2) design rationale — explain that the black/orange palette mirrors Cedar's brand intentionally as a product thinking decision, (3) AI development process — describe how Claude Code was used as a development partner throughout this build, (4) what you'd do differently / next steps. Dark aesthetic consistent with editor.
- **Task 10.2 — Nav link:** Small "About" or "?" link in the voxel editor HUD that navigates to `/about`. Back link on the about page returns to editor.
- **Success Criteria:** `/about` accessible, readable, consistent with editor aesthetic. Links work in both directions.

---

## Milestone 11: Polish & Deploy (TODO)

**Goal:** Ship a production-quality product to Vercel with animations, UX touches, and a live URL.

- **Task 11.1 — Animations:** Install `@react-spring/three`. New voxels animate `scale` from 0.8 → 1.0 on mount (spring easing). Removed voxels shrink to 0 before disappearing.
- **Task 11.2 — UX touches:** "Clear All" button with a `window.confirm` guard. Help overlay (`?` button) listing keyboard shortcuts and mouse controls. Voxel count badge in toolbar. Cursor changes to crosshair over the canvas.
- **Task 11.3 — Deploy:** `git push origin main`. Connect to Vercel. Confirm live URL works end-to-end.
- **Success Criteria:** Live Vercel URL accessible. No console errors. 60fps with 500+ voxels on production.

---

## Deferred Feature Requests (future milestones)

- **Color wheel** — upgrade palette to HSV color wheel so users can pick any hue intuitively
- **Info overlay** — "i" or "?" button that shows a controls reference: click to place, right-click/erase mode to remove, left-drag orbit, scroll zoom, right-drag pan (pan = sliding camera sideways, not rotating)

---

## File Map (actual, post-refactor)

```
app/
  layout.tsx                  # Space Grotesk font, metadata
  page.tsx                    # Root: owns tool/color/voxels state, mounts VoxelScene
  globals.css                 # Tailwind v4 @theme, Cedar colors, body reset (#111111 bg)

components/
  VoxelScene.tsx              # R3F Canvas: lights, grid (offset [0.5,0,0.5] for alignment), OrbitControls
  SceneInteraction.tsx        # Unified: InstancedMesh (count={voxels.size}), floor plane, ghost preview
  Toolbar.tsx                 # (pending) Place/erase, undo/redo, color palette, voxel count

lib/
  voxelStore.ts               # Pure TS: VoxelMap CRUD (immutable)
  voxelStore.test.ts          # 16 tests
  raycasting.ts               # Pure TS: snapToFloor, getAdjacentPosition, getHitVoxelPosition
  raycasting.test.ts          # 10 tests
  history.ts                  # Pure TS: undo/redo command stack
  history.test.ts             # 11 tests
hooks/
  useVoxels.ts                # React state: VoxelMap + history, exposes placeVoxel/removeVoxel/undo/redo
  useVoxelInteraction.ts      # Raycasting + pointer event handler for Canvas
```
