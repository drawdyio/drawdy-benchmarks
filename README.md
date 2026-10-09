# Drawdy benchmarks

Performance studies of Drawdy against other whiteboard editors. Each study has its own dated folder with the results, the methodology and the raw data.

| Study | Measured | Editors | Result |
|---|---|---|---|
| [10,000-element canvas](2026-09-24-canvas-10k/) ([method](2026-09-24-canvas-10k/METHODOLOGY.md)) | 24 Sep 2026 | Drawdy, Excalidraw 0.18.1, tldraw 5.4.2 | With all 10,000 elements in view, Drawdy pans at 120 fps, Excalidraw at 10 and tldraw at 11 |

![Frame rate with 10,000 elements](2026-09-24-canvas-10k/charts/frame-rate.svg)

Charts are generated from each study's `results.json`:

```sh
node scripts/charts.mjs 2026-09-24-canvas-10k
```
