import { ActionIcon, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { COLUMNS_TO_HIDE } from "@shared/constants/datasource.constants";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { DatasourceColumn } from "@shared/types/datasource.types";
import { IconListDetails } from "@tabler/icons-react";
import groupBy from "lodash.groupby";
import isEqual from "lodash.isequal";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { updateDatasourceColumn } from "../../../(utils)/api";
import ColumnsGroupingModalContent from "./columns-grouping-modal-content";
import { GroupedColumn } from "./types";

function getInitialData({
  datasourceColumns,
}: {
  datasourceColumns: DatasourceColumn[];
}) {
  const filteredDatasourceColumns = datasourceColumns.filter(
    (c) => !COLUMNS_TO_HIDE.includes(c.name),
  );

  const colsWithGroupName = filteredDatasourceColumns.filter((col) => {
    return typeof col.group_name === "string";
  });

  const initialGroupedCols = Object.entries(
    groupBy(colsWithGroupName, "group_name"),
  ).map(([groupName, columns]) => {
    return {
      groupName,
      columns,
    } as GroupedColumn;
  });

  const initialUngroupedCols = filteredDatasourceColumns.filter((col) => {
    return typeof col.group_name !== "string";
  });

  return {
    initialGroupedCols,
    initialUngroupedCols,
  };
}

function ColumnsGrouping() {
  const { id } = useParams<{ id: string }>();

  const { datasourceColumns, datasourceColumnsMutate } = useDatasourceColumns({
    id,
  });

  const [opened, { open, close }] = useDisclosure(false);

  const initialData = useMemo(() => {
    // checking for 'opened' to provide fresh data on opening the modal
    if (!datasourceColumns || !opened) return;
    return getInitialData({ datasourceColumns });
  }, [datasourceColumns, opened]);

  const [loading, setLoading] = useState(false);

  const onSubmitGroupingChanges = useCallback(
    async (columns: {
      grouped: GroupedColumn[];
      ungrouped: DatasourceColumn[];
    }) => {
      if (!datasourceColumns) return;

      const hasChanges = !isEqual(
        columns.grouped,
        getInitialData({ datasourceColumns }).initialGroupedCols,
      );

      if (!hasChanges) {
        return;
      }

      for (const group of columns.grouped) {
        for (const col of group.columns) {
          if (col.group_name !== group.groupName) {
            // group names not same, do sth
            await updateDatasourceColumn({
              columnID: col.name,
              datasourceId: id,
              updatedColumnData: { group_name: group.groupName },
            }).catch(console.error);
          }
        }
      }

      for (const colDef of columns.ungrouped) {
        if (typeof colDef.group_name === "string") {
          // ungrouped col has group, do sth
          await updateDatasourceColumn({
            columnID: colDef.name,
            datasourceId: id,
            updatedColumnData: { group_name: null },
          }).catch(console.error);
        }
      }
    },
    [datasourceColumns, id],
  );

  return (
    <>
      <ActionIcon
        variant="filled"
        disabled={(datasourceColumns?.length ?? 0) < 1}
        title="گروه‌بندی ستون‌ها"
        onClick={open}
      >
        <IconListDetails />
      </ActionIcon>
      {opened && initialData && (
        <Modal
          opened={opened}
          onClose={close}
          title="گروه‌بندی ستون‌ها"
          withCloseButton={false}
          closeOnClickOutside={false}
          closeOnEscape={false}
          centered
        >
          <ColumnsGroupingModalContent
            initialGroupedCols={initialData.initialGroupedCols!}
            initialUngroupedCols={initialData.initialUngroupedCols!}
            onCancel={close}
            onSubmit={async (columns) => {
              setLoading(true);
              await onSubmitGroupingChanges(columns);
              await datasourceColumnsMutate();
              setLoading(false);
              close();
            }}
            loading={loading}
          />
        </Modal>
      )}
    </>
  );
}

export default ColumnsGrouping;
