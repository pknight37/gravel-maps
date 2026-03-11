import React from "react";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { SURFACE_COLORS, ROAD_WIDTH_STOPS } from "../../../constants/map";

/**
 * Renders gravel road lines on the map, colored by surface type
 * and scaled by zoom level.
 */
export function GravelRoadsLayer() {
  return (
    <MapLibreGL.ShapeSource id="gravel-roads" url="">
      <MapLibreGL.LineLayer
        id="gravel-roads-line"
        style={{
          lineColor: [
            "match",
            ["get", "surface"],
            "gravel",
            SURFACE_COLORS.gravel,
            "dirt",
            SURFACE_COLORS.dirt,
            "unpaved",
            SURFACE_COLORS.unpaved,
            SURFACE_COLORS.unknown,
          ],
          lineWidth: [
            "interpolate",
            ["linear"],
            ["zoom"],
            ...ROAD_WIDTH_STOPS.flat(),
          ],
          lineOpacity: 0.85,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
    </MapLibreGL.ShapeSource>
  );
}
