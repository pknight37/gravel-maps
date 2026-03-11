import { z } from "zod";

/** Surface type classification */
export const SurfaceType = z.enum([
  "gravel",
  "dirt",
  "unpaved",
  "unknown",
]);
export type SurfaceType = z.infer<typeof SurfaceType>;

/** Road operational status */
export const OperationalStatus = z.enum([
  "open",
  "closed",
  "seasonal",
  "decommissioned",
  "unknown",
]);
export type OperationalStatus = z.infer<typeof OperationalStatus>;

/** Road classification */
export const RoadClass = z.enum([
  "arterial",
  "collector",
  "local",
  "primitive",
  "unknown",
]);
export type RoadClass = z.infer<typeof RoadClass>;

/** Data source identifier */
export const DataSource = z.enum(["usfs", "blm", "osm"]);
export type DataSource = z.infer<typeof DataSource>;

/**
 * Common schema for all gravel road records.
 * Every data source normalizes into this shape.
 */
export const GravelRoad = z.object({
  id: z.string(),
  source: DataSource,
  name: z.string(),
  surface: SurfaceType,
  roadClass: RoadClass,
  operationalStatus: OperationalStatus,
  jurisdiction: z.string(),
});
export type GravelRoad = z.infer<typeof GravelRoad>;

/**
 * GeoJSON Feature with GravelRoad properties.
 * The geometry is always a LineString or MultiLineString.
 */
export interface GravelRoadFeature {
  type: "Feature";
  properties: GravelRoad;
  geometry: {
    type: "LineString" | "MultiLineString";
    coordinates: number[][] | number[][][];
  };
}

export interface GravelRoadFeatureCollection {
  type: "FeatureCollection";
  features: GravelRoadFeature[];
}
