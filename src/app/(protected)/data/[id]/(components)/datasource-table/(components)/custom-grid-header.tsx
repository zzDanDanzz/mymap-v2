import {
  ActionIcon,
  Box,
  Button,
  Group,
  LoadingOverlay,
  Menu,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { DatasourceColumn } from "@shared/types/datasource.types";
import notify from "@shared/utils/toasts";
import { IconDotsVertical } from "@tabler/icons-react";
import { CustomHeaderProps } from "ag-grid-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { updateDatasourceColumn } from "../(utils)/api";
import {
  DATA_TYPES_BY_CATEGORY,
  DATA_TYPE_CATEGORIES_TRANSLATIONS,
} from "@shared/constants/datasource.constants";

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
      position="bottom-start"
      opened={isMenuOpen}
      onChange={(opened) => {
        if (isMenuOpen && loading) return;
        setIsMenuOpen(opened);
      }}
      closeOnItemClick={false}
    >
      <Menu.Target>
        <Button variant="outline" size="compact-xs" radius="xl" color="gray">
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
          {Object.keys(DATA_TYPES_BY_CATEGORY).map((category, i) => (
            <React.Fragment key={category}>
              <Group gap={0}>
                <Menu.Label>
                  {DATA_TYPE_CATEGORIES_TRANSLATIONS[category]}
                </Menu.Label>
                <Menu.Divider flex={1} />
              </Group>
              {DATA_TYPES_BY_CATEGORY[
                category as keyof typeof DATA_TYPES_BY_CATEGORY
              ].map((dt) => (
                <Menu.Item
                  key={dt}
                  disabled={dt === dataType}
                  onClick={() => handleChangeDatatype(dt)}
                >
                  {dt}
                </Menu.Item>
              ))}
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
    <Group
      style={{ flexGrow: 1 }}
      justify="space-between"
      gap={0}
      maw={"100%"}
      wrap="nowrap"
    >
      <Stack gap={"xs"} align="flex-start" maw={"85%"}>
        <Text size="sm" fw={"bold"} truncate maw={"100%"}>
          {columnID}
        </Text>

        <DataTypePickerDropdown
          dataType={dataType}
          columnID={columnID}
          datasourceId={id}
        />
      </Stack>
      <Box flex={"0 0 auto"}>
        <ColumnOptionsMenu />
      </Box>
    </Group>
  );
}

export default CustomGridHeader;
