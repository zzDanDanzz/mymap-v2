"use client";
import { Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import useAllDatasources from "@shared/hooks/swr/use-all-datasources";

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
  {
    key: "name",
    name: "نام",
  },
] as const;

function DatasourceCard({ datasource }: { datasource: Datasource }) {
  return (
    <Paper p={"md"} withBorder shadow="sm">
      <Text>{datasource.name}</Text>
      <Text truncate>{datasource.description ?? "توضیحات"}</Text>
      <Stack gap={0} ff={"IRANSansWebFa"}>
        {propertiesToDisplay.map(({ key, name }) => (
          <Group key={key}>
            <Text fw={"bold"}>{name}:</Text>
            <Text>{datasource[key] ?? "-"}</Text>
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
      <SimpleGrid cols={3}>
        {datasources?.map((datasource) => (
          <DatasourceCard key={datasource.id} datasource={datasource} />
        ))}
      </SimpleGrid>
    </main>
  );
}
