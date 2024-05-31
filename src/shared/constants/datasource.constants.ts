export const GEOMETRY_DATA_TYPES = [
  "point",
  "linestring",
  "polygon",
  "multipoint",
  "multilinestring",
  "multipolygon",
  "geometrycollection",
  "geometry",
];

export const TEXT_DATA_TYPES = ["string", "text"];

export const NUMBER_DATA_TYPES = ["int", "double", "real"];

export const OTHER_DATA_TYPES = [
  "timestamp",
  "time",
  "uuid",
  "json",
  "bool",
  "attachment",
];

export const ALL_DATA_TYPES = [
  ...GEOMETRY_DATA_TYPES,
  ...TEXT_DATA_TYPES,
  ...NUMBER_DATA_TYPES,
  ...OTHER_DATA_TYPES,
];
