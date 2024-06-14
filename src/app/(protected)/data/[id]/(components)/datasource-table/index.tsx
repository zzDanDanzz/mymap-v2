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
import { useAtom } from "jotai";
import { selectedTableRowIdAtom } from "@/data/[id]/(utils)/atoms";
import CellEditor from "./cell-editor";

function rowKeyGetter(row: DatasourceRow) {
  return row.id;
}

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
        (col) =>
          ({
            key: col.name,
            name: col.name,
            renderEditCell: (props) => (
              <CellEditor
                {...props}
                dataType={col.data_type}
                onRowChange={(e) => {
                  console.log("onRowChange", e);
                }}
              />
            ),
            ...(GEOMETRY_DATA_TYPES.includes(col.data_type) && {
              renderCell(props) {
                const geom = props.row[col.name];
                return String(geom?.type ?? geom ?? "-");
              },
            }),
          } as ReactDataGridColumn<DatasourceRow>)
      ) ?? [];

  const [selectedRowId, setSelectedRowId] = useAtom(selectedTableRowIdAtom);

  if (datasourceColumnsIsLoading || datasourceRowsIsLoading) {
    return <CenteredLoader />;
  }

  return (
    <DataGrid
      columns={transformedColumns}
      direction={"rtl"}
      rows={datasourceRows ?? []}
      rowKeyGetter={rowKeyGetter}
      className={`rdg-light ${styles["data-grid"]}`}
      rowClass={(row) =>
        row.id === selectedRowId ? styles["selected-row"] : ""
      }
      onCellClick={(args, event) => {
        event.preventGridDefault();
        setSelectedRowId(args.row.id);
      }}
    />
  );
}

export default DatasourceTable;
