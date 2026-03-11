/** Colorado bounding box [west, south, east, north] */
export const COLORADO_BOUNDS: [number, number, number, number] = [
  -109.06, 36.99, -102.04, 41.0,
];

/** Center of Colorado [longitude, latitude] */
export const COLORADO_CENTER: [number, number] = [-105.55, 39.0];

/** Default zoom level showing all of Colorado */
export const DEFAULT_ZOOM = 7;

/** Min/max zoom levels */
export const MIN_ZOOM = 5;
export const MAX_ZOOM = 16;

/** Surface type colors */
export const SURFACE_COLORS = {
  gravel: "#D4782F",
  dirt: "#8B6914",
  unpaved: "#C4883E",
  unknown: "#888888",
} as const;

/** Road width stops: [zoom, width] pairs for MapLibre interpolation */
export const ROAD_WIDTH_STOPS: [number, number][] = [
  [7, 1],
  [10, 2],
  [13, 3],
  [16, 5],
];

/** Base map style URL (OpenFreeMap) */
export const BASE_MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

export type SurfaceType = keyof typeof SURFACE_COLORS;
