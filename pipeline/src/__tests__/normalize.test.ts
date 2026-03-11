import { normalizeCollection } from "../transform/normalize";
import type { GravelRoadFeatureCollection } from "../schema";

function makeValidFeature(): GravelRoadFeatureCollection["features"][0] {
  return {
    type: "Feature",
    properties: {
      id: "usfs-123",
      source: "usfs",
      name: "Forest Road 100",
      surface: "gravel",
      roadClass: "local",
      operationalStatus: "open",
      jurisdiction: "USFS",
    },
    geometry: {
      type: "LineString",
      coordinates: [[-105.5, 39.5], [-105.6, 39.6]],
    },
  };
}

describe("normalizeCollection", () => {
  it("passes valid features through", () => {
    const collection: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [makeValidFeature()],
    };

    const result = normalizeCollection(collection);
    expect(result.features).toHaveLength(1);
    expect(result.features[0].properties.name).toBe("Forest Road 100");
  });

  it("drops features with invalid surface type", () => {
    const feature = makeValidFeature();
    (feature.properties as Record<string, unknown>).surface = "asphalt";

    const collection: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [feature],
    };

    const result = normalizeCollection(collection);
    expect(result.features).toHaveLength(0);
  });

  it("drops features with invalid source", () => {
    const feature = makeValidFeature();
    (feature.properties as Record<string, unknown>).source = "invalid_source";

    const collection: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [feature],
    };

    const result = normalizeCollection(collection);
    expect(result.features).toHaveLength(0);
  });

  it("drops features missing required fields", () => {
    const feature = makeValidFeature();
    (feature.properties as Record<string, unknown>).id = undefined;

    const collection: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [feature],
    };

    const result = normalizeCollection(collection);
    expect(result.features).toHaveLength(0);
  });

  it("handles empty collection", () => {
    const collection: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [],
    };

    const result = normalizeCollection(collection);
    expect(result.features).toHaveLength(0);
  });
});
