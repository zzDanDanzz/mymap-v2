import { Feature, Geometry, GeoJsonProperties } from "geojson";

export type GeomEdit = {
  id: number;
  type: "modify" | "delete";
  modifiedFeature: Feature<Geometry, GeoJsonProperties>;
};

export type CellInfo = {
  rowId: number;
  columnName: string;
  dataType: string;
};
