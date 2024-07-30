import {
  ActionIcon,
  Checkbox,
  Popover,
  ScrollArea,
  Stack,
  TextInput,
} from "@mantine/core";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { IconEyeOff } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { updateDatasourceColumn } from "../../(utils)/api";
import { COLUMNS_TO_HIDE } from "@shared/constants/datasource.constants";

function ToggleColumnVisibility() {
  const { id } = useParams<{ id: string }>();

  const { datasourceColumns } = useDatasourceColumns({ id });

  const [checkboxesLoadingMap, setAreCheckboxesLoadingMap] = useState<
    Record<string, boolean>
  >({});

  const [search, setSearch] = useState("");

  async function handleToggleVisibility({
    colName,
    visible,
  }: {
    visible: boolean;
    colName: string;
  }) {
    const col = datasourceColumns?.find((c) => c.name === colName);

    await updateDatasourceColumn({
      columnID: colName,
      datasourceId: id,
      updatedColumnData: {
        settings: {
          ...col?.settings,
          hide: !visible,
        },
      },
    });
  }

  const filteredColumns = useMemo(() => {
    if (search === "") return datasourceColumns;
    return datasourceColumns?.filter((c) => c.name.includes(search));
  }, [datasourceColumns, search]);

  return (
    <Popover width={200}>
      <Popover.Target>
        <ActionIcon variant="filled" title="پنهان / نمایش ستون‌ها">
          <IconEyeOff />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack>
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="جستجو"
          />
          <ScrollArea.Autosize mah={250} type="auto">
            <Stack>
              {filteredColumns?.map((c) => {
                if (COLUMNS_TO_HIDE.includes(c.name)) return null;
                return (
                  <Checkbox
                    disabled={checkboxesLoadingMap[c.name]}
                    label={c.name}
                    key={c.name}
                    defaultChecked={!(c.settings?.hide ?? false)}
                    onChange={async (event) => {
                      const visible = event.currentTarget.checked;
                      setAreCheckboxesLoadingMap((prevL) => {
                        return { ...prevL, [c.name]: true };
                      });
                      await handleToggleVisibility({
                        visible,
                        colName: c.name,
                      });
                      setAreCheckboxesLoadingMap((prevL) => {
                        return { ...prevL, [c.name]: false };
                      });
                    }}
                  />
                );
              })}
            </Stack>
          </ScrollArea.Autosize>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

export default ToggleColumnVisibility;
