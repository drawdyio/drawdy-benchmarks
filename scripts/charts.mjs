import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const study = process.argv[2];
if (!study) {
    console.error("usage: node scripts/charts.mjs <study-folder>");
    process.exit(1);
}
const { meta, summary, results } = JSON.parse(
    readFileSync(path.join(study, "results.json"), "utf8")
);
const outDir = path.join(study, "charts");
mkdirSync(outDir, { recursive: true });

const EDITORS = [
    { id: "drawdy", name: "Drawdy", color: "#9cc400" },
    { id: "excalidraw", name: "Excalidraw", color: "#8f79e0" },
    { id: "tldraw", name: "tldraw", color: "#e07a51" },
    { id: "drawio", name: "draw.io", color: "#4a90d9" },
].filter(({ id }) => id in summary);
const HZ = Math.round(meta.displayHz);
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const INK = "#18181b";
const MUTED = "#52525b";
const FAINT = "#a1a1aa";
const GRID = "#ececef";

const W = 880;
const PAD = 28;
const X0 = 170;
const BW = 600;
const BAR_H = 20;

const median = (xs) => {
    const s = [...xs].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const worstFrame = (lib) =>
    median(
        results
            .filter((r) => r.lib === lib)
            .map((r) => Math.max(...Object.values(r.scenarios).map((s) => s.max)))
    );
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const fmt = (v, unit) => {
    const digits = unit === "fps" && v < 10 ? 1 : 0;
    return `${v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${unit}`;
};
const niceStep = (max) => {
    const raw = max / 5;
    const mag = 10 ** Math.floor(Math.log10(raw));
    return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
};

const text = (x, y, s, { size = 14, weight = 400, fill = INK, anchor = "start", halo = false } = {}) =>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${halo ? ' stroke="#ffffff" stroke-width="5" stroke-linejoin="round" paint-order="stroke"' : ""}>${esc(s)}</text>`;
const bar = (x, y, w, color) => {
    const r = Math.min(4, w);
    return `<path d="M${x} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + BAR_H - r} Q${x + w} ${y + BAR_H} ${x + w - r} ${y + BAR_H} H${x} Z" fill="${color}"/>`;
};
const svg = (h, title, desc, body) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" font-family="${FONT}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<rect x="0.5" y="0.5" width="${W - 1}" height="${h - 1}" rx="12" fill="#ffffff" stroke="#e4e4e7"/>
${body}
</svg>
`;
const header = (title, subtitle) =>
    text(PAD, 44, title, { size: 20, weight: 650 }) + text(PAD, 70, subtitle, { fill: MUTED });
const legend = (y) =>
    EDITORS.map(({ name, color }, i) => {
        const x = PAD + i * 130;
        return `<rect x="${x}" y="${y - 11}" width="14" height="14" rx="3" fill="${color}"/>${text(x + 22, y, name, { fill: MUTED })}`;
    }).join("");
const axis = (top, bottom, max, step, unit) => {
    let out = "";
    for (let v = 0; v <= max + 1e-9; v += step) {
        const x = X0 + (v / max) * BW;
        out += `<line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" stroke="${GRID}"/>`;
        out += text(x, bottom + 18, v.toLocaleString("en-US"), { size: 12, fill: FAINT, anchor: "middle" });
    }
    return out + text(X0 + BW / 2, bottom + 38, unit, { size: 12, fill: FAINT, anchor: "middle" });
};

function frameRate() {
    const groups = [
        ["overview-pan", "Pan with the whole board in view"],
        ["zoom-bursts", "Zoom in and out, in short bursts"],
        ["closeup-pan", "Pan at 100% zoom"],
    ];
    const top = 126;
    const groupH = 44 + EDITORS.length * 30;
    const bottom = top + groups.length * groupH - 18;
    let body = header(
        "Frame rate with 10,000 elements",
        `Frames per second, higher is better. Median of ${meta.runs} runs. The screen refreshes ${HZ} times a second.`
    );
    body += legend(100);
    body += axis(top - 6, bottom, HZ, 30, "frames per second");
    const limit = X0 + BW;
    body += `<line x1="${limit}" y1="${top - 6}" x2="${limit}" y2="${bottom}" stroke="${FAINT}" stroke-dasharray="4 4"/>`;
    body += text(limit + 8, top + 8, "screen limit", { size: 12, fill: FAINT });
    const lines = [];
    groups.forEach(([key, label], g) => {
        const gy = top + g * groupH;
        body += text(PAD, gy + 14, label, { size: 15, weight: 600 });
        EDITORS.forEach(({ id, name, color }, i) => {
            const v = Math.min(HZ, summary[id].scenarios[key].fps);
            const y = gy + 26 + i * 30;
            const w = Math.max(2, (v / HZ) * BW);
            body += text(PAD + 12, y + 15, name, { fill: MUTED });
            body += bar(X0, y, w, color);
            body += text(X0 + w + 10, y + 15, fmt(v, "fps"), { weight: 650, halo: true });
            lines.push(`${label}, ${name}: ${fmt(v, "fps")}`);
        });
    });
    return svg(bottom + 56, "Frame rate with 10,000 elements", lines.join(". "), body);
}

function single(title, subtitle, unit, get) {
    const top = 98;
    const rowH = 34;
    const bottom = top + EDITORS.length * rowH;
    const vals = EDITORS.map(({ id }) => get(id));
    const step = niceStep(Math.max(...vals));
    const max = Math.ceil(Math.max(...vals) / step) * step;
    let body = header(title, subtitle);
    body += axis(top - 8, bottom, max, step, unit);
    EDITORS.forEach(({ name, color }, i) => {
        const v = vals[i];
        const y = top + i * rowH;
        const w = Math.max(2, (v / max) * BW);
        body += text(PAD, y + 15, name, { size: 15, weight: 600 });
        body += bar(X0, y, w, color);
        body += text(X0 + w + 10, y + 15, fmt(v, unit), { weight: 650, halo: true });
    });
    const desc = EDITORS.map(({ name }, i) => `${name}: ${fmt(vals[i], unit)}`).join(". ");
    return svg(bottom + 56, title, desc, body);
}

function oneSecond() {
    const top = 96;
    const rowH = 50;
    let body = header(
        "One second of panning with the whole board in view",
        `Each tick is one frame the editor finished. ${HZ} ticks is the most a ${HZ} Hz screen can show.`
    );
    const lines = [];
    EDITORS.forEach(({ id, name, color }, i) => {
        const n = Math.round(Math.min(HZ, summary[id].scenarios["overview-pan"].fps));
        const y = top + i * rowH;
        body += `<rect x="${PAD}" y="${y + 7}" width="14" height="14" rx="3" fill="${color}"/>`;
        body += text(PAD + 22, y + 19, name, { size: 15, weight: 600 });
        body += `<line x1="${X0}" y1="${y + 30}" x2="${X0 + BW}" y2="${y + 30}" stroke="${GRID}"/>`;
        for (let k = 0; k < n; k++) {
            const x = X0 + ((k + 0.5) / n) * BW;
            body += `<line x1="${x.toFixed(1)}" y1="${y}" x2="${x.toFixed(1)}" y2="${y + 28}" stroke="#3f3f46" stroke-width="2" stroke-linecap="round"/>`;
        }
        body += text(X0 + BW + 16, y + 20, `${n} frames`, { weight: 650 });
        lines.push(`${name}: ${n} frames`);
    });
    return svg(top + EDITORS.length * rowH + 16, "One second of panning", lines.join(". "), body);
}

const charts = {
    "frame-rate.svg": frameRate(),
    "one-second.svg": oneSecond(),
    "longest-freeze.svg": single(
        "Longest freeze",
        `Slowest single frame across the three camera tests, lower is better. Median of ${meta.runs} runs.`,
        "ms",
        worstFrame
    ),
    "open-time.svg": single(
        "Time to open the board",
        `From handing the editor the file until it is drawn and responsive, lower is better. Median of ${meta.runs} runs.`,
        "ms",
        (id) => summary[id].loadMs
    ),
    "memory.svg": single(
        "Memory the board adds",
        `Increase in renderer and GPU process footprint after loading, lower is better. Median of ${meta.runs} runs.`,
        "MB",
        (id) => summary[id].footprintMB
    ),
};
for (const [file, content] of Object.entries(charts)) {
    writeFileSync(path.join(outDir, file), content);
    console.log(path.join(outDir, file));
}
