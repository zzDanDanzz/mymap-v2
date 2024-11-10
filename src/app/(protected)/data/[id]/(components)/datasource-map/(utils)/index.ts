import {
  DatasourceRow,
  DatasourceGeomCellType,
} from "@shared/types/datasource.types";
import { feature, featureCollection } from "@turf/helpers";
import { GeometryCollection } from "geojson";
import { CellInfo } from "./types";

type FeatureCollectionFromCellDataParams = {
  datasourceRows: DatasourceRow[];
  cells: CellInfo[];
  cellToSkip: CellInfo | null;
};

export const featureCollectionFromCellData = ({
  datasourceRows,
  cells,
  cellToSkip,
}: FeatureCollectionFromCellDataParams) => {
  const features = datasourceRows
    .map((row) => {
      const __features: GeoJSON.Feature[] = [];

      for (const cell of cells) {
        const skip =
          cellToSkip?.rowId === row.id &&
          cellToSkip?.columnName === cell.columnName;
        if (skip) {
          continue;
        }

        const properties: CellInfo = {
          rowId: row.id,
          columnName: cell.columnName,
          dataType: cell.dataType,
        };

        const geomCellData = row[cell.columnName] as
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

export const featureCollectionFromGeomColumns = ({
  datasourceRows,
  geomColumnNames,
  cellToSkip: cellToIgnore,
}: {
  datasourceRows: DatasourceRow[];
  geomColumnNames: string[];
  cellToSkip: CellInfo | null;
}) => {
  const features = datasourceRows
    .map((row) => {
      const __features: GeoJSON.Feature[] = [];

      for (const geomColName of geomColumnNames) {
        const skip =
          cellToIgnore?.rowId === row.id &&
          cellToIgnore?.columnName === geomColName;
        if (skip) {
          continue;
        }
        const properties: Omit<CellInfo, "dataType"> = {
          rowId: row.id,
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
