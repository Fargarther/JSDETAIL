// Watches original image assets and maintains matching WebP exports.
import fs from "fs";
import path from "path";
import sharp from "sharp";
import chokidar from "chokidar";

const inputDir = path.join(process.cwd(), "public/Images/originals");
const outputDir = path.join(process.cwd(), "public/Images/webp");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(inputDir)) {
  fs.mkdirSync(inputDir, { recursive: true });
}

const formats = [
  { suffix: "", width: 1920 },
  { suffix: "@2x", width: 3840 },
];

function getQuality(fileName) {
  const lower = fileName.toLowerCase();

  if (lower.includes("hero") || lower.includes("banner") || lower.includes("slider")) {
    return 90;
  }

  if (lower.includes("bg") || lower.includes("background") || lower.includes("texture")) {
    return 75;
  }

  if (lower.includes("logo") || lower.includes("icon")) {
    return 85;
  }

  return 85;
}

async function convertFile(inputPath) {
  const file = path.basename(inputPath);
  const baseName = path.parse(file).name;
  const ext = path.extname(file).toLowerCase();

  if (![".jpg", ".jpeg", ".png"].includes(ext)) {
    return;
  }

  const quality = getQuality(baseName);

  for (const fmt of formats) {
    const outputPath = path.join(outputDir, `${baseName}${fmt.suffix}.webp`);

    try {
      await sharp(inputPath)
        .resize({ width: fmt.width, withoutEnlargement: true })
        .webp({ quality, effort: 4 })
        .toFile(outputPath);

      console.log(`✅ ${file} → ${path.basename(outputPath)} (q=${quality})`);
    } catch (error) {
      console.error(`❌ Error converting ${file}: ${error.message}`);
    }
  }
}

function deleteConvertedFile(inputPath) {
  const baseName = path.parse(path.basename(inputPath)).name;

  for (const fmt of formats) {
    const outputPath = path.join(outputDir, `${baseName}${fmt.suffix}.webp`);

    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
      console.log(`🗑️ Removed ${path.basename(outputPath)}`);
    }
  }
}

async function convertAllExisting() {
  const files = fs.readdirSync(inputDir);

  for (const file of files) {
    // Purposefully await sequentially to avoid i/o bursts on large batches.
    await convertFile(path.join(inputDir, file));
  }

  console.log("🎉 Initial conversion complete.");
}

function watchFolder() {
  console.log("👀 Watching for new or deleted images...");
  const watcher = chokidar.watch(inputDir, { persistent: true, ignoreInitial: true });

  watcher.on("add", (inputPath) => {
    void convertFile(inputPath);
  });

  watcher.on("change", (inputPath) => {
    void convertFile(inputPath);
  });

  watcher.on("unlink", (inputPath) => {
    deleteConvertedFile(inputPath);
  });
}

convertAllExisting()
  .then(watchFolder)
  .catch((error) => {
    console.error("❌ Unable to start conversion:", error.message);
    process.exitCode = 1;
  });
