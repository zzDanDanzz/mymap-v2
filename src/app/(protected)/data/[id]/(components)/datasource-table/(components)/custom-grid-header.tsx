import {
  ActionIcon,
  Button,
  Group,
  LoadingOverlay,
  Menu,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import {
  ColumnDataType,
  DatasourceColumn,
} from "@shared/types/datasource.types";
import { CustomHeaderProps } from "ag-grid-react";
import { useParams } from "next/navigation";
import { updateDatasourceColumn } from "../(utils)/api";
import { IconDotsVertical } from "@tabler/icons-react";
import { useState } from "react";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import React from "react";
import notify from "@shared/utils/toasts";

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

function DataTypePickerDropdown({
  dataType,
  datasourceId,
  columnID,
}: {
  dataType: string;
  datasourceId: string;
  columnID: string;
}) {
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { datasourceColumnsMutate } = useDatasourceColumns({
    id: datasourceId,
  });

  async function handleChangeDatatype(newDataType: string) {
    setLoading(true);

    const { success } = await updateDatasourceColumn({
      datasourceId,
      columnID,
      updatedColumnData: {
        data_type: newDataType,
      },
    });

    await datasourceColumnsMutate();

    if (success) {
      setIsMenuOpen(false);
    } else {
      notify.error("به روز رسانی دیتا تایپ با خطا مواجه شد.");
    }

    setLoading(false);
  }

  return (
    <Menu
      opened={isMenuOpen}
      onChange={(opened) => {
        if (isMenuOpen && loading) return;
        setIsMenuOpen(opened);
      }}
      closeOnItemClick={false}
    >
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
        <ScrollArea.Autosize
          mah={250}
          type="auto"
          offsetScrollbars
          pos={"relative"}
        >
          <LoadingOverlay visible={loading} />
          {Object.keys(dataTypesByCategory).map((category, i) => (
            <React.Fragment key={category}>
              <Menu.Label>
                {translations[category as keyof typeof translations]}
              </Menu.Label>
              {dataTypesByCategory[category].map((dt) => (
                <Menu.Item
                  key={dt}
                  disabled={dt === dataType}
                  onClick={() => handleChangeDatatype(dt)}
                >
                  {dt}
                </Menu.Item>
              ))}
              {i !== Object.keys(dataTypesByCategory).length - 1 && (
                <Menu.Divider />
              )}
            </React.Fragment>
          ))}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}

function ColumnOptionsMenu() {
  return (
    <Menu>
      <ActionIcon variant="transparent" c={"gray"} ml={-10}>
        <IconDotsVertical />
      </ActionIcon>
    </Menu>
  );
}

function CustomGridHeader(props: CustomHeaderProps) {
  const { id } = useParams<{ id: string }>();

  const dataType = (
    props.column.getColDef().context.apiColumnData as DatasourceColumn
  ).data_type;

  const columnID = props.column.getColId();

  return (
    <Group style={{ flexGrow: 1 }} justify="space-between">
      <Stack gap={"xs"} align="flex-start">
        <Text size="md" fw={"bold"}>
          {columnID}
        </Text>

        <DataTypePickerDropdown
          dataType={dataType}
          columnID={columnID}
          datasourceId={id}
        />
      </Stack>
      <ColumnOptionsMenu />
    </Group>
  );
}

export default CustomGridHeader;
