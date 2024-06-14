"use client";

import {
  Anchor,
  Box,
  Breadcrumbs,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Tooltip
} from "@mantine/core";
import CenteredLoader from "@shared/component/centered-loader";
import useAllDatasources from "@shared/hooks/swr/datasources/use-all-datasources";
import { Datasource } from "@shared/types/datasource.types";
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
      c={"black"}
    >
      <Tooltip label={datasource.name}>
        <Text fw={"bold"} truncate>
          {datasource.name}
        </Text>
      </Tooltip>
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

function DatasourceCardsGrid({ datasources }: { datasources?: Datasource[] }) {
  return (
    <SimpleGrid
      cols={{
        base: 2,
        sm: 3,
        md: 4,
      }}
    >
      {datasources?.map((datasource) => (
        <DatasourceCard key={datasource.id} datasource={datasource} />
      ))}
    </SimpleGrid>
  );
}

export default function Page() {
  const { datasources, datasourcesIsLoading } = useAllDatasources();
  return (
    <Box component="main" w={"100%"} h={"100%"}>
      <Stack
        gap={"lg"}
        maw={"var(--mantine-breakpoint-lg)"}
        mx={"auto"}
        w={"100%"}
        p={"lg"}
      >
        <Breadcrumbs>
          <Anchor component={Link} href="/data">
            مجموعه‌داده‌ها
          </Anchor>
        </Breadcrumbs>

        {datasourcesIsLoading ? (
          <CenteredLoader mih={'50vh'}/>
        ) : (
          <DatasourceCardsGrid datasources={datasources} />
        )}

      </Stack>
    </Box>
  );
}
