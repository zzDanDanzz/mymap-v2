import {
  DatasourceRow,
  DatasourceGeomCellType,
} from "@shared/types/datasource.types";
import { feature, featureCollection } from "@turf/helpers";
import { GeometryCollection } from "geojson";

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
        const geomCellData = row[geomColName] as
          | DatasourceGeomCellType
          | undefined;

        if (!geomCellData) continue;

        if (geomCellData.type === "GeometryCollection") {
          const geometries = (geomCellData as GeometryCollection).geometries;

          for (const g of geometries) {
            __features.push(feature(g, { id: row.id }));
          }
          continue;
        }

        __features.push(
          feature(
            geomCellData as Exclude<DatasourceGeomCellType, GeometryCollection>,
            {
              id: row.id,
            }
          )
        );
      }

      return __features;
    })
    .flat();
  return featureCollection(features.flat());
};
