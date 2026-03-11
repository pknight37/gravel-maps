import { mergeCollections } from "../transform/merge";
import type { GravelRoadFeatureCollection } from "../schema";

function makeFeature(
  id: string,
  source: "usfs" | "blm" | "osm",
  startCoord: number[],
  endCoord: number[]
): GravelRoadFeatureCollection["features"][0] {
  return {
    type: "Feature",
    properties: {
      id,
      source,
      name: `Road ${id}`,
      surface: "gravel",
      roadClass: "local",
      operationalStatus: "open",
      jurisdiction: source.toUpperCase(),
    },
    geometry: {
      type: "LineString",
      coordinates: [startCoord, endCoord],
    },
  };
}

describe("mergeCollections", () => {
  it("merges features from multiple collections", () => {
    const usfs: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [makeFeature("usfs-1", "usfs", [-105.5, 39.5], [-105.6, 39.6])],
    };
    const blm: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [makeFeature("blm-1", "blm", [-106.0, 40.0], [-106.1, 40.1])],
    };

    const result = mergeCollections(usfs, blm);
    expect(result.features).toHaveLength(2);
  });

  it("deduplicates spatially overlapping features", () => {
    const usfs: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [makeFeature("usfs-1", "usfs", [-105.5, 39.5], [-105.6, 39.6])],
    };
    const osm: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [
        makeFeature("osm-1", "osm", [-105.5001, 39.5001], [-105.6001, 39.6001]),
      ],
    };

    const result = mergeCollections(usfs, osm);
    expect(result.features).toHaveLength(1);
    expect(result.features[0].properties.source).toBe("usfs");
  });

  it("prefers USFS over BLM over OSM", () => {
    const osm: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [makeFeature("osm-1", "osm", [-105.5, 39.5], [-105.6, 39.6])],
    };
    const usfs: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [
        makeFeature("usfs-1", "usfs", [-105.5001, 39.5001], [-105.6001, 39.6001]),
      ],
    };

    const result = mergeCollections(osm, usfs);
    expect(result.features).toHaveLength(1);
    expect(result.features[0].properties.source).toBe("usfs");
  });

  it("handles empty collections", () => {
    const empty: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [],
    };

    const result = mergeCollections(empty, empty);
    expect(result.features).toHaveLength(0);
  });
});
