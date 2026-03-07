/**
 * generate-theme-sprites.mjs
 *
 * Extracts frames from MP4 videos (dark/dim themes) and tiles all three
 * themes into sprite sheets for scroll-scrub canvas animation.
 *
 * Strategy: Extract MP4 → PNG frames (reliable, no animated-webp issues),
 * then feed PNGs directly into the tile filter → output static WebP sprite.
 *
 * Grid: 10 cols × 12 rows = 120 cells (118 frames used, 2 trailing empty OK)
 * Cell resolution: 640×360px  →  sprite: 6400×4320px
 *
 * Output:
 *   public/videos/sprites/sprite_hero_light.webp
 *   public/videos/sprites/sprite_hero_dim.webp
 *   public/videos/sprites/sprite_hero_dark.webp
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "fs";
import { resolve, join, extname } from "path";

// ── ffmpeg binary ──────────────────────────────────────────────────────────────
const FFMPEG =
    "C:\\Users\\Stelios\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin\\ffmpeg.exe";

// ── config ─────────────────────────────────────────────────────────────────────
const PUBLIC = resolve("public");
const OUTPUT_DIR = resolve("public", "videos", "sprites");
const TMP_DIR = resolve("public", "_tmp_frames"); // scratch PNG dir
const NUM_FRAMES = 118;
const GRID_COLS = 10;
const GRID_ROWS = 12;   // 10 × 12 = 120 ≥ 118  ✓
const FRAME_W = 640;
const FRAME_H = 360;
const QUALITY = 72;
const COMPRESSION = 6;

const THEMES = [
    {
        name: "light",
        mp4: null,  // frames already extracted as webp
        framesDir: join(PUBLIC, "frames-light-theme"),
        framesExt: ".webp",
        output: join(OUTPUT_DIR, "sprite_hero_light.webp"),
    },
    {
        name: "dim",
        mp4: join(PUBLIC, "frames-dim-theme", "531c00c4-6a41-4cdf-b8b5-223d25bb2584-ezgif.com-mute-video.mp4"),
        framesDir: join(TMP_DIR, "dim"),
        framesExt: ".png",
        output: join(OUTPUT_DIR, "sprite_hero_dim.webp"),
    },
    {
        name: "dark",
        mp4: join(PUBLIC, "frames-dark-theme", "7463c7dd-770b-4342-b02f-09beacae130b-ezgif.com-mute-video.mp4"),
        framesDir: join(TMP_DIR, "dark"),
        framesExt: ".png",
        output: join(OUTPUT_DIR, "sprite_hero_dark.webp"),
    },
];

// ── helpers ────────────────────────────────────────────────────────────────────

function ensureDir(dir) {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`  📁 Created: ${dir}`);
    }
}

/**
 * Rename `frame_000_delay-0.042s.webp` → `frame_000.webp`
 */
function normaliseWebpNames(dir) {
    const files = readdirSync(dir);
    let count = 0;
    for (const f of files) {
        if (extname(f) !== ".webp") continue;
        const m = f.match(/^(frame_\d+)_.+\.webp$/);
        if (m) {
            const dest = join(dir, `${m[1]}.webp`);
            if (!existsSync(dest)) {
                renameSync(join(dir, f), dest);
                count++;
            }
        }
    }
    if (count) console.log(`  🔄 Renamed ${count} frames`);
}

/**
 * Extract NUM_FRAMES evenly-spaced frames from an MP4 as PNG.
 * PNG avoids the animated-WebP codec confusion with image2 muxer.
 */
function extractFramesAsPng(mp4, outDir) {
    ensureDir(outDir);

    if (existsSync(join(outDir, "frame_000.png"))) {
        console.log(`  ⏭  PNG frames already extracted.`);
        return;
    }

    const out = join(outDir, "frame_%03d.png");
    const cmd = [
        `"${FFMPEG}"`,
        `-i "${mp4}"`,
        `-start_number 0`,
        `-vframes ${NUM_FRAMES}`,
        `-vf "scale=${FRAME_W}:${FRAME_H}"`,
        `-f image2`,
        `"${out}"`,
        `-y`,
    ].join(" ");

    console.log(`  🎬 Extracting ${NUM_FRAMES} frames as PNG...`);
    execSync(cmd, { stdio: "inherit" });
    console.log(`  ✅ PNG frames → ${outDir}`);
}

/**
 * Build sprite sheet by tiling sequential frames.
 * Works with both .webp and .png input.
 */
function buildSprite(framesDir, framesExt, output) {
    const pattern = framesExt === ".webp"
        ? join(framesDir, "frame_%03d.webp")
        : join(framesDir, "frame_%03d.png");

    const cmd = [
        `"${FFMPEG}"`,
        `-start_number 0`,
        `-i "${pattern}"`,
        `-filter_complex "scale=${FRAME_W}:${FRAME_H},tile=${GRID_COLS}x${GRID_ROWS}"`,
        `-vcodec libwebp`,
        `-lossless 0`,
        `-compression_level ${COMPRESSION}`,
        `-q:v ${QUALITY}`,
        `-frames:v 1`,
        `"${output}"`,
        `-y`,
    ].join(" ");

    console.log(`  🗂  Building ${GRID_COLS}×${GRID_ROWS} tile sprite...`);
    execSync(cmd, { stdio: "inherit" });
    console.log(`  ✅ Sprite → ${output}`);
}

// ── main ───────────────────────────────────────────────────────────────────────

ensureDir(OUTPUT_DIR);

for (const theme of THEMES) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`🎨 Theme: ${theme.name.toUpperCase()}`);
    console.log(`${"─".repeat(60)}`);

    if (theme.mp4) {
        if (!existsSync(theme.mp4)) {
            console.error(`❌ MP4 not found: ${theme.mp4}`);
            process.exit(1);
        }
        extractFramesAsPng(theme.mp4, theme.framesDir);
    } else {
        console.log(`  ℹ️  Using pre-extracted frames: ${theme.framesDir}`);
        normaliseWebpNames(theme.framesDir);
    }

    buildSprite(theme.framesDir, theme.framesExt, theme.output);
}

// Clean up tmp PNG dirs
if (existsSync(TMP_DIR)) {
    console.log(`\n🧹 Cleaning up temp PNGs...`);
    rmSync(TMP_DIR, { recursive: true, force: true });
    console.log(`  ✅ Removed: ${TMP_DIR}`);
}

console.log(`\n${"═".repeat(60)}`);
console.log(`🏁 Done! ${THEMES.length} sprite sheets generated.`);
console.log(`Sprites saved to: ${OUTPUT_DIR}`);
console.log(`\nCanvas render formula for frame N:`);
console.log(`  col  = N % ${GRID_COLS}`);
console.log(`  row  = Math.floor(N / ${GRID_COLS})`);
console.log(`  srcX = col * ${FRAME_W}`);
console.log(`  srcY = row * ${FRAME_H}`);
console.log(`  ctx.drawImage(sprite, srcX, srcY, ${FRAME_W}, ${FRAME_H}, 0, 0, canvas.width, canvas.height)`);
