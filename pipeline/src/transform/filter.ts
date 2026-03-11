import type {
  GravelRoadFeature,
  GravelRoadFeatureCollection,
} from "../schema";

/** Colorado bounding box [west, south, east, north] */
const COLORADO_BOUNDS = [-109.06, 36.99, -102.04, 41.0] as const;

/**
 * Checks if a coordinate [lon, lat] falls within the Colorado bounding box.
 */
function isInColorado(lon: number, lat: number): boolean {
  return (
    lon >= COLORADO_BOUNDS[0] &&
    lon <= COLORADO_BOUNDS[2] &&
    lat >= COLORADO_BOUNDS[1] &&
    lat <= COLORADO_BOUNDS[3]
  );
}

/**
 * Checks if any coordinate in a feature's geometry is within Colorado.
 */
function featureIntersectsColorado(feature: GravelRoadFeature): boolean {
  const { geometry } = feature;

  if (geometry.type === "LineString") {
    return (geometry.coordinates as number[][]).some(([lon, lat]) =>
      isInColorado(lon, lat)
    );
  }

  if (geometry.type === "MultiLineString") {
    return (geometry.coordinates as number[][][]).some((line) =>
      line.some(([lon, lat]) => isInColorado(lon, lat))
    );
  }

  return false;
}

/**
 * Filters a feature collection to only include features that:
 * 1. Intersect the Colorado bounding box
 * 2. Have a non-paved surface type (not filtered here since sources already filter)
 */
export function filterColorado(
  collection: GravelRoadFeatureCollection
): GravelRoadFeatureCollection {
  const filtered = collection.features.filter(featureIntersectsColorado);

  console.log(
    `  Filtered to ${filtered.length} features within Colorado (from ${collection.features.length}).`
  );

  return {
    type: "FeatureCollection",
    features: filtered,
  };
}
