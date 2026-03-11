import { fetchUSFSRoads } from "./sources/usfs";
import { fetchBLMRoads } from "./sources/blm";
import { fetchOSMRoads } from "./sources/osm";
import { normalizeCollection } from "./transform/normalize";
import { filterColorado } from "./transform/filter";
import { mergeCollections } from "./transform/merge";
import { writeGeoJSON, generateTiles } from "./output/tiles";

type SourceName = "usfs" | "blm" | "osm" | "all";

function parseArgs(): { source: SourceName } {
  const sourceArg = process.argv.find((arg) => arg.startsWith("--source"));
  if (sourceArg) {
    const value = process.argv[process.argv.indexOf(sourceArg) + 1];
    if (["usfs", "blm", "osm", "all"].includes(value)) {
      return { source: value as SourceName };
    }
  }
  return { source: "all" };
}

async function main() {
  const { source } = parseArgs();
  console.log(`\n=== Gravel Maps Data Pipeline ===`);
  console.log(`Source: ${source}\n`);

  const collections = [];

  // Fetch data from selected sources
  if (source === "usfs" || source === "all") {
    console.log("--- USFS ---");
    const usfs = await fetchUSFSRoads();
    const normalized = normalizeCollection(usfs);
    const filtered = filterColorado(normalized);
    collections.push(filtered);
    writeGeoJSON(filtered, "usfs-roads.geojson");
  }

  if (source === "blm" || source === "all") {
    console.log("\n--- BLM ---");
    const blm = await fetchBLMRoads();
    const normalized = normalizeCollection(blm);
    const filtered = filterColorado(normalized);
    collections.push(filtered);
    writeGeoJSON(filtered, "blm-roads.geojson");
  }

  if (source === "osm" || source === "all") {
    console.log("\n--- OSM ---");
    const osm = await fetchOSMRoads();
    const normalized = normalizeCollection(osm);
    const filtered = filterColorado(normalized);
    collections.push(filtered);
    writeGeoJSON(filtered, "osm-roads.geojson");
  }

  // Merge all sources
  console.log("\n--- Merge ---");
  const merged = mergeCollections(...collections);
  const mergedPath = writeGeoJSON(merged, "gravel-roads-merged.geojson");

  // Generate vector tiles
  console.log("\n--- Tiles ---");
  const tilesPath = generateTiles(mergedPath);

  console.log(`\n=== Pipeline Complete ===`);
  console.log(`Output: ${tilesPath}`);
  console.log(`Total features: ${merged.features.length}\n`);
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
