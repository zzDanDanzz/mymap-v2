import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

import { AG_GRID_LOCALE_IR } from "@ag-grid-community/locale";
import { Group, Stack, useMantineTheme } from "@mantine/core";
import CenteredLoader from "@shared/component/centered-loader";
import {
  COLUMNS_TO_HIDE,
  GEOMETRY_DATA_TYPES,
} from "@shared/constants/datasource.constants";
import useDatasource from "@shared/hooks/swr/datasources/use-datasource";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { Datasource, DatasourceColumn } from "@shared/types/datasource.types";
import type {
  CellEditingStoppedEvent,
  ColDef,
  ColumnMovedEvent,
  ColumnPinnedEvent,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import ActionButtons from "./(components)/action-buttons";
import GeomSvgPreview from "./(components)/geom-svg-preview";
import { useColumnOrdering } from "./(hooks)/use-column-ordering";
import { syncColumnsOrder, updateDatasourceRow } from "./(utils)/api";

function useColDefs({
  currentDatasource,
  datasourceColumns,
}: {
  currentDatasource: Datasource | undefined;
  datasourceColumns: DatasourceColumn[] | undefined;
}) {
  const columnOrdering = useColumnOrdering({
    currentDatasource,
    columns: datasourceColumns,
  });

  const theme = useMantineTheme();

  const transformedColumns = useMemo(() => {
    function compareFn(a_col: DatasourceColumn, b_col: DatasourceColumn) {
      const a_colIndex = columnOrdering.findIndex((n) => n === a_col.name);
      const b_colIndex = columnOrdering.findIndex((n) => n === b_col.name);

      // a is less than b by some ordering criterion
      if (a_colIndex < b_colIndex) {
        return -1;
        // a is greater than b by the ordering criterion
      } else if (a_colIndex > b_colIndex) {
        return 1;
      }
      // a must be equal to b
      return 0;
    }

    return (
      datasourceColumns
        // hide special columns
        ?.filter(({ name }) => !COLUMNS_TO_HIDE.includes(name))
        // sort based on datasource ordering setting
        .toSorted(compareFn)
        // create ag-grid column definitions
        .map((col) => {
          const colDef: ColDef = {
            field: col.name,
            editable: true,
            pinned: col.settings?.pinned ?? false,
          };

          // custom cell renderer for geometry data types
          if (GEOMETRY_DATA_TYPES.includes(col.data_type)) {
            colDef.cellRenderer = (props: any) => {
              return (
                <GeomSvgPreview
                  value={props.value}
                  color={theme.colors[theme.primaryColor][5]}
                />
              );
            };
          }

          // handle grouping columns
          if (col.group_name) {
            return {
              headerName: col.group_name,
              children: [colDef],
            };
          }

          return colDef;
        }) ?? []
    );
  }, [columnOrdering, datasourceColumns, theme.colors, theme.primaryColor]);

  return transformedColumns;
}

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
      />
    </Stack>
  );
}

export default DatasourceTable;
