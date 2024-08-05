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

/**
 *
 * @param T: optional context type if you need to associate some data with the value
 */
export type Value<T = unknown> = {
  id: string;
  label: string;
  context?: T;
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

  const leftTitle = useMemo(() => props.titles[0], [props.titles]);
  const rightTitle = useMemo(() => props.titles[1], [props.titles]);

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
    <Group gap={"lg"} wrap="nowrap">
      <List
        placeholder={props.placeholder}
        nothingFound={props.nothingFound}
        values={rightListValues}
        title={rightTitle}
        onTransfer={onTransferRightToLeft}
        flipIcons
      />
      <List
        placeholder={props.placeholder}
        nothingFound={props.nothingFound}
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
  nothingFound,
  placeholder,
}: {
  values: Value[];
  title: string;
  onTransfer: (value: Value[]) => void;
  flipIcons?: boolean;
  nothingFound: string;
  placeholder: string;
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
      <Stack>
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder={"جستجو"}
          style={{ flexGrow: 1 }}
        />
        <Group
          style={{ flexDirection: flipIcons ? "row" : "row-reverse" }}
          justify="flex-end"
        >
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
      </Stack>
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
          {filteredValues.length === 0 &&
            (search.length === 0 ? (
              <Text size="sm" c={"gray"}>
                {placeholder}
              </Text>
            ) : (
              <Text size="sm" c={"gray"}>
                {nothingFound}
              </Text>
            ))}
        </Stack>
      </Paper>
    </Stack>
  );
}

export default TransferList;
