import {
  DatasourceRow,
  DatasourceGeomCellType,
} from "@shared/types/datasource.types";
import { feature, featureCollection } from "@turf/helpers";
import { GeometryCollection } from "geojson";
import { EditableGeomCellInfo, MapLayerFeatureProperties } from "./types";

export const featureCollectionFromCellData = ({
  datasourceRows,
  geometryColumnNames,
  cellToSkip: cellToIgnore,
}: {
  datasourceRows: DatasourceRow[];
  geometryColumnNames: string[];
  cellToSkip: EditableGeomCellInfo | null;
}) => {
  const features = datasourceRows
    .map((row) => {
      const __features: GeoJSON.Feature[] = [];

      for (const geomColName of geometryColumnNames) {
        const skip =
          cellToIgnore?.rowId === row.id &&
          cellToIgnore?.columnName === geomColName;
        if (skip) {
          continue;
        }
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
