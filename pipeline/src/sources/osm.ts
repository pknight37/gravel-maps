import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  GravelRoadFeature,
  GravelRoadFeatureCollection,
} from "../schema";
import type { SurfaceType, RoadClass } from "../schema";

/** Geofabrik Colorado extract URL */
const COLORADO_PBF_URL =
  "https://download.geofabrik.de/north-america/us/colorado-latest.osm.pbf";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../data");

function normalizeSurface(tags: Record<string, string>): SurfaceType {
  const surface = tags.surface?.toLowerCase() ?? "";

  if (surface.includes("gravel") || surface.includes("fine_gravel"))
    return "gravel";
  if (surface.includes("dirt") || surface.includes("earth")) return "dirt";
  if (
    surface.includes("unpaved") ||
    surface.includes("compacted") ||
    surface.includes("ground")
  )
    return "unpaved";

  // If no explicit surface tag, infer from highway type
  if (tags.highway === "track") return "dirt";

  return "unknown";
}

function normalizeRoadClass(tags: Record<string, string>): RoadClass {
  const hw = tags.highway ?? "";
  const trackType = tags.tracktype ?? "";

  if (hw === "tertiary" || hw === "secondary") return "collector";
  if (hw === "residential" || hw === "unclassified") return "local";
  if (hw === "track") {
    if (trackType === "grade1" || trackType === "grade2") return "local";
    return "primitive";
  }
  if (hw === "path") return "primitive";

  return "unknown";
}

/**
 * Downloads the Colorado OSM PBF extract from Geofabrik.
 * Skips download if file already exists.
 */
function downloadExtract(): string {
  const rawDir = join(DATA_DIR, "raw");
  mkdirSync(rawDir, { recursive: true });

  const pbfPath = join(rawDir, "colorado-latest.osm.pbf");

  if (existsSync(pbfPath)) {
    console.log("  Colorado PBF already downloaded, skipping.");
    return pbfPath;
  }

  console.log("  Downloading Colorado OSM extract...");
  execSync(`curl -L -o "${pbfPath}" "${COLORADO_PBF_URL}"`, {
    stdio: "inherit",
  });

  return pbfPath;
}

/**
 * Filters the PBF to only unpaved/gravel roads using osmium.
 * Returns path to filtered PBF.
 */
function filterWithOsmium(pbfPath: string): string {
  const filteredPath = join(DATA_DIR, "processed", "colorado-gravel.osm.pbf");
  mkdirSync(join(DATA_DIR, "processed"), { recursive: true });

  console.log("  Filtering OSM data with osmium...");
  execSync(
    `osmium tags-filter "${pbfPath}" ` +
      `w/highway=track w/surface=gravel,unpaved,dirt,earth,ground,compacted,fine_gravel ` +
      `-o "${filteredPath}" --overwrite`,
    { stdio: "inherit" }
  );

  return filteredPath;
}

/**
 * Converts filtered PBF to GeoJSON using ogr2ogr.
 */
function convertToGeoJSON(filteredPbfPath: string): string {
  const geojsonPath = join(DATA_DIR, "processed", "colorado-osm-gravel.geojson");

  console.log("  Converting to GeoJSON with ogr2ogr...");
  execSync(
    `ogr2ogr -f GeoJSON "${geojsonPath}" "${filteredPbfPath}" lines -overwrite`,
    { stdio: "inherit" }
  );

  return geojsonPath;
}

/**
 * Extracts and normalizes OSM gravel roads from the Colorado Geofabrik extract.
 * Requires osmium-tool and gdal (ogr2ogr) to be installed.
 */
export async function fetchOSMRoads(): Promise<GravelRoadFeatureCollection> {
  console.log("Processing OSM data for Colorado...");

  const pbfPath = downloadExtract();
  const filteredPath = filterWithOsmium(pbfPath);
  const geojsonPath = convertToGeoJSON(filteredPath);

  const raw = JSON.parse(readFileSync(geojsonPath, "utf-8"));
  const features: GravelRoadFeature[] = [];

  for (const feature of raw.features) {
    if (
      feature.geometry.type !== "LineString" &&
      feature.geometry.type !== "MultiLineString"
    ) {
      continue;
    }

    const tags = feature.properties ?? {};
    const surface = normalizeSurface(tags);
    // Skip paved roads that slipped through
    if (
      tags.surface &&
      ["asphalt", "paved", "concrete"].includes(tags.surface.toLowerCase())
    ) {
      continue;
    }

    features.push({
      type: "Feature",
      properties: {
        id: `osm-${tags.osm_id || tags["@id"] || Math.random().toString(36).slice(2)}`,
        source: "osm",
        name: tags.name || "Unnamed Track",
        surface,
        roadClass: normalizeRoadClass(tags),
        operationalStatus: tags.access === "no" ? "closed" : "open",
        jurisdiction: "OSM",
      },
      geometry: feature.geometry,
    });
  }

  console.log(`  Processed ${features.length} OSM road features.`);

  return {
    type: "FeatureCollection",
    features,
  };
}
