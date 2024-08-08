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

export const DEFAULT_ROWS_PER_PAGE = 10000;

export const TEXT_DATA_TYPES = ["string", "text"];

export const NUMERICAL_DATA_TYPES = ["int", "double", "real"];

export const DATE_DATA_TYPES = ["timestamp", "time"];

export const OTHER_DATA_TYPES = ["uuid", "json", "bool", "attachment"];

export const DATA_TYPE_CATEGORIES_TRANSLATIONS: Record<string, string> = {
  geography: "جغرافیایی",
  text: "متنی",
  numerical: "عددی",
  date: "تاریخ",
  etc: "غیره",
};

export const ALL_DATA_TYPES = [
  ...GEOMETRY_DATA_TYPES,
  ...TEXT_DATA_TYPES,
  ...NUMERICAL_DATA_TYPES,
  ...OTHER_DATA_TYPES,
];

export const DATA_TYPES_BY_CATEGORY = {
  geography: GEOMETRY_DATA_TYPES,
  text: TEXT_DATA_TYPES,
  numerical: NUMERICAL_DATA_TYPES,
  date: DATE_DATA_TYPES,
  etc: OTHER_DATA_TYPES,
};

export const COLUMNS_TO_HIDE = ["deleted_at"];
