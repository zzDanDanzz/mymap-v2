import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

import { Box, useMantineTheme } from "@mantine/core";
import CenteredLoader from "@shared/component/centered-loader";
import {
  COLUMNS_TO_HIDE,
  GEOMETRY_DATA_TYPES,
} from "@shared/constants/datasource.constants";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { DatasourceColumn } from "@shared/types/datasource.types";
import type { CellEditingStoppedEvent, ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useMemo } from "react";
import GeomSvgPreview from "./(components)/geom-svg-preview";
import { updateDatasourceRow } from "./(utils)/api";

function useColDefs(datasourceColumns: DatasourceColumn[] | undefined) {
  const theme = useMantineTheme();

  const transformedColumns = useMemo(() => {
    return (
      datasourceColumns
        ?.filter(({ name }) => !COLUMNS_TO_HIDE.includes(name))
        .map((col) => {
          const colDef: ColDef = {
            field: col.name,
            editable: true,
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

          return colDef;
        }) ?? []
    );
  }, [datasourceColumns, theme.colors, theme.primaryColor]);

  return transformedColumns;
}

function DatasourceTable({ id }: { id: string }) {
  const { datasourceColumns, datasourceColumnsIsLoading } =
    useDatasourceColumns({ id });

  const { datasourceRows, datasourceRowsIsLoading } = useDatasourceRows({
    id,
  });

  const colDefs = useColDefs(datasourceColumns);

  const onCellEditingStopped = useCallback(
    (event: CellEditingStoppedEvent) => {
      const _columnField = event.colDef.field;

      if (!_columnField) return;

      const _cellData = event.data[_columnField];

      updateDatasourceRow({
        datasourceId: id,
        rowId: event.data.id,
        cellColumnName: _columnField,
        updatedCellData: _cellData,
      });
    },
    [id],
  );

  if (datasourceColumnsIsLoading || datasourceRowsIsLoading) {
    return <CenteredLoader />;
  }

  return (
    <Box className="ag-theme-alpine" h={"100%"} p={"lg"}>
      <AgGridReact
        enableRtl={true}
        rowData={datasourceRows}
        columnDefs={colDefs}
        onCellEditingStopped={onCellEditingStopped}
      />
    </Box>
  );
}

export default DatasourceTable;
