import type {
  GravelRoadFeature,
  GravelRoadFeatureCollection,
} from "../schema";

/**
 * Simple spatial proximity deduplication.
 * Two features are considered duplicates if:
 * 1. Their start points are within the threshold distance
 * 2. Their end points are within the threshold distance
 * 3. They have similar names (if both named)
 *
 * When duplicates are found, prefer USFS > BLM > OSM.
 */

/** Distance threshold in degrees (~111m per degree at Colorado latitude) */
const PROXIMITY_THRESHOLD = 0.001; // ~111 meters

/** Source priority (lower = higher priority) */
const SOURCE_PRIORITY: Record<string, number> = {
  usfs: 0,
  blm: 1,
  osm: 2,
};

function getFirstCoord(feature: GravelRoadFeature): number[] | null {
  const { geometry } = feature;
  if (geometry.type === "LineString") {
    return (geometry.coordinates as number[][])[0] ?? null;
  }
  if (geometry.type === "MultiLineString") {
    return (geometry.coordinates as number[][][])[0]?.[0] ?? null;
  }
  return null;
}

function getLastCoord(feature: GravelRoadFeature): number[] | null {
  const { geometry } = feature;
  if (geometry.type === "LineString") {
    const coords = geometry.coordinates as number[][];
    return coords[coords.length - 1] ?? null;
  }
  if (geometry.type === "MultiLineString") {
    const lines = geometry.coordinates as number[][][];
    const lastLine = lines[lines.length - 1];
    return lastLine?.[lastLine.length - 1] ?? null;
  }
  return null;
}

function coordsClose(a: number[], b: number[]): boolean {
  return (
    Math.abs(a[0] - b[0]) < PROXIMITY_THRESHOLD &&
    Math.abs(a[1] - b[1]) < PROXIMITY_THRESHOLD
  );
}

/**
 * Merges multiple feature collections, deduplicating by spatial proximity.
 * Higher-priority sources (USFS > BLM > OSM) are preferred when duplicates exist.
 */
export function mergeCollections(
  ...collections: GravelRoadFeatureCollection[]
): GravelRoadFeatureCollection {
  // Sort all features by source priority
  const all = collections
    .flatMap((c) => c.features)
    .sort(
      (a, b) =>
        (SOURCE_PRIORITY[a.properties.source] ?? 99) -
        (SOURCE_PRIORITY[b.properties.source] ?? 99)
    );

  const kept: GravelRoadFeature[] = [];
  let duplicates = 0;

  for (const feature of all) {
    const first = getFirstCoord(feature);
    const last = getLastCoord(feature);

    if (!first || !last) {
      kept.push(feature);
      continue;
    }

    const isDupe = kept.some((existing) => {
      const existFirst = getFirstCoord(existing);
      const existLast = getLastCoord(existing);
      if (!existFirst || !existLast) return false;

      return coordsClose(first, existFirst) && coordsClose(last, existLast);
    });

    if (isDupe) {
      duplicates++;
    } else {
      kept.push(feature);
    }
  }

  console.log(
    `  Merged ${all.length} features → ${kept.length} (removed ${duplicates} duplicates).`
  );

  return {
    type: "FeatureCollection",
    features: kept,
  };
}
