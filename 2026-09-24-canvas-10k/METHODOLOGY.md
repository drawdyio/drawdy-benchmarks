# Methodology: 10,000-element canvas benchmark

This file records how the numbers in [README.md](README.md) were produced, in enough detail to repeat or challenge them. The raw output is [`results.json`](results.json).

## Question

How smoothly does each editor draw, and how quickly does it open, when a board holds 10,000 elements?

## Test environment

| | |
|---|---|
| Machine | MacBook Pro, Apple M4 Pro, 24 GB memory, built-in 120 Hz display |
| OS | macOS 27.0 (26A428) |
| Browser | Google Chrome 153.0.8010.53, visible window (not headless), GPU on |
| Window | 1440 × 900 CSS px at device pixel ratio 2 |
| Measured refresh rate | 120.3 frames a second on an empty page (2 s of `requestAnimationFrame`) |
| Date | 24 September 2026 |

Chrome was started with `--disable-background-timer-throttling`, `--disable-renderer-backgrounding` and `--disable-backgrounding-occluded-windows` so a covered window keeps full speed, and `--enable-precise-memory-info`.

## Editors

| Editor | Version | How it was mounted |
|---|---|---|
| Drawdy | Drawdy at commit `747286dd` | The editor engine drawdy.io runs, with its drag and select tools and without the app's toolbar and panels. Drawdy's Handwriting font was loaded before the test. |
| Excalidraw | `@excalidraw/excalidraw` 0.18.1 | `<Excalidraw />` with default props and default UI, pointed at a local copy of its fonts (`EXCALIDRAW_ASSET_PATH`). |
| tldraw | `tldraw` 5.4.2 | `<Tldraw options={{ maxShapesPerPage: 10_000 }} />` with default UI. The default limit is 4,000 shapes per page, below the test size. |

All three used React 19.2.3 and were built with Vite 8.3.0 in production mode, served from `localhost`. Each test page loads only the editor under test.

## Test board

One generated board, identical for every editor.

- **Layout.** A 125 × 80 grid of 100-unit cells, 10,000 cells, one element per cell. Each element sits 8 to 20 units into its cell. The whole board spans about 12,500 × 8,000 units and is centred on the origin.
- **Mix.** 30% rectangles (rounded corners), 15% ellipses, 10% diamonds, 15% arrows, 15% text labels and 15% freehand pen strokes.
- **Sizes.** Shapes are 50 to 80 units wide and 35 to 70 tall. Arrows are two-point lines of the same size. Pen strokes have 24 points along a sine wave. Labels are one or two words at 16, 18 or 20 px.
- **Style.** Five stroke colours, stroke width 2, Excalidraw roughness 1. 35% of closed shapes have a solid fill in one of four light colours.
- **Randomness.** Seeded (`mulberry32(20260924)`), so every run and every editor gets the same board.

## Opening the board

Each editor receives the board as a JSON string in its own format and loads it through its own importer. Building the string is not timed; parsing it is.

| Editor | Input | Import path |
|---|---|---|
| Excalidraw | 6.56 MB Excalidraw file JSON | `JSON.parse`, then `restoreElements()` (Excalidraw's file loader), then `updateScene()` |
| Drawdy | the same elements as Excalidraw clipboard JSON (6.56 MB) | Drawdy's Excalidraw paste importer, then the selection is cleared |
| tldraw | 2.16 MB tldraw shape JSON with the same geometry | `JSON.parse`, then `editor.createShapes()` with history off |

**Open time** runs from handing over the string to the start of the first run of three consecutive frames under 20 ms: the moment the editor has finished the work and is drawing at full speed again. Before loading, the camera is already zoomed to fit the whole board, so the first frame draws all 10,000 elements.

All three editors reported 10,000 elements after loading, and the screenshots show the full grid drawn.

## Camera paths

After loading, a script moves each editor's camera on three identical paths. On every frame (`requestAnimationFrame`) it computes the camera for the elapsed time and passes it to the editor's own camera API, only when the camera has changed:

- Drawdy: its viewport API, setting zoom and pan in one call
- Excalidraw: `updateScene({ appState: { zoom, scrollX, scrollY } })`
- tldraw: `setCamera({ x, y, z }, { immediate: true, force: true })`

Each path runs for 0.5 s of warm-up, then 6 s of measurement. `t` is seconds since the path started; `z0` is the zoom that fits the whole board (0.107 in this window).

| Path | Camera | What it tests |
|---|---|---|
| Pan with the whole board in view | zoom `z0`; centre circles the board centre at 1,500 × 900 units, one lap every 4 s | drawing all 10,000 elements every frame |
| Zoom in and out, in short bursts | centre fixed; zoom moves between `z0` and 100% for 0.4 s, then holds for 0.25 s, repeating; zoom = `z0 · (1/z0)^k`, `k = (1 − cos(2πu / 2.4)) / 2`, where `u` counts only the moving time | zoom changes and the redraw after each zoom stops |
| Pan at 100% zoom | zoom 1; centre moves 1,600 units/s sideways and 500 units/s down (1,676 px/s along the diagonal) | new areas entering the view at working zoom |

The zoom test pauses on purpose. Drawdy scales its cached tiles while the zoom changes and redraws them sharp 80 ms after the zoom stops. A continuous zoom would never trigger that redraw inside the measured window, so it would hide real work. With pauses, every editor's after-zoom work lands inside the 6 s.

## Metrics

| Metric | Definition |
|---|---|
| Frame rate (fps) | frames produced per second during the 6 s, from `requestAnimationFrame` timestamps. A frame that takes longer than one screen refresh lowers it. Capped at 120 by the screen. |
| Median, 95th and 99th percentile frame (ms) | the time between consecutive frames, sorted |
| Frames over 50 ms | count of frames that took longer than 50 ms, a visible stutter |
| Longest freeze (ms) | the slowest single frame in a run across all three paths |
| Open time (ms) | see [Opening the board](#opening-the-board) |
| Memory added (MB) | increase in the macOS memory footprint (`footprint -p <pid>`, the figure Activity Monitor shows) of the tab's renderer process plus the GPU process, from just before loading to 2 s after, each after a forced garbage collection |
| JS heap added (MB) | increase in the JavaScript heap (`Runtime.getHeapUsage`) over the same interval |

## Runs and statistics

- 3 runs per editor. Each run starts a fresh browser.
- Editors run in rotating order (run 1: Drawdy, Excalidraw, tldraw; run 2: Excalidraw, tldraw, Drawdy; run 3: tldraw, Drawdy, Excalidraw) so no editor always runs first on a cool machine.
- 2 s pause after mounting and after loading; 1 s pause between paths.
- Reported values are medians of the 3 runs. [README.md](README.md#spread-across-runs) lists the spread.

## Fairness decisions

1. **Same board, own importer.** Each editor loads the board the way its users would, from its own file or clipboard format, rather than through one shared API.
2. **Same camera path, public API.** The script drives each editor's public camera API rather than synthetic mouse wheel events, so every editor gets the exact same camera positions. The numbers measure drawing, not input handling.
3. **Default settings**, except tldraw's shape limit, which had to be raised for the board to load.
4. **Local fonts** for Excalidraw and Drawdy, so neither depended on a font CDN. tldraw used its default font URLs. All measurements start after the editor mounts and the page's fonts are ready.
5. **Production builds**, since development builds add React checks that slow every editor down.

## Limitations

1. **One machine and one browser.** Other hardware, Safari and Firefox will give different absolute numbers.
2. **Drawdy ran without its app UI**; Excalidraw and tldraw ran with theirs.
3. **Frame rate counts frames, not image quality.** During a zoom Drawdy shows scaled tiles until its sharp redraw runs 80 ms after the zoom stops. The burst test counts that redraw, but frame counts alone do not show how sharp each frame was.
4. **A synthetic grid**, with no images, grouped elements, frames or bound connectors. Real boards cluster elements differently.
5. **Memory is noisy.** The GPU process is shared by the whole browser, so its footprint moves for reasons outside the test. Drawdy's memory varied from 41 to 108 MB across runs.
6. **Drawdy's Excalidraw importer changed the fill colours** on its light theme: fills came out darker than in Excalidraw. The element types, fill style and counts were unchanged, so drawing cost should not differ, but the Drawdy screenshot looks darker for this reason.
7. **Every run logged one 404 console message** from the test page itself, identical for all three editors. No editor logged errors.

## Raw data: `results.json`

| Field | Contents |
|---|---|
| `meta` | date, machine, browser, measured refresh rate, window, editor versions, runs, seconds per path |
| `summary.<editor>` | medians: `loadMs`, `footprintMB`, `jsHeapMB`, `rendererMB` and `gpuMB` (resident memory, noisier), and per path `fps`, `p50`, `p95`, `p99`, `max`, `over50` |
| `results[]` | one entry per editor per run: input size in characters, `load` (`loadMs`, `count`), memory `before` and `after`, frame stats per path, console errors |

## Code

The harness that produced these numbers runs against Drawdy's unreleased editor source, so it is not published. The board, camera paths, metrics and statistics above are described in enough detail to build the same test for other editors.
