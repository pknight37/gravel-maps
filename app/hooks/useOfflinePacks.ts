import { useEffect, useState } from "react";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { COLORADO_BOUNDS, MIN_ZOOM, MAX_ZOOM } from "../constants/map";

interface OfflinePackStatus {
  isDownloading: boolean;
  progress: number;
  error: string | null;
}

/**
 * Manages offline tile packs for the base map.
 * Gravel road tiles are pre-bundled as an app asset;
 * this hook handles caching the base map tiles.
 */
export function useOfflinePacks() {
  const [status, setStatus] = useState<OfflinePackStatus>({
    isDownloading: false,
    progress: 0,
    error: null,
  });

  useEffect(() => {
    // Base map caching can be configured here.
    // For MVP, we rely on MapLibre's built-in tile caching
    // as the user pans and zooms.
  }, []);

  return status;
}
