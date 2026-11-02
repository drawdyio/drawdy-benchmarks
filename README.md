# Drawdy benchmarks

**With 10,000 elements on one board and all of it in view, Drawdy pans at 120 frames a second. Excalidraw manages 9.9 and tldraw 11.** Measured 2 November 2026 with the latest version of each editor.

![Frame rate with 10,000 elements: Drawdy 120, 118 and 120 fps; Excalidraw 9.9, 3.5 and 104; tldraw 11, 54 and 92](2026-11-02-canvas-10k-recheck/charts/frame-rate.svg)

![Three rows panning the same 10,000-element board: Drawdy moves smoothly, Excalidraw and tldraw jump about ten times a second](2026-11-02-canvas-10k-recheck/images/whole-board-pan.gif)

*Real renders from each editor. Each row shows a new frame only as often as that editor drew one in the benchmark. A GIF plays at most 50 frames a second, so Drawdy's 120 shows as 50 here.*

## Opening, freezes and memory

| 10,000 elements | Drawdy | Excalidraw 0.18.1 | tldraw 5.6.0 |
|---|---:|---:|---:|
| Time to open the board | **0.15 s** | 1.4 s | 1.1 s |
| Longest freeze (slowest single frame) | **26 ms** | 2,133 ms | 250 ms |
| Memory the board adds | **76 MB** | 591 MB | 190 MB |

Lower is better. MacBook Pro M4 Pro, Chrome 155, 120 Hz screen, median of 3 runs. Every number and the method: [the re-check](2026-11-02-canvas-10k-recheck/).

## Studies

Each study has its own dated folder with the results, the raw data and the method.

| Study | Measured | Editors | Result |
|---|---|---|---|
| [10,000-element canvas, re-check](2026-11-02-canvas-10k-recheck/) | 2 Nov 2026 | Drawdy, Excalidraw 0.18.1, tldraw 5.6.0 | Same result with the latest versions |
| [10,000-element canvas](2026-09-24-canvas-10k/) ([method](2026-09-24-canvas-10k/METHODOLOGY.md)) | 24 Sep 2026 | Drawdy, Excalidraw 0.18.1, tldraw 5.4.2 | Drawdy 120 fps, Excalidraw 10, tldraw 11 with the whole board in view |

Charts are generated from each study's `results.json`, for example `node scripts/charts.mjs 2026-11-02-canvas-10k-recheck`.

## Licence

© 2026 Pichaya Puttekulangkura. The scripts in `scripts/` are licensed under the [MIT licence](LICENSE-MIT). Everything else (results, documentation, charts, images and results pages) is licensed under [CC BY 4.0](LICENSE-CC-BY-4.0): you can reuse it with credit. The Excalidraw and tldraw interfaces shown in the screenshots belong to their owners.
