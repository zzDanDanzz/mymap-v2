import { Feature, Geometry, GeoJsonProperties } from "geojson";

export type GeomEdit = {
  id: string;
  type: "modify" | "delete";
  modifiedFeature: Feature<Geometry, GeoJsonProperties>;
};

export type EditableGeomCellInfo = {
  rowId: number;
  columnName: string;
};

export type MapLayerFeatureProperties = {
  id: number;
  columnName: string;
};
