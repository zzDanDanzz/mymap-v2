import { useContext, useMemo, useState } from "react";

import { Modal } from "@mantine/core";

import { Button as ButtonUI } from "components/ui/button";

import { Icon } from "@iconify-icon/react";
import groupListIcon from "@iconify-icons/fluent/group-list-20-regular";
import { useDisclosure } from "@mantine/hooks";
import { DataContext } from "context/data";
import groupBy from "lodash.groupby";
import isEqual from "lodash.isequal";
import {
  DataGridColumnDefGrouped,
  DataGridColumnDefSimple,
} from "types/editor";
import ColumnsGroupingModalContent from "./columns-grouping-modal-content";

function ColumnsGrouping() {
  const { currentColumns, columnDefs, updateColumn } = useContext(DataContext);
  const [opened, { open, close }] = useDisclosure(false);

  const initialData = useMemo(() => {
    if (!columnDefs && !opened) return;

    const COLUMNS_TO_EXCLUDE = ["id", "deleted_at"];

    const removeColumnsToExclude = (c: DataGridColumnDefSimple) =>
      !COLUMNS_TO_EXCLUDE.includes(c.field as string);

    const _groupedCols = (columnDefs as any).filter((def: any) => {
      return typeof def.headerName === "string";
    }) as DataGridColumnDefGrouped[];

    const _groupedGroups = groupBy(_groupedCols, "headerName");

    const initialGroupedCols = Object.entries(_groupedGroups).map(
      ([headerName, columns]) => {
        return {
          headerName,
          children: columns
            .map((c) => c.children)
            .flat()
            .filter(removeColumnsToExclude),
        } as DataGridColumnDefGrouped;
      },
    );

    const initialUngroupedCols = (columnDefs as any)
      .filter((def: any) => {
        return typeof def.headerName !== "string";
      })
      .filter(removeColumnsToExclude) as DataGridColumnDefSimple[];

    return {
      initialGroupedCols,
      initialUngroupedCols,
    };
  }, [columnDefs?.length, opened]);

  const columnDefsLoadedAndProcessed =
    typeof initialData?.initialGroupedCols?.length === "number";

  const [loading, setLoading] = useState(false);

  async function onSubmitGroupingChanges(columns: {
    grouped: DataGridColumnDefGrouped[];
    ungrouped: DataGridColumnDefSimple[];
  }) {
    if (!currentColumns) return;

    const hasChanges = !isEqual(
      columns.grouped,
      initialData?.initialGroupedCols,
    );

    if (!hasChanges) {
      return;
    }

    for (const group of columns.grouped) {
      for (const colDef of group.children as DataGridColumnDefSimple[]) {
        if (colDef.group_name !== group.headerName) {
          // group names not same, do sth
          await new Promise((res, rej) => {
            updateColumn(
              { group_name: group.headerName },
              colDef.field,
              res,
              rej,
            );
          }).catch(console.error);
        }
      }
    }

    for (const colDef of columns.ungrouped) {
      if (typeof colDef.group_name === "string") {
        // ungrouped col has group, do sth
        await new Promise((res, rej) => {
          updateColumn({ group_name: null }, colDef.field, res, rej);
        }).catch(console.error);
      }
    }
  }

  return (
    <>
      {columnDefsLoadedAndProcessed && (
        <ButtonUI
          disabled={(currentColumns?.length ?? 0) < 1}
          size="icon"
          className="h-12 w-12 rounded-xl bg-[var(--color-secondary-1)] text-[var(--color-secondary-2)] hover:bg-[var(--color-secondary-2)] hover:text-[var(--color-secondary-1)]"
          onClick={open}
        >
          <Icon width="20" icon={groupListIcon} />
        </ButtonUI>
      )}
      {opened && initialData && (
        <Modal
          opened={opened}
          onClose={close}
          title="گروه‌بندی ستون‌ها"
          withCloseButton={false}
          closeOnClickOutside={false}
          closeOnEscape={false}
        >
          <ColumnsGroupingModalContent
            initialGroupedCols={initialData.initialGroupedCols}
            initialUngroupedCols={initialData.initialUngroupedCols}
            onCancel={close}
            onSubmit={async (columns) => {
              setLoading(true);
              await onSubmitGroupingChanges(columns);
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
