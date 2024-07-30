import { Group } from "@mantine/core";
import ExportDatasource from "./export-datasource";
import ToggleColumnVisibility from "./toggle-column-visibility";

function ActionButtons() {
  return (
    <Group>
      <ExportDatasource />
      <ToggleColumnVisibility />
    </Group>
  );
}

export default ActionButtons;
