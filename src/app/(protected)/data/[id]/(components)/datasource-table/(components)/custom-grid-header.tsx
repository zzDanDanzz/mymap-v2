import {
  Button,
  Menu,
  ScrollArea,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { DatasourceColumn } from "@shared/types/datasource.types";
import { CustomHeaderProps } from "ag-grid-react";

const translations = {
  geography: "جغرافیایی",
  text: "متنی",
  numerical: "عددی",
  date: "تاریخ",
  etc: "غیره",
};

const dataTypesByCategory: Record<string, string[]> = {
  geography: [
    "point",
    "linestring",
    "polygon",
    "multipoint",
    "multilinestring",
    "multipolygon",
    "geometrycollection",
    "geometry",
  ],
  text: ["string", "text"],
  numerical: ["int", "double", "real"],
  date: ["timestamp", "time"],
  etc: ["uuid", "json", "bool", "attachment"],
};

function DataTypePickerDropdown({ dataType }: { dataType: string }) {
  function handleChangeDatatype(newDataType: string) {}

  return (
    <Menu>
      <Menu.Target>
        <Button
          variant="outline"
          size="xs"
          radius="xl"
          p={0}
          px={"xs"}
          color="gray"
        >
          {dataType}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <ScrollArea.Autosize mah={250} type="auto" offsetScrollbars>
          {Object.keys(dataTypesByCategory).map((category) => (
            <>
              <Menu.Label>
                {translations[category as keyof typeof translations]}
              </Menu.Label>
              {dataTypesByCategory[category].map((dt) => (
                <Menu.Item
                  key={dataType}
                  disabled={dt === dataType}
                  onClick={() => handleChangeDatatype(dt)}
                >
                  {dt}
                </Menu.Item>
              ))}
              <Menu.Divider />
            </>
          ))}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}

function CustomGridHeader(props: CustomHeaderProps) {
  const dataType = (
    props.column.getColDef().context.apiColumnData as DatasourceColumn
  ).data_type;

  return (
    <Stack gap={"xs"}>
      <Text size="md" fw={"bold"}>
        {props.column.getColId()}
      </Text>

      <DataTypePickerDropdown dataType={dataType} />
    </Stack>
  );
}

export default CustomGridHeader;
