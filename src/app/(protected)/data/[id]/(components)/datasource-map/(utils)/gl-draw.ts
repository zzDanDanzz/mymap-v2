import {
  combine as createdCombinedFeatureCollection,
  geometryCollection as createGeometryCollection,
} from "@turf/turf";
import { FeatureCollection } from "geojson";

type MultiGeometry =
  | GeoJSON.MultiPoint
  | GeoJSON.MultiLineString
  | GeoJSON.MultiPolygon;

type NonCollectionGeometry = Exclude<
  GeoJSON.Geometry,
  GeoJSON.GeometryCollection
>;

export const generateGeomCellDataFromFC = ({
  columnDataType,
  featureCollection,
}: {
  columnDataType: string;
  featureCollection: FeatureCollection;
}): GeoJSON.Geometry | GeoJSON.GeometryCollection => {
  console.log({
    columnDataType,
    featureCollection,
  });

  /**
   * assume column data type is multi(point|line|polygon)
   * and mapbox-gl-draw has returned a feature collection of features of type=point|line|polygon respectively
   * so turf must combine all into a single multi(point|line|polygon) feature respectively
   * which is why we only need the first feature in the feature collection
   */
  if (columnDataType.includes("multi")) {
    const combined = createdCombinedFeatureCollection(
      featureCollection as FeatureCollection<MultiGeometry>
    );
    return combined.features[0].geometry;
  }

  /**
   * assume column data type is geometrycollection
   * else it's any of the singlar geom types = point|line|polygon|geometry
   * and for the singular geom types, we don't allow more than one feature in the feature collection
   */
  if (columnDataType.includes("collection")) {
    const geometries = featureCollection.features.map(
      (feature) => feature.geometry
    ) as NonCollectionGeometry[];

    const geometryCollectionFeature = createGeometryCollection(geometries);
    return geometryCollectionFeature.geometry;
  } else {
    return featureCollection.features[0].geometry;
  }
};

/**
 * blatantly stolen:
 * https://github.com/mapbox/mapbox-gl-draw/blob/main/src/options.js
 * and
 * https://github.com/mapbox/mapbox-gl-draw/blob/main/src/lib/theme.js
 */
function getGlDrawStyles({
  fillColor,
  outlineColor,
}: {
  fillColor: string;
  outlineColor: string;
}) {
  return [
    // ACTIVE (being drawn)
    // line stroke
    {
      id: "gl-draw-line",
      type: "line",
      filter: ["all", ["==", "$type", "LineString"]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": fillColor,
        "line-dasharray": [0.2, 2],
        "line-width": 4,
      },
    },
    // polygon fill
    {
      id: "gl-draw-polygon-fill",
      type: "fill",
      filter: ["all", ["==", "$type", "Polygon"]],
      paint: {
        "fill-color": fillColor,
        "fill-outline-color": fillColor,
        "fill-opacity": 0.1,
      },
    },
    // polygon outline stroke
    // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
    {
      id: "gl-draw-polygon-stroke-active",
      type: "line",
      filter: ["all", ["==", "$type", "Polygon"]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": fillColor,
        "line-dasharray": [0.2, 2],
        "line-width": 4,
      },
    },
    // vertex point halos
    {
      id: "gl-draw-polygon-and-line-vertex-halo-active",
      type: "circle",
      filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
      paint: {
        "circle-radius": 7,
        "circle-color": outlineColor,
      },
    },
    // vertex points
    {
      id: "gl-draw-polygon-and-line-vertex-active",
      type: "circle",
      filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
      paint: {
        "circle-radius": 5,
        "circle-color": fillColor,
      },
    },
    // polygon mid points
    {
      id: "gl-draw-polygon-midpoint",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
      paint: {
        "circle-radius": 5,
        "circle-color": outlineColor,
        "circle-stroke-width": 2,
        "circle-stroke-color": fillColor,
      },
    },

    {
      id: "active-points-are-blue",
      type: "circle",
      filter: [
        "all",
        ["==", "$type", "Point"],
        ["==", "meta", "feature"],
        ["==", "active", "true"],
      ],
      paint: {
        "circle-radius": 7,
        "circle-color": fillColor,
        "circle-stroke-color": outlineColor,
        "circle-stroke-width": 2,
      },
    },

    {
      id: "unactive-points-are-orange",
      type: "circle",
      filter: [
        "all",
        ["==", "$type", "Point"],
        ["==", "meta", "feature"],
        ["==", "active", "false"],
      ],
      paint: {
        "circle-radius": 5,
        "circle-color": fillColor,
        "circle-stroke-color": outlineColor,
        "circle-stroke-width": 2,
      },
    },
  ];
}

export default getGlDrawStyles;
