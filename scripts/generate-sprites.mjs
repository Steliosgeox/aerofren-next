/**
 * generate-sprites.mjs
 * Generates optimized sprite sheets from WebP frame sequences using ffmpeg's
 * tile filter. Each sprite sheet packs all frames into a single WebP file,
 * reducing browser HTTP requests from 192 to 1 per transition.
 *
 * Grid layout: 8 columns × 24 rows = 192 frames
 * Frame resolution in sprite: 640×360 (half-res; canvas upscales to full display)
 * Output sprite size: 5120×8640px
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { resolve, join } from "path";

const FFMPEG =
    "C:\\Users\\Stelios\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin\\ffmpeg.exe";

const PUBLIC = resolve("public", "About us");
const OUTPUT_DIR = resolve("public", "videos", "sprites");

// Columns × rows must exactly equal the number of frames
const GRID_COLS = 8;
const GRID_ROWS = 24; // 8 × 24 = 192 frames
const FRAME_W = 640;
const FRAME_H = 360;

const TRANSITIONS = [
    {
        name: "transition_down",
        framesDir: join(PUBLIC, "frames", "transition_down"),
        output: join(OUTPUT_DIR, "sprite_down.webp"),
    },
    {
        name: "transition_up",
        framesDir: join(PUBLIC, "frames", "transition_up"),
        output: join(OUTPUT_DIR, "sprite_up.webp"),
    },
];

if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created output directory: ${OUTPUT_DIR}`);
}

for (const t of TRANSITIONS) {
    console.log(`\n🎞  Processing "${t.name}"...`);

    if (!existsSync(t.framesDir)) {
        console.error(`❌ Frames directory not found: ${t.framesDir}`);
        process.exit(1);
    }

    // ffmpeg tile filter:
    // - Reads sequential frame_%04d.webp from framesDir
    // - Scales each frame to FRAME_W×FRAME_H
    // - Tiles them into a GRID_COLS×GRID_ROWS grid
    // - Encodes output as high-quality WebP
    const inputPattern = join(t.framesDir, "frame_%04d.webp");
    const cmd = [
        `"${FFMPEG}"`,
        `-framerate 24`,
        `-i "${inputPattern}"`,
        `-filter_complex "scale=${FRAME_W}:${FRAME_H},tile=${GRID_COLS}x${GRID_ROWS}"`,
        `-vcodec libwebp`,
        `-lossless 0`,
        `-compression_level 5`,
        `-q:v 82`,
        `-frames:v 1`,
        `"${t.output}"`,
        `-y`, // overwrite without prompt
    ].join(" ");

    console.log(`  Running ffmpeg tile filter...`);
    try {
        execSync(cmd, { stdio: "inherit" });
        console.log(`  ✅ Sprite sheet saved: ${t.output}`);
    } catch (err) {
        console.error(`  ❌ Failed to generate sprite for "${t.name}"`);
        process.exit(1);
    }
}

console.log(`\n🏁 Done! Generated ${TRANSITIONS.length} sprite sheets.`);
console.log(`\nSprite layout for canvas rendering:`);
console.log(`  Grid:      ${GRID_COLS} cols × ${GRID_ROWS} rows`);
console.log(`  Cell size: ${FRAME_W}×${FRAME_H}px`);
console.log(`  Total:     ${GRID_COLS * FRAME_W}×${GRID_ROWS * FRAME_H}px`);
console.log(`\nTo render frame N (0-indexed) on canvas:`);
console.log(`  col  = N % ${GRID_COLS}`);
console.log(`  row  = Math.floor(N / ${GRID_COLS})`);
console.log(`  srcX = col * ${FRAME_W}`);
console.log(`  srcY = row * ${FRAME_H}`);
console.log(
    `  ctx.drawImage(sprite, srcX, srcY, ${FRAME_W}, ${FRAME_H}, 0, 0, canvas.width, canvas.height)`
);
