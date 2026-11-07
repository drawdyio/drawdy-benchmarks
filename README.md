# Drawdy benchmarks

**With 10,000 elements on one board and all of it in view, Drawdy and draw.io pan at 120 frames a second. Excalidraw manages 9.9 and tldraw 12. Zooming in and out, Drawdy holds 117 fps and draw.io drops to 57.** Measured 7 November 2026 with the latest version of each editor.

![Frame rate with 10,000 elements: Drawdy 120, 117 and 120 fps; Excalidraw 9.9, 1.6 and 99; tldraw 12, 54 and 94; draw.io 120, 57 and 120](2026-11-07-canvas-10k-drawio/charts/frame-rate.svg)

![Four rows panning the same 10,000-element board: Drawdy and draw.io move smoothly, Excalidraw and tldraw jump about ten times a second](2026-11-07-canvas-10k-drawio/images/whole-board-pan.gif)

*Real renders from each editor. Each row shows a new frame only as often as that editor drew one in the benchmark. A GIF plays at most 50 frames a second, so Drawdy's and draw.io's 120 show as 50 here. draw.io pans by scrolling a picture it has already painted, which is why it keeps up while panning and slows down when zooming.*

## Opening, freezes and memory

| 10,000 elements | Drawdy | Excalidraw 0.18.1 | tldraw 5.6.0 | draw.io 32.6.10 |
|---|---:|---:|---:|---:|
| Time to open the board | **0.19 s** | 1.5 s | 1.1 s | 1.0 s |
| Longest freeze (slowest single frame) | **42 ms** | 2,651 ms | 283 ms | 75 ms |
| Memory the board adds (renderer + GPU) | **19 MB** | 607 MB | 162 MB | 80 MB |
| Renderer memory the board adds | **55 MB** | 462 MB | 454 MB | 264 MB |

Lower is better. MacBook Pro M4 Pro, Chrome 156, 120 Hz screen, median of 3 runs. The renderer + GPU figure moved by up to 106 MB between runs; the renderer alone by under 10 MB. Every number and the method: [the draw.io study](2026-11-07-canvas-10k-drawio/).

## Studies

Each study has its own dated folder with the results, the raw data and the method.

| Study | Measured | Editors | Result |
|---|---|---|---|
| [10,000-element canvas with draw.io](2026-11-07-canvas-10k-drawio/) | 7 Nov 2026 | Drawdy, Excalidraw 0.18.1, tldraw 5.6.0, draw.io 32.6.10 | Drawdy and draw.io pan at 120 fps; zooming, Drawdy 117 fps and draw.io 57 |
| [10,000-element canvas, re-check](2026-11-02-canvas-10k-recheck/) | 2 Nov 2026 | Drawdy, Excalidraw 0.18.1, tldraw 5.6.0 | Same result with the latest versions |
| [10,000-element canvas](2026-09-24-canvas-10k/) ([method](2026-09-24-canvas-10k/METHODOLOGY.md)) | 24 Sep 2026 | Drawdy, Excalidraw 0.18.1, tldraw 5.4.2 | Drawdy 120 fps, Excalidraw 10, tldraw 11 with the whole board in view |

Charts are generated from each study's `results.json`, for example `node scripts/charts.mjs 2026-11-07-canvas-10k-drawio`.

## Licence

© 2026 Pichaya Puttekulangkura. The scripts in `scripts/` are licensed under the [MIT licence](LICENSE-MIT). Everything else (results, documentation, charts, images and results pages) is licensed under [CC BY 4.0](LICENSE-CC-BY-4.0): you can reuse it with credit. The Excalidraw, tldraw and draw.io interfaces shown in the screenshots belong to their owners.
