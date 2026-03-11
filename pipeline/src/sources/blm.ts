import type {
  GravelRoadFeature,
  GravelRoadFeatureCollection,
} from "../schema";
import type { SurfaceType, OperationalStatus, RoadClass } from "../schema";

/**
 * BLM Colorado Ground Transportation Linear Features.
 * ArcGIS REST API endpoint for BLM roads data.
 */
const BLM_COLORADO_URL =
  "https://gis.blm.gov/arcgis/rest/services/transportation/BLM_Natl_Ground_Transportation_Linear_Features/MapServer/1/query";

/** Colorado bounding box */
const COLORADO_BBOX = {
  xmin: -109.06,
  ymin: 36.99,
  xmax: -102.04,
  ymax: 41.0,
  spatialReference: { wkid: 4326 },
};

const MAX_RECORDS = 2000;

function normalizeSurface(surfaceType: string | null): SurfaceType {
  if (!surfaceType) return "unknown";
  const s = surfaceType.toUpperCase();

  if (s.includes("GRAVEL")) return "gravel";
  if (s.includes("DIRT") || s.includes("NATIVE") || s.includes("NATURAL"))
    return "dirt";
  if (s.includes("UNPAVED") || s.includes("IMPROVED")) return "unpaved";
  return "unknown";
}

function normalizeStatus(status: string | null): OperationalStatus {
  if (!status) return "unknown";
  const s = status.toUpperCase();

  if (s.includes("OPEN")) return "open";
  if (s.includes("CLOSED")) return "closed";
  if (s.includes("SEASONAL") || s.includes("LIMITED")) return "seasonal";
  return "unknown";
}

function normalizeRoadClass(cls: string | null): RoadClass {
  if (!cls) return "unknown";
  const s = cls.toUpperCase();

  if (s.includes("ARTERIAL")) return "arterial";
  if (s.includes("COLLECTOR")) return "collector";
  if (s.includes("LOCAL")) return "local";
  if (s.includes("PRIMITIVE") || s.includes("TRAIL")) return "primitive";
  return "unknown";
}

interface BLMFeatureAttributes {
  OBJECTID: number;
  ROUTE_NAME: string | null;
  SURFACE_TYPE: string | null;
  ROUTE_STATUS: string | null;
  FUNCTIONAL_CLASS: string | null;
  ADMIN_UNIT_NAME: string | null;
  BLM_ROUTE_ID: string | null;
}

interface BLMQueryResponse {
  features: Array<{
    attributes: BLMFeatureAttributes;
    geometry: {
      paths: number[][][];
    };
  }>;
  exceededTransferLimit?: boolean;
}

/** Fetches all BLM road features in Colorado using pagination */
export async function fetchBLMRoads(): Promise<GravelRoadFeatureCollection> {
  const allFeatures: GravelRoadFeature[] = [];
  let offset = 0;
  let hasMore = true;

  console.log("Fetching BLM roads for Colorado...");

  while (hasMore) {
    const params = new URLSearchParams({
      where: "1=1",
      geometryType: "esriGeometryEnvelope",
      geometry: JSON.stringify(COLORADO_BBOX),
      inSR: "4326",
      outSR: "4326",
      outFields:
        "OBJECTID,ROUTE_NAME,SURFACE_TYPE,ROUTE_STATUS,FUNCTIONAL_CLASS,ADMIN_UNIT_NAME,BLM_ROUTE_ID",
      returnGeometry: "true",
      f: "json",
      resultOffset: offset.toString(),
      resultRecordCount: MAX_RECORDS.toString(),
    });

    const url = `${BLM_COLORADO_URL}?${params}`;
    console.log(`  Fetching offset ${offset}...`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `BLM API error: ${response.status} ${response.statusText}`
      );
    }

    const data: BLMQueryResponse = await response.json();

    for (const feature of data.features) {
      const attrs = feature.attributes;
      const paths = feature.geometry?.paths;

      if (!paths || paths.length === 0) continue;

      const gravelFeature: GravelRoadFeature = {
        type: "Feature",
        properties: {
          id: `blm-${attrs.OBJECTID}`,
          source: "blm",
          name: attrs.ROUTE_NAME || "Unnamed BLM Road",
          surface: normalizeSurface(attrs.SURFACE_TYPE),
          roadClass: normalizeRoadClass(attrs.FUNCTIONAL_CLASS),
          operationalStatus: normalizeStatus(attrs.ROUTE_STATUS),
          jurisdiction: attrs.ADMIN_UNIT_NAME || "BLM",
        },
        geometry:
          paths.length === 1
            ? { type: "LineString", coordinates: paths[0] }
            : { type: "MultiLineString", coordinates: paths },
      };

      allFeatures.push(gravelFeature);
    }

    hasMore = data.exceededTransferLimit === true;
    offset += MAX_RECORDS;
  }

  console.log(`  Fetched ${allFeatures.length} BLM road features.`);

  return {
    type: "FeatureCollection",
    features: allFeatures,
  };
}
