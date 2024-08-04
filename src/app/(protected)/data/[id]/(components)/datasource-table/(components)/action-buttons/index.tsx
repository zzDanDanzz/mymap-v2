import { Group } from "@mantine/core";
import ExportDatasource from "./export-datasource";
import ToggleColumnVisibility from "./toggle-column-visibility";
import ColumnsGrouping from "./columns-grouping";

function ActionButtons() {
  return (
    <Group>
      <ExportDatasource />
      <ToggleColumnVisibility />
      <ColumnsGrouping />
    </Group>
  );
}

export default ActionButtons;
