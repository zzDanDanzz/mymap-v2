import {
  ActionIcon,
  Button,
  Group,
  Input,
  Menu,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { useRef } from "react";
import { useImmer } from "use-immer";

import { IconSettings } from "@tabler/icons-react";

import { useDisclosure } from "@mantine/hooks";
import { ColDef } from "ag-grid-community";
import { flushSync } from "react-dom";

const INITIAL_TRANSFER_LIST_DATA = {
  isTransfering: false,
  props: {
    value: [[], []] as TransferListData,
    titles: ["", ""] as [string, string],
  },
};

function getUniqueGroupName({
  groupedColumns,
}: {
  groupedColumns: DataGridColumnDefGrouped[];
}) {
  const _getHeaderName = (count: number) => `گروه جدید ${count}`;

  let nameCount = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const newHeaderName = _getHeaderName(nameCount);
    const nameAlreadyExists = groupedColumns.some(
      (col) => col.headerName === newHeaderName,
    );
    if (nameAlreadyExists) nameCount++;
    if (!nameAlreadyExists) break;
  }

  return _getHeaderName(nameCount);
}

function ColumnsGroupingModalContent({
  initialGroupedCols,
  initialUngroupedCols,
  onCancel,
  onSubmit,
  loading,
}: {
  initialGroupedCols: DataGridColumnDefGrouped[];
  initialUngroupedCols: DataGridColumnDefSimple[];
  onCancel: () => void;
  onSubmit: (columns: {
    grouped: DataGridColumnDefGrouped[];
    ungrouped: DataGridColumnDefSimple[];
  }) => void;
  loading: boolean;
}) {
  const [columns, setColumns] = useImmer({
    grouped: initialGroupedCols,
    ungrouped: initialUngroupedCols,
  });

  const _groupedColumnsContainerRef = useRef<HTMLDivElement>(null);

  function createNewGroup() {
    setColumns((gc) => {
      gc.grouped.push({
        headerName: getUniqueGroupName({ groupedColumns: columns.grouped }),
        children: [],
      });
    });

    function scrollIntoView() {
      const div = _groupedColumnsContainerRef.current;
      if (div) div.scrollTop = div.scrollHeight;
    }

    setTimeout(scrollIntoView, 150);
  }

  function handleEditName({
    newName,
    prevName,
  }: {
    newName: string;
    prevName: string;
  }) {
    setColumns((prevGroupedCols) => {
      for (const prevCol of prevGroupedCols.grouped) {
        if (prevCol.headerName === prevName) {
          if (typeof newName === "string" && newName !== "") {
            prevCol.headerName = newName;
          }
        }
      }
    });
  }

  function handleDelete(name: string) {
    setColumns((prevCols) => {
      const i = prevCols.grouped.findIndex((c) => c.headerName === name);
      if (i === -1) return;
      prevCols.ungrouped = prevCols.grouped[i].children;
      prevCols.grouped.splice(i, 1);
    });
  }

  const [transferListData, setTransferListData] = useImmer(
    INITIAL_TRANSFER_LIST_DATA,
  );

  function handleEditChildren(name: string) {
    const groupChildren = columns.grouped
      .find((g) => g.headerName === name)
      ?.children.map((c: ColDef) => {
        return {
          label: c.field,
          value: c.field,
          colDef: c,
        } as TransferListItem;
      });

    const ungroupedColumns = columns.ungrouped.map((c) => {
      return {
        label: c.field,
        value: c.field,
        colDef: c,
      } as TransferListItem;
    });

    if (!groupChildren) return;

    setTransferListData({
      props: {
        value: [groupChildren, ungroupedColumns],
        titles: [name, "بدون گروه"],
      },
      isTransfering: true,
    });
  }

  if (transferListData.isTransfering) {
    return (
      <Stack>
        <TransferList
          transferAllMatchingFilter
          nothingFound="ستونی با این اسم پیدا نشد."
          placeholder="ستونی ندارد."
          onChange={(newTLD) => {
            setTransferListData((prevTLD) => {
              prevTLD.props.value = newTLD;
            });
          }}
          {...transferListData.props}
        />
        <Group>
          <Button
            variant="outline"
            onClick={() => {
              const [groupChildren, ungroupedColumns] =
                transferListData.props.value;

              const [headerName] = transferListData.props.titles;

              setColumns((cols) => {
                for (const c of cols.grouped) {
                  if (c.headerName === headerName) {
                    c.children = groupChildren.map((gc) => gc.colDef);
                  }
                }
                cols.ungrouped = ungroupedColumns.map((gc) => gc.colDef);
              });

              setTransferListData(INITIAL_TRANSFER_LIST_DATA);
            }}
          >
            بازگشت
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack spacing={"lg"}>
      <Stack
        className="max-h-[200px] overflow-y-auto"
        ref={_groupedColumnsContainerRef}
      >
        {columns.grouped.map((col) => {
          return (
            <GroupCard
              key={col.headerName}
              column={col}
              onEditName={(newName) =>
                handleEditName({ newName, prevName: col.headerName! })
              }
              onGroupDelete={handleDelete}
              onEditGroupChildren={handleEditChildren}
            />
          );
        })}
      </Stack>

      <Group position="apart">
        <Button
          disabled={loading}
          variant="outline"
          style={{ alignSelf: "start", flexShrink: 0 }}
          onClick={createNewGroup}
        >
          گروه جدید +
        </Button>
        <Group position="right">
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
  column: DataGridColumnDefGrouped;
  onEditName: (newName: string) => void;
  onGroupDelete: (name: string) => void;
  onEditGroupChildren: (name: string) => void;
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
      <Group position="apart">
        {isEditingName ? (
          <Input
            ref={inputRef}
            defaultValue={column.headerName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // @ts-ignore
                const newGroupName = e.target.value;
                onEditName(newGroupName);
                stopEditingName();
              }
            }}
            onBlur={(e) => {
              const newGroupName = e.target.value;
              onEditName(newGroupName);
              stopEditingName();
            }}
          />
        ) : (
          <Text>{column.headerName}</Text>
        )}

        <Menu position="right-start">
          <Menu.Target>
            <ActionIcon>
              <IconSettings />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              onClick={() => {
                onEditGroupChildren(column.headerName!);
              }}
            >
              ویرایش گروه
            </Menu.Item>
            <Menu.Item onClick={startEditingName}>ویرایش نام</Menu.Item>
            <Menu.Item
              onClick={() => onGroupDelete(column.headerName!)}
              color="red"
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
