"use client";

import {
  ActionIcon,
  Checkbox,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

export type Value = {
  id: string;
  label: string;
};

interface ITransferListProps {
  values: [Value[], Value[]];
  titles: [string, string];
  nothingFound: string;
  placeholder: string;
  onChange: (values: [Value[], Value[]]) => void;
}

function TransferList({ onChange, ...props }: ITransferListProps) {
  const [leftListValues, setLeftListValues] = useState(props.values[0]);
  const [rightListValues, setRightListValues] = useState(props.values[1]);

  const leftTitle = props.titles[0];
  const rightTitle = props.titles[1];

  const onTransferLeftToRight = (value: Value[]) => {
    setLeftListValues((prev) => {
      return prev.filter((v) => !value.includes(v));
    });

    setRightListValues((prev) => {
      return [...prev, ...value];
    });
  };

  const onTransferRightToLeft = (value: Value[]) => {
    setRightListValues((prev) => {
      return prev.filter((v) => !value.includes(v));
    });

    setLeftListValues((prev) => {
      return [...prev, ...value];
    });
  };

  useEffect(() => {
    onChange([leftListValues, rightListValues]);
  }, [leftListValues, onChange, rightListValues]);

  return (
    <Group gap={"lg"}>
      <List
        values={rightListValues}
        title={rightTitle}
        onTransfer={onTransferRightToLeft}
        flipIcons
      />
      <List
        values={leftListValues}
        title={leftTitle}
        onTransfer={onTransferLeftToRight}
      />
    </Group>
  );
}

function List({
  values,
  title,
  flipIcons,
  onTransfer,
}: {
  values: Value[];
  title: string;
  onTransfer: (value: Value[]) => void;
  flipIcons?: boolean;
}) {
  const [selected, setSelected] = useState<Value[]>([]);
  const [search, setSearch] = useState("");

  const filteredValues = useMemo(
    () =>
      values.filter((v) =>
        v.label.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, values],
  );

  return (
    <Stack
      style={{
        flexGrow: 1,
      }}
    >
      <Text size="lg">{title}</Text>
      <Group style={{ flexDirection: flipIcons ? "row" : "row-reverse" }}>
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder={"جستجو"}
          style={{ flexGrow: 1 }}
        />
        <ActionIcon
          variant="light"
          size={"lg"}
          onClick={() => {
            onTransfer(selected);
            setSelected([]);
          }}
          disabled={selected.length === 0}
        >
          {flipIcons ? <IconChevronLeft /> : <IconChevronRight />}
        </ActionIcon>
        <ActionIcon
          variant="light"
          size={"lg"}
          onClick={() => {
            onTransfer(values);
            setSelected([]);
          }}
          disabled={values.length === 0}
        >
          {flipIcons ? <IconChevronsLeft /> : <IconChevronsRight />}
        </ActionIcon>
      </Group>
      <Paper withBorder p="md" h={256} style={{ overflow: "auto" }}>
        <Stack>
          {filteredValues.map((value) => (
            <Checkbox
              key={value.id}
              checked={selected.includes(value)}
              onChange={(e) =>
                setSelected(
                  e.currentTarget.checked
                    ? [...selected, value]
                    : selected.filter((v) => v.id !== value.id),
                )
              }
              value={value.id}
              label={value.label}
            />
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}

export default TransferList;
