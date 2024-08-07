import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

import { AG_GRID_LOCALE_IR } from "@ag-grid-community/locale";
import { Group, Stack } from "@mantine/core";
import CenteredLoader from "@shared/component/centered-loader";
import useDatasource from "@shared/hooks/swr/datasources/use-datasource";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import type {
  CellEditingStoppedEvent,
  ColumnMovedEvent,
  ColumnPinnedEvent,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import ActionButtons from "./(components)/action-buttons";
import { syncColumnsOrder, updateDatasourceRow } from "./(utils)/api";
import useColDefs from "./(hooks)/use-col-defs";

function DatasourceTable() {
  const { id } = useParams<{ id: string }>();

  const { datasourceColumns, datasourceColumnsIsLoading } =
    useDatasourceColumns({ id });

  const { datasourceRows, datasourceRowsIsLoading } = useDatasourceRows({
    id,
  });

  const { datasource, datasourceMutate } = useDatasource({ id });

  const colDefs = useColDefs({
    datasourceColumns,
    currentDatasource: datasource,
  });

  const onCellEditingStopped = useCallback(
    async (event: CellEditingStoppedEvent) => {
      const _columnField = event.colDef.field;

      if (!_columnField) return;

      const _cellData = event.data[_columnField];

      event.api.setGridOption("loading", true);

      await updateDatasourceRow({
        datasourceId: id,
        rowId: event.data.id,
        cellColumnName: _columnField,
        updatedCellData: _cellData,
      });

      event.api.setGridOption("loading", false);
    },
    [id],
  );

  const onColumnMovedOrPinned = useCallback(
    async (event: ColumnMovedEvent | ColumnPinnedEvent) => {
      if (typeof (event as ColumnMovedEvent)?.finished === "boolean") {
        // if finished is false then it means the user is still dragging the column (only for ColumnMovedEvent)
        if (!(event as ColumnMovedEvent).finished) return;
      }

      event.api.setGridOption("loading", true);

      await syncColumnsOrder({
        columns: event.api.getAllGridColumns(),
        currentDatasource: datasource,
      });

      await datasourceMutate();

      event.api.setGridOption("loading", false);
    },
    [datasource, datasourceMutate],
  );

  if (datasourceColumnsIsLoading || datasourceRowsIsLoading) {
    return <CenteredLoader />;
  }

  return (
    <Stack h={"100%"}>
      <title>{datasource?.name}</title>
      <Group>
        <ActionButtons />
      </Group>
      <AgGridReact
        localeText={AG_GRID_LOCALE_IR}
        className="ag-theme-alpine"
        enableRtl={true}
        rowData={datasourceRows}
        columnDefs={colDefs}
        onCellEditingStopped={onCellEditingStopped}
        onColumnMoved={onColumnMovedOrPinned}
        onColumnPinned={onColumnMovedOrPinned}
        headerHeight={80}
      />
    </Stack>
  );
}

export default DatasourceTable;
