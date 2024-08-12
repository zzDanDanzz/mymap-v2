import { Feature, Geometry, GeoJsonProperties } from "geojson";

export type GeomEdit = {
  id: string;
  type: "modify" | "delete";
  modifiedFeature: Feature<Geometry, GeoJsonProperties>;
};
