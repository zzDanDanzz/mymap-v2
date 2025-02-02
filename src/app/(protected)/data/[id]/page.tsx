"use client";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
import "./grid-style-overrides.css";

import { Anchor, Breadcrumbs, Stack, Text, em } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import useDatasource from "@shared/hooks/swr/datasources/use-datasource";
import { Provider as JotaiProvider } from "jotai";
import Link from "next/link";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import DatasourceMap from "./(components)/datasource-map";
import DatasourceTable from "./(components)/datasource-table";
import { MapProvider } from "react-map-gl";

function Page({ params }: { params: { id: string } }) {
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);
  const { datasource } = useDatasource({ id: params.id });

  return (
    <JotaiProvider>
      <MapProvider>
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
      </MapProvider>
    </JotaiProvider>
  );
}

export default Page;
