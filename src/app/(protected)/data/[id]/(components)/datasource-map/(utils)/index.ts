import {
  DatasourceRow,
  DatasourceGeomCellType,
} from "@shared/types/datasource.types";
import { feature, featureCollection } from "@turf/helpers";
import { GeometryCollection } from "geojson";
import { MapLayerFeatureProperties } from "./types";

export const featureCollectionFromCellData = ({
  datasourceRows,
  enabledGeomColmnNamesToView,
}: {
  datasourceRows: DatasourceRow[];
  enabledGeomColmnNamesToView: string[];
}) => {
  const features = datasourceRows
    .map((row) => {
      const __features: GeoJSON.Feature[] = [];

      for (const geomColName of enabledGeomColmnNamesToView) {
        const properties: MapLayerFeatureProperties = {
          id: row.id,
          columnName: geomColName,
        };

        const geomCellData = row[geomColName] as
          | DatasourceGeomCellType
          | undefined;

        if (!geomCellData) continue;

        if (geomCellData.type === "GeometryCollection") {
          const geometries = (geomCellData as GeometryCollection).geometries;

          for (const g of geometries) {
            __features.push(feature(g, properties));
          }
          continue;
        }

        __features.push(
          feature(
            geomCellData as Exclude<DatasourceGeomCellType, GeometryCollection>,
            properties
          )
        );
      }

      return __features;
    })
    .flat();
  return featureCollection(features.flat());
};
