import type {
  GravelRoadFeature,
  GravelRoadFeatureCollection,
} from "../schema";
import type { SurfaceType, OperationalStatus, RoadClass } from "../schema";

/**
 * Colorado National Forests with ArcGIS REST API endpoints.
 * USFS National Forest System Roads (NFSR) data.
 */
const COLORADO_FORESTS = [
  { name: "Arapaho-Roosevelt", id: "ARP" },
  { name: "Grand Mesa-Uncompahgre-Gunnison", id: "GMUG" },
  { name: "Pike-San Isabel", id: "PSI" },
  { name: "Rio Grande", id: "RGR" },
  { name: "Routt", id: "ROU" },
  { name: "San Juan", id: "SJN" },
  { name: "White River", id: "WRI" },
  { name: "Medicine Bow-Routt", id: "MBR" },
  { name: "Comanche", id: "COM" },
  { name: "Pawnee", id: "PAW" },
] as const;

/** Base URL for USFS ArcGIS REST services */
const USFS_BASE_URL =
  "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_RoadBasic_01/MapServer/0/query";

/** Colorado bounding box for spatial filter */
const COLORADO_BBOX = {
  xmin: -109.06,
  ymin: 36.99,
  xmax: -102.04,
  ymax: 41.0,
  spatialReference: { wkid: 4326 },
};

/** Max records per ArcGIS query (API limit) */
const MAX_RECORDS = 2000;

/** Maps USFS surface codes to our common surface types */
function normalizeSurface(surfaceCode: string | null): SurfaceType {
  if (!surfaceCode) return "unknown";
  const code = surfaceCode.toUpperCase();

  if (code.includes("GRAVEL") || code.includes("AGG")) return "gravel";
  if (code.includes("DIRT") || code.includes("NAT")) return "dirt";
  if (
    code.includes("UNPAVED") ||
    code.includes("CRUSHED") ||
    code.includes("IMPROV")
  )
    return "unpaved";
  return "unknown";
}

/** Maps USFS operational maintenance level to status */
function normalizeStatus(
  level: number | string | null
): OperationalStatus {
  if (level === null || level === undefined) return "unknown";
  const num = typeof level === "string" ? parseInt(level, 10) : level;

  if (num >= 3) return "open";
  if (num === 2) return "open";
  if (num === 1) return "closed";
  if (num === 0) return "decommissioned";
  return "unknown";
}

/** Maps USFS road class to our classification */
function normalizeRoadClass(cls: string | null): RoadClass {
  if (!cls) return "unknown";
  const upper = cls.toUpperCase();

  if (upper.includes("ARTERIAL")) return "arterial";
  if (upper.includes("COLLECTOR")) return "collector";
  if (upper.includes("LOCAL")) return "local";
  if (upper.includes("PRIMITIVE")) return "primitive";
  return "unknown";
}

interface USFSFeatureAttributes {
  OBJECTID: number;
  NAME: string | null;
  OPER_MAINT_LEVEL: number | null;
  SURFACE_TYPE: string | null;
  FUNCTIONAL_CLASS: string | null;
  MANAGING_ORG: string | null;
  ID: string | null;
}

interface USFSQueryResponse {
  features: Array<{
    attributes: USFSFeatureAttributes;
    geometry: {
      paths: number[][][];
    };
  }>;
  exceededTransferLimit?: boolean;
}

/** Fetches all USFS road features in Colorado using pagination */
export async function fetchUSFSRoads(): Promise<GravelRoadFeatureCollection> {
  const allFeatures: GravelRoadFeature[] = [];
  let offset = 0;
  let hasMore = true;

  console.log("Fetching USFS roads for Colorado...");

  while (hasMore) {
    const params = new URLSearchParams({
      where: "1=1",
      geometryType: "esriGeometryEnvelope",
      geometry: JSON.stringify(COLORADO_BBOX),
      inSR: "4326",
      outSR: "4326",
      outFields: "OBJECTID,NAME,OPER_MAINT_LEVEL,SURFACE_TYPE,FUNCTIONAL_CLASS,MANAGING_ORG,ID",
      returnGeometry: "true",
      f: "json",
      resultOffset: offset.toString(),
      resultRecordCount: MAX_RECORDS.toString(),
    });

    const url = `${USFS_BASE_URL}?${params}`;
    console.log(`  Fetching offset ${offset}...`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `USFS API error: ${response.status} ${response.statusText}`
      );
    }

    const data: USFSQueryResponse = await response.json();

    for (const feature of data.features) {
      const attrs = feature.attributes;
      const paths = feature.geometry?.paths;

      if (!paths || paths.length === 0) continue;

      const gravelFeature: GravelRoadFeature = {
        type: "Feature",
        properties: {
          id: `usfs-${attrs.OBJECTID}`,
          source: "usfs",
          name: attrs.NAME || "Unnamed USFS Road",
          surface: normalizeSurface(attrs.SURFACE_TYPE),
          roadClass: normalizeRoadClass(attrs.FUNCTIONAL_CLASS),
          operationalStatus: normalizeStatus(attrs.OPER_MAINT_LEVEL),
          jurisdiction: attrs.MANAGING_ORG || "USFS",
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

  console.log(`  Fetched ${allFeatures.length} USFS road features.`);

  return {
    type: "FeatureCollection",
    features: allFeatures,
  };
}
