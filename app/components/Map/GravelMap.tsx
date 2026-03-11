import React, { useRef, useState, useCallback } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import MapLibreGL, {
  type MapViewRef,
  type CameraRef,
} from "@maplibre/maplibre-react-native";
import {
  COLORADO_CENTER,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  BASE_MAP_STYLE,
} from "../../constants/map";
import { GravelRoadsLayer } from "./layers/GravelRoadsLayer";

MapLibreGL.setAccessToken(null);

interface RoadInfo {
  name: string;
  surface: string;
  source: string;
  status: string;
}

interface GravelMapProps {
  onLocateMe?: () => void;
}

export function GravelMap({ onLocateMe }: GravelMapProps) {
  const mapRef = useRef<MapViewRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const [selectedRoad, setSelectedRoad] = useState<RoadInfo | null>(null);

  const handlePress = useCallback(async (feature: GeoJSON.Feature) => {
    if (!mapRef.current) return;

    const point = feature.geometry;
    if (point.type !== "Point") return;

    try {
      const results = await mapRef.current.queryRenderedFeaturesAtPoint(
        [point.coordinates[0], point.coordinates[1]],
        undefined,
        ["gravel-roads-line"]
      );

      if (results?.features?.length > 0) {
        const props = results.features[0].properties;
        setSelectedRoad({
          name: (props?.name as string) || "Unnamed Road",
          surface: (props?.surface as string) || "Unknown",
          source: (props?.source as string) || "Unknown",
          status: (props?.operational_status as string) || "Unknown",
        });
      } else {
        setSelectedRoad(null);
      }
    } catch {
      setSelectedRoad(null);
    }
  }, []);

  const handleLocateMe = useCallback(() => {
    onLocateMe?.();
  }, [onLocateMe]);

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        ref={mapRef}
        style={styles.map}
        mapStyle={BASE_MAP_STYLE}
        onPress={handlePress}
        logoEnabled={false}
        attributionPosition={{ bottom: 8, left: 8 }}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: COLORADO_CENTER,
            zoomLevel: DEFAULT_ZOOM,
          }}
          minZoomLevel={MIN_ZOOM}
          maxZoomLevel={MAX_ZOOM}
        />

        <MapLibreGL.UserLocation visible />

        <GravelRoadsLayer />
      </MapLibreGL.MapView>

      <TouchableOpacity
        style={styles.locateButton}
        onPress={handleLocateMe}
        accessibilityLabel="Show my location"
        accessibilityRole="button"
      >
        <Text style={styles.locateButtonText}>📍</Text>
      </TouchableOpacity>

      {selectedRoad && (
        <View style={styles.infoCard} accessibilityRole="summary">
          <Text style={styles.infoTitle}>{selectedRoad.name}</Text>
          <Text style={styles.infoDetail}>Surface: {selectedRoad.surface}</Text>
          <Text style={styles.infoDetail}>Source: {selectedRoad.source}</Text>
          <Text style={styles.infoDetail}>Status: {selectedRoad.status}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedRoad(null)}
            accessibilityLabel="Close info card"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  locateButton: {
    position: "absolute",
    bottom: 32,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  locateButtonText: {
    fontSize: 20,
  },
  infoCard: {
    position: "absolute",
    bottom: 96,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  infoDetail: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 4,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#888888",
  },
});
