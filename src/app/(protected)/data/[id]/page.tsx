"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "react-data-grid/lib/styles.css";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { Anchor, Breadcrumbs, Stack, em, Text } from "@mantine/core";

import { useMediaQuery } from "@mantine/hooks";
import DatasourceTable from "../(components)/datasource-table";
import DatasourceMap from "../(components)/datasource-map";
import Link from "next/link";
import useDatasource from "@shared/hooks/swr/datasources/use-datasource";

function Page({ params }: { params: { id: string } }) {
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);
  const { datasource } = useDatasource({ id: params.id });

  return (
    <Stack flex={"1"} style={{ overflowY: "auto" }}>
      <Breadcrumbs pt={"md"} px={"md"}>
        <Anchor component={Link} href="/data">
          مجموعه‌داده‌ها
        </Anchor>
        <Text>{datasource?.name}</Text>
      </Breadcrumbs>
      <PanelGroup direction={isMobile ? "vertical" : "horizontal"}>
        <Panel>
          <DatasourceTable id={params.id} />
        </Panel>

        <PanelResizeHandle
          style={{
            background: "var(--mantine-color-gray-4)",
            width: isMobile ? "100%" : "3px",
            height: isMobile ? "3px" : "100%",
          }}
        />

        <Panel>
          <DatasourceMap id={params.id} />
        </Panel>
      </PanelGroup>
    </Stack>
  );
}

export default Page;
