"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "react-data-grid/lib/styles.css";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { em } from "@mantine/core";

import { useMediaQuery } from "@mantine/hooks";
import DatasourceTable from "../(components)/datasource-table";
import DatasourceMap from "../(components)/datasource-map";

function Page({ params }: { params: { id: string } }) {
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);

  return (
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
        <DatasourceMap />
      </Panel>
    </PanelGroup>
  );
}

export default Page;
