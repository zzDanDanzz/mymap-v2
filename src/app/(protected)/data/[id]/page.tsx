"use client";

import { Anchor, Breadcrumbs, Stack, Text, em } from "@mantine/core";
import { useMediaQuery, useResizeObserver } from "@mantine/hooks";
import useDatasource from "@shared/hooks/swr/datasources/use-datasource";
import { Provider } from "jotai";
import Link from "next/link";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import DatasourceMap from "./(components)/datasource-map";
import DatasourceTable from "./(components)/datasource-table";
import React from "react";

function Page({ params }: { params: { id: string } }) {
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);
  const { datasource } = useDatasource({ id: params.id });

  return (
    <Provider>
      <Stack flex={"1"} style={{ overflowY: "auto" }}>
        <Breadcrumbs pt={"md"} px={"md"}>
          <Anchor component={Link} href="/data">
            مجموعه‌داده‌ها
          </Anchor>
          <Text>{datasource?.name}</Text>
        </Breadcrumbs>
        <PanelGroup direction={isMobile ? "vertical" : "horizontal"}>
          <Panel>
            <DatasourceTable />
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
    </Provider>
  );
}

export default Page;
