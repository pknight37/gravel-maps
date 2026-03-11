import { filterColorado } from "../transform/filter";
import type { GravelRoadFeatureCollection } from "../schema";

function makeFeature(
  coords: number[][],
  overrides: Partial<Record<string, string>> = {}
): GravelRoadFeatureCollection["features"][0] {
  return {
    type: "Feature",
    properties: {
      id: "test-1",
      source: "usfs",
      name: "Test Road",
      surface: "gravel",
      roadClass: "local",
      operationalStatus: "open",
      jurisdiction: "USFS",
      ...overrides,
    },
    geometry: {
      type: "LineString",
      coordinates: coords,
    },
  };
}

describe("filterColorado", () => {
  it("keeps features inside Colorado", () => {
    const collection: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [makeFeature([[-105.5, 39.5], [-105.6, 39.6]])],
    };

    const result = filterColorado(collection);
    expect(result.features).toHaveLength(1);
  });

  it("removes features outside Colorado", () => {
    const collection: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [makeFeature([[-90.0, 35.0], [-90.1, 35.1]])],
    };

    const result = filterColorado(collection);
    expect(result.features).toHaveLength(0);
  });

  it("keeps features that partially overlap Colorado", () => {
    const collection: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [
        makeFeature([[-109.5, 39.5], [-108.0, 39.5]]), // starts outside, ends inside
      ],
    };

    const result = filterColorado(collection);
    expect(result.features).toHaveLength(1);
  });

  it("handles MultiLineString features", () => {
    const feature = makeFeature([]);
    feature.geometry = {
      type: "MultiLineString",
      coordinates: [
        [[-105.5, 39.5], [-105.6, 39.6]],
        [[-105.7, 39.7], [-105.8, 39.8]],
      ],
    };

    const collection: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [feature],
    };

    const result = filterColorado(collection);
    expect(result.features).toHaveLength(1);
  });

  it("returns empty collection when given empty input", () => {
    const collection: GravelRoadFeatureCollection = {
      type: "FeatureCollection",
      features: [],
    };

    const result = filterColorado(collection);
    expect(result.features).toHaveLength(0);
  });
});
