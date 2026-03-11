import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { GravelRoadFeatureCollection } from "../schema";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../data");

/**
 * Writes a GeoJSON FeatureCollection to a file.
 */
export function writeGeoJSON(
  collection: GravelRoadFeatureCollection,
  filename: string
): string {
  const processedDir = join(DATA_DIR, "processed");
  mkdirSync(processedDir, { recursive: true });

  const outputPath = join(processedDir, filename);
  writeFileSync(outputPath, JSON.stringify(collection));

  console.log(`  Wrote GeoJSON to ${outputPath}`);
  return outputPath;
}

/**
 * Runs Tippecanoe to convert GeoJSON into an MBTiles vector tile set.
 *
 * Tippecanoe settings:
 * - Zoom range 5-16 (matching map display range)
 * - Drop smallest features at lower zooms to keep tile sizes manageable
 * - Preserve all attributes
 * - Layer name: gravel_roads
 */
export function generateTiles(geojsonPath: string): string {
  const tilesDir = join(DATA_DIR, "tiles");
  mkdirSync(tilesDir, { recursive: true });

  const outputPath = join(tilesDir, "gravel_roads.mbtiles");

  console.log("  Generating vector tiles with Tippecanoe...");

  execSync(
    [
      "tippecanoe",
      `-o "${outputPath}"`,
      `--layer=gravel_roads`,
      `--minimum-zoom=5`,
      `--maximum-zoom=16`,
      `--drop-densest-as-needed`,
      `--extend-zooms-if-still-dropping`,
      `--force`,
      `"${geojsonPath}"`,
    ].join(" "),
    { stdio: "inherit" }
  );

  console.log(`  Generated tiles at ${outputPath}`);
  return outputPath;
}
