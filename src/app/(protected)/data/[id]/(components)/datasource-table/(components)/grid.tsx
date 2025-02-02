import { AG_GRID_LOCALE_IR } from "@ag-grid-community/locale";
import useDatasource from "@shared/hooks/swr/datasources/use-datasource";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import type {
  CellEditingStoppedEvent,
  ColumnMovedEvent,
  ColumnPinnedEvent,
  IRowNode,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { updateDatasourceRow } from "@/data/[id]/(utils)/api";
import { editableGeomCellInfoAtom } from "@/data/[id]/(utils)/atoms";
import { DatasourceRow } from "@shared/types/datasource.types";
import { useAtomValue } from "jotai";
import useColDefs from "../(hooks)/use-col-defs";
import { syncGridColumnsOrderWithApi } from "../(utils)/api";

function Grid({
  rowData,
  loading,
}: {
  rowData?: DatasourceRow[];
  loading: boolean;
}) {
  const { id } = useParams<{ id: string }>();

  const { datasource, datasourceMutate } = useDatasource({ id });

  const { datasourceColumns } = useDatasourceColumns({ id });

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
    [id]
  );

  const onColumnMovedOrPinned = useCallback(
    async (event: ColumnMovedEvent | ColumnPinnedEvent) => {
      if (typeof (event as ColumnMovedEvent)?.finished === "boolean") {
        // if finished is false then it means the user is still dragging the column (only for ColumnMovedEvent)
        if (!(event as ColumnMovedEvent).finished) return;
      }

      event.api.setGridOption("loading", true);

      await syncGridColumnsOrderWithApi({
        columns: event.api.getAllGridColumns(),
        currentDatasource: datasource,
      });

      await datasourceMutate();

      event.api.setGridOption("loading", false);
    },
    [datasource, datasourceMutate]
  );

  const editableGeomCellInfo = useAtomValue(editableGeomCellInfoAtom);

  const gridRef = useRef<AgGridReact>(null);

  // scroll to cell when editing its geometry
  useEffect(() => {
    const api = gridRef.current?.api;

    if (!api || !editableGeomCellInfo) return;

    api.ensureColumnVisible(editableGeomCellInfo.columnName);
    api.ensureNodeVisible(editableGeomCellInfo.rowId);
  }, [editableGeomCellInfo, editableGeomCellInfo?.rowId]);

  return (
    <AgGridReact
      ref={gridRef}
      localeText={AG_GRID_LOCALE_IR}
      className="ag-theme-alpine"
      enableRtl={true}
      columnDefs={colDefs}
      loading={loading}
      rowData={rowData}
      onCellEditingStopped={onCellEditingStopped}
      onColumnMoved={onColumnMovedOrPinned}
      onColumnPinned={onColumnMovedOrPinned}
      headerHeight={80}
    />
  );
}

export default Grid;
