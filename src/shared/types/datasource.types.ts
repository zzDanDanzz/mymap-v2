export interface Datasource {
  user_id?: string;
  tablename?: string;
  database_id?: number;
  created_at?: string;
  updated_at?: string;
  id?: string;
  number_of_rows?: number;
  number_of_columns?: number;
  size?: number;
  name?: string;
  description?: string;
  deleted_at?: string;
  primary_geom?: PrimaryGeom;
  bbox?: null;
  settings?: Settings;
  folder_id?: string;
  type?: string;
  is_favourite?: boolean;
  location?: Location;
  tags?: any[];
}

interface Settings {
  columns_ordering?: string[];
}

interface PrimaryGeom {
  name?: string;
  data_type?: string;
}

export interface DatasourceColumn {
  name: string;
  data_type: ColumnDataType;
  is_nullable: boolean;
  description: null;
  settings: EditorColumnSetting | null;
  group_name?: string;
}

interface EditorColumnSetting {
  hide?: boolean;
  pinned?: "right" | "left" | false;
  columnGroupShow?: string;
  ordinal_position?: number;
}

export interface DatasourceRow {
  [key: string]: any;
}

export type GeomColDataType =
  | "point"
  | "linestring"
  | "polygon"
  | "multipoint"
  | "multilinestring"
  | "multipolygon"
  | "geometrycollection"
  | "geometry";

type TextColDataType = "string" | "text";
type NumberColTypeID = "int" | "double" | "real";

type NonGeomColDataType =
  | TextColDataType
  | NumberColTypeID
  | "timestamp"
  | "time"
  | "uuid"
  | "json"
  | "bool"
  | "attachment";

export type ColumnDataType = GeomColDataType | NonGeomColDataType;
