import { useMantineTheme } from "@mantine/core";
import {
  COLUMNS_TO_HIDE,
  GEOMETRY_DATA_TYPES,
} from "@shared/constants/datasource.constants";
import { Datasource, DatasourceColumn } from "@shared/types/datasource.types";
import type { ColDef } from "ag-grid-community";
import { CustomCellRendererProps, CustomHeaderProps } from "ag-grid-react";
import { useMemo } from "react";
import CustomGridHeader from "../(components)/custom-grid-header";
import GeomSvgPreview from "../(components)/customer-cell-renderers/geom-svg-preview";
import { useColumnOrdering } from "./use-column-ordering";
import AttachmentPreview from "../(components)/customer-cell-renderers/attachment/attachment-preview";

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
            headerComponent: (props: CustomHeaderProps) => (
              <CustomGridHeader {...props} />
            ),
            context: {
              apiColumnData: col,
            },
          };

          // custom cell renderer for geometry data types
          if (GEOMETRY_DATA_TYPES.includes(col.data_type)) {
            colDef.editable = false;

            colDef.cellRenderer = (props: CustomCellRendererProps) => {
              return (
                <GeomSvgPreview
                  value={props.value}
                  color={theme.colors[theme.primaryColor][5]}
                />
              );
            };
          }

          // custom cell renderer for attachment data type
          if (col.data_type === "attachment") {
            colDef.editable = false;

            colDef.cellRenderer = (props: CustomCellRendererProps) => {
              console.log(props);
              return (
                <AttachmentPreview cellData={props.value} columnId={col.name} />
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

export default useColDefs;
