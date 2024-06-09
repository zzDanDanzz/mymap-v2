import CenteredLoader from "@shared/component/centered-loader";
import {
  COLUMNS_TO_HIDE,
  GEOMETRY_DATA_TYPES,
} from "@shared/constants/datasource.constants";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { DatasourceRow } from "@shared/types/datasource.types";
import type { Column as ReactDataGridColumn } from "react-data-grid";
import DataGrid from "react-data-grid";
import styles from "./datasource-table.module.css";

function DatasourceTable({ id }: { id: string }) {
  const { datasourceColumns, datasourceColumnsIsLoading } =
    useDatasourceColumns({ id });

  const { datasourceRows, datasourceRowsIsLoading } = useDatasourceRows({
    id,
  });

  const transformedColumns =
    datasourceColumns
      ?.filter(({ name }) => !COLUMNS_TO_HIDE.includes(name))
      .map(
        ({ name, data_type }) =>
          ({
            key: name,
            name: name,
            ...(GEOMETRY_DATA_TYPES.includes(data_type) && {
              renderCell(props) {
                const geom = props.row[name];
                return String(geom?.type ?? geom ?? "-");
              },
            }),
          } as ReactDataGridColumn<DatasourceRow>)
      ) ?? [];

  if (datasourceColumnsIsLoading || datasourceRowsIsLoading) {
    return <CenteredLoader />;
  }
  return (
    <DataGrid
      columns={transformedColumns}
      rows={datasourceRows ?? []}
      className={`rdg-light ${styles["data-grid"]}`}
      onCellClick={(e) => {
        console.log({ e });
      }}
    />
  );
}

export default DatasourceTable;
