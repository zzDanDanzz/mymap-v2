"use client";
import { Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import useAllDatasources from "@shared/hooks/swr/use-all-datasources";
import Link from "next/link";

const propertiesToDisplay = [
  {
    key: "number_of_columns",
    name: "تعداد ستون‌ها",
  },
  {
    key: "number_of_rows",
    name: "تعداد ردیف‌ها",
  },
  {
    key: "size",
    name: "حجم",
  },
] as const;

function DatasourceCard({ datasource }: { datasource: Datasource }) {
  return (
    <Paper
      p={"md"}
      withBorder
      shadow="sm"
      component={Link}
      href={`/data/${datasource.id}`}
      c={'black'}
    >
      <Text fw={"bold"}>{datasource.name}</Text>
      <Text truncate c={"gray"}>
        {datasource.description ?? "توضیحات"}
      </Text>
      <Stack gap={0} ff={"IRANSansWebFa"}>
        {propertiesToDisplay.map(({ key, name }) => (
          <Group key={key} gap={"sm"}>
            <Text size="sm">{name}:</Text>
            <Text size="sm">{datasource[key] ?? "-"}</Text>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}

export default function Page() {
  const { datasources } = useAllDatasources();
  return (
    <main>
      <SimpleGrid cols={4}>
        {datasources?.map((datasource) => (
          <DatasourceCard key={datasource.id} datasource={datasource} />
        ))}
      </SimpleGrid>
    </main>
  );
}
