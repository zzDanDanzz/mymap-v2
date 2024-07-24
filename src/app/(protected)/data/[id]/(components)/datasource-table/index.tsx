import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

import CenteredLoader from "@shared/component/centered-loader";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import {
  COLUMNS_TO_HIDE,
  GEOMETRY_DATA_TYPES,
} from "@shared/constants/datasource.constants";
import { Box } from "@mantine/core";
import { updateDatasourceRow } from "./(utils)/api";

function DatasourceTable({ id }: { id: string }) {
  const { datasourceColumns, datasourceColumnsIsLoading } =
    useDatasourceColumns({ id });

  const { datasourceRows, datasourceRowsIsLoading } = useDatasourceRows({
    id,
  });

  const transformedColumns =
    datasourceColumns
      ?.filter(({ name }) => !COLUMNS_TO_HIDE.includes(name))
      .map((col) => {
        const colDef: ColDef = {
          field: col.name,
          editable: true,
        };

        if (GEOMETRY_DATA_TYPES.includes(col.data_type)) {
          // wip
          colDef.cellRenderer;
        }

        return colDef;
      }) ?? [];

  if (datasourceColumnsIsLoading || datasourceRowsIsLoading) {
    return <CenteredLoader />;
  }

  return (
    <Box className="ag-theme-alpine" h={"100%"} p={"lg"}>
      <AgGridReact
        enableRtl={true}
        rowData={datasourceRows}
        columnDefs={transformedColumns}
        onCellEditingStopped={function (event: any) {
          const _columnField = event.colDef.field;
          const _cellData = event.data[_columnField];

          updateDatasourceRow({
            datasourceId: id,
            rowId: event.data.id,
            cellColumnName: _columnField,
            updatedCellData: _cellData,
          });
        }}
      />
    </Box>
  );
}

export default DatasourceTable;
