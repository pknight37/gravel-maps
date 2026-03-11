import { Platform } from "react-native";
import { BASE_MAP_STYLE } from "../constants/map";

/** Gravel roads vector tile source configuration */
export const GRAVEL_TILE_SOURCE = {
  id: "gravel-roads",
  url: "", // Will be set to bundled asset path or remote URL
  minZoomLevel: 5,
  maxZoomLevel: 16,
} as const;

/** Returns the base map style URL */
export function getBaseMapStyleURL(): string {
  return BASE_MAP_STYLE;
}

/**
 * Returns the path to bundled gravel road tiles.
 * In MVP, tiles are bundled as an app asset.
 */
export function getBundledTilesPath(): string {
  // TODO: Point to bundled .mbtiles or PMTiles asset
  // For now, returns empty string (no tiles bundled yet)
  if (Platform.OS === "ios") {
    return "";
  }
  return "";
}
