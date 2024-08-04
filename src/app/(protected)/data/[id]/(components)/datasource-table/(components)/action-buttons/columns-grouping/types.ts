import { DatasourceColumn } from "@shared/types/datasource.types";

export type GroupedColumn = {
  groupName: string;
  columns: DatasourceColumn[];
};
