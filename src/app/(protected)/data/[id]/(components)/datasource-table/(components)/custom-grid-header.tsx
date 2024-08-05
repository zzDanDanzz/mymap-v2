import { Stack, Text } from "@mantine/core";
import { DatasourceColumn } from "@shared/types/datasource.types";
import { CustomHeaderProps } from "ag-grid-react";

function CustomGridHeader(props: CustomHeaderProps) {
  return (
    <Stack gap={"xs"}>
      <Text size="sm" fw={"bold"}>
        {props.column.getColId()}
      </Text>
      <Text size="sm">
        {
          (props.column.getColDef().context.apiColumnData as DatasourceColumn)
            .data_type
        }
      </Text>
    </Stack>
  );
}

export default CustomGridHeader;
