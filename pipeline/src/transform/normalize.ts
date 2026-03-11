import { GravelRoad } from "../schema";
import type { GravelRoadFeature, GravelRoadFeatureCollection } from "../schema";

/**
 * Validates all features in a collection against the common schema.
 * Returns only features that pass validation, logging warnings for invalid ones.
 */
export function normalizeCollection(
  collection: GravelRoadFeatureCollection
): GravelRoadFeatureCollection {
  const valid: GravelRoadFeature[] = [];
  let invalid = 0;

  for (const feature of collection.features) {
    const result = GravelRoad.safeParse(feature.properties);
    if (result.success) {
      valid.push({
        ...feature,
        properties: result.data,
      });
    } else {
      invalid++;
    }
  }

  if (invalid > 0) {
    console.warn(`  Dropped ${invalid} invalid features during normalization.`);
  }

  console.log(`  ${valid.length} features passed normalization.`);

  return {
    type: "FeatureCollection",
    features: valid,
  };
}
