interface Datasource {
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