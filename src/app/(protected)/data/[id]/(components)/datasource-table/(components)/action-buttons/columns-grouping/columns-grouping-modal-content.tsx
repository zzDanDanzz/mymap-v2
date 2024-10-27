import {
  ActionIcon,
  Button,
  Group,
  Menu,
  Paper,
  Stack,
  Text,
  TextInput,
  rem,
} from "@mantine/core";
import { useCallback, useRef, useState } from "react";

import {
  IconLayoutColumns,
  IconPencil,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";

import { useDisclosure } from "@mantine/hooks";
import TransferList, { Value } from "@shared/component/transfer-list";
import { DatasourceColumn } from "@shared/types/datasource.types";
import { flushSync } from "react-dom";
import { GroupedColumn } from "./types";

function getUniqueGroupName({
  groupedColumns,
}: {
  groupedColumns: GroupedColumn[];
}) {
  const _getHeaderName = (count: number) => `گروه جدید ${count}`;

  let nameCount = 1;

  while (true) {
    const newGroupName = _getHeaderName(nameCount);
    const nameAlreadyExists = groupedColumns.some(
      (col) => col.groupName === newGroupName
    );
    if (nameAlreadyExists) nameCount++;
    if (!nameAlreadyExists) break;
  }

  return _getHeaderName(nameCount);
}

const INITIAL_GROUP_TRANSFER_LIST_DATA = {
  values: [[], []] as [Value[], Value[]],
  titles: ["", ""] as [string, string],
};

function ColumnsGroupingModalContent({
  initialGroupedCols,
  initialUngroupedCols,
  onCancel,
  onSubmit,
  loading,
}: {
  initialGroupedCols: GroupedColumn[];
  initialUngroupedCols: DatasourceColumn[];
  onCancel: () => void;
  onSubmit: (_columns: {
    grouped: GroupedColumn[];
    ungrouped: DatasourceColumn[];
  }) => void;
  loading: boolean;
}) {
  const [columns, setColumns] = useState(() => ({
    grouped: initialGroupedCols,
    ungrouped: initialUngroupedCols,
  }));

  const _groupedColumnsContainerRef = useRef<HTMLDivElement>(null);

  function createNewGroup() {
    flushSync(() => {
      setColumns({
        ...columns,
        grouped: [
          ...columns.grouped,
          {
            groupName: getUniqueGroupName({ groupedColumns: columns.grouped }),
            columns: [],
          },
        ],
      });
    });

    function scrollIntoView() {
      const div = _groupedColumnsContainerRef.current;
      if (div) div.scrollTop = div.scrollHeight;
    }

    scrollIntoView();
  }

  function handleEditGroupName({
    newName,
    prevName,
  }: {
    newName: string;
    prevName: string;
  }) {
    setColumns({
      ...columns,
      grouped: columns.grouped.map((col) => {
        if (col.groupName === prevName) {
          if (typeof newName === "string" && newName !== "") {
            col.groupName = newName;
          }
        }
        return col;
      }),
    });
  }

  function handleDeleteGroup(name: string) {
    const deletedGroup = columns.grouped.find((col) => col.groupName === name);

    if (!deletedGroup) return;

    setColumns({
      grouped: columns.grouped.filter((col) => col.groupName !== name),
      ungrouped: [...columns.ungrouped, ...deletedGroup.columns],
    });
  }

  const [isEditingGroup, setIsEditingGroup] = useState(false);

  const [groupTransferListData, setGroupTransferListData] = useState(
    INITIAL_GROUP_TRANSFER_LIST_DATA
  );

  function handleEditGroupColumns(name: string) {
    const columnsInThisGroup = columns.grouped.find(
      (g) => g.groupName === name
    )?.columns;

    if (!columnsInThisGroup) return;

    const transferListLeftValues = columnsInThisGroup.map(
      (c) =>
        ({
          id: c.name,
          label: c.name,
          context: c,
        } as Value)
    );

    const transferListRightValues = columns.ungrouped.map(
      (c) =>
        ({
          id: c.name,
          label: c.name,
          context: c,
        } as Value)
    );

    setGroupTransferListData({
      values: [transferListLeftValues, transferListRightValues],
      titles: [name, "بدون گروه"],
    });

    setIsEditingGroup(true);
  }

  const onTransferListChange = useCallback(
    (newTLD: [Value[], Value[]]) => {
      setGroupTransferListData({
        values: newTLD,
        titles: groupTransferListData.titles,
      });
    },
    [groupTransferListData.titles]
  );

  const onFinishEditingGroupColumns = useCallback(() => {
    const [newGroupedCols, newUngroupedColumns] =
      groupTransferListData.values as [
        Value<DatasourceColumn>[],
        Value<DatasourceColumn>[]
      ];

    const [editedGroupGroupName] = groupTransferListData.titles;

    const newColumns = {
      grouped: columns.grouped.map((g) => {
        if (g.groupName === editedGroupGroupName) {
          return {
            groupName: g.groupName,
            columns: newGroupedCols.map((gc) => gc.context!),
          };
        }

        return g;
      }),
      ungrouped: newUngroupedColumns.map((gc) => gc.context!),
    };

    setColumns(newColumns);

    setGroupTransferListData(INITIAL_GROUP_TRANSFER_LIST_DATA);

    setIsEditingGroup(false);
  }, [
    columns.grouped,
    groupTransferListData.titles,
    groupTransferListData.values,
  ]);

  if (isEditingGroup) {
    return (
      <Stack>
        <TransferList
          nothingFound="ستونی با این اسم پیدا نشد."
          placeholder="ستونی ندارد."
          onChange={onTransferListChange}
          values={groupTransferListData.values}
          titles={groupTransferListData.titles}
        />
        <Group>
          <Button variant="outline" onClick={onFinishEditingGroupColumns}>
            بازگشت
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap={"lg"}>
      <Stack
        className="max-h-[200px] overflow-y-auto"
        ref={_groupedColumnsContainerRef}
      >
        {columns.grouped.map((col) => {
          return (
            <GroupCard
              key={col.groupName}
              column={col}
              onEditName={(newName) =>
                handleEditGroupName({ newName, prevName: col.groupName })
              }
              onGroupDelete={handleDeleteGroup}
              onEditGroupChildren={handleEditGroupColumns}
            />
          );
        })}
      </Stack>

      <Group justify="space-between">
        <Button
          disabled={loading}
          variant="outline"
          style={{ alignSelf: "start", flexShrink: 0 }}
          onClick={createNewGroup}
        >
          گروه جدید +
        </Button>
        <Group justify="flex-end">
          <Button
            disabled={loading}
            variant="outline"
            onClick={() => {
              onSubmit(columns);
            }}
          >
            ثبت تغییرات
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            انصراف
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}

function GroupCard({
  column,
  onEditName,
  onGroupDelete,
  onEditGroupChildren,
}: {
  column: GroupedColumn;
  onEditName: (_newName: string) => void;
  onGroupDelete: (_name: string) => void;
  onEditGroupChildren: (_name: string) => void;
}) {
  const [isEditingName, { open: _startEditingName, close: stopEditingName }] =
    useDisclosure(false);

  const inputRef = useRef<HTMLInputElement>(null);

  function startEditingName() {
    flushSync(() => {
      _startEditingName();
    });
    inputRef.current?.focus();
  }

  return (
    <Paper withBorder p={"md"}>
      <Group justify="space-between">
        {isEditingName ? (
          <TextInput
            ref={inputRef}
            defaultValue={column.groupName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const newGroupName = e.currentTarget.value.trim();
                onEditName(newGroupName);
                stopEditingName();
              }
            }}
            onBlur={(e) => {
              const newGroupName = e.currentTarget.value.trim();
              onEditName(newGroupName);
              stopEditingName();
            }}
          />
        ) : (
          <Text>{column.groupName}</Text>
        )}

        <Menu position="right-start">
          <Menu.Target>
            <ActionIcon variant="subtle">
              <IconSettings />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              onClick={() => {
                onEditGroupChildren(column.groupName);
              }}
              leftSection={
                <IconLayoutColumns
                  style={{ width: rem(16), height: rem(16) }}
                />
              }
            >
              ویرایش گروه
            </Menu.Item>
            <Menu.Item
              onClick={startEditingName}
              leftSection={
                <IconPencil style={{ width: rem(16), height: rem(16) }} />
              }
            >
              ویرایش نام
            </Menu.Item>
            <Menu.Item
              onClick={() => onGroupDelete(column.groupName)}
              color="red"
              leftSection={
                <IconTrash style={{ width: rem(16), height: rem(16) }} />
              }
            >
              حذف
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Paper>
  );
}

export default ColumnsGroupingModalContent;
