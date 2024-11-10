// @ts-ignore No type available
import rewind from "@mapbox/geojson-rewind";

import {
  addingGeomModeAtom,
  editableGeomCellInfoAtom,
  enabledGeomColumnNamesToViewAtom,
} from "@/data/[id]/(utils)/atoms";
import { Paper, Pill, useMantineTheme } from "@mantine/core";
import { DatasourceGeomCellType } from "@shared/types/datasource.types";
import { bbox as getBbox } from "@turf/turf";
import { CustomCellRendererProps } from "ag-grid-react";
import * as d3 from "d3";
import { Geometry } from "geojson";
import { useAtom, useAtomValue } from "jotai";
import { PropsWithChildren, useCallback, useEffect, useRef } from "react";
import { useMap } from "react-map-gl";
import EmptyCellWithAdd from "../empty-cell-with-add";

function SVGPreview({ geom }: { geom: DatasourceGeomCellType }) {
  const theme = useMantineTheme();
  const color = theme.colors[theme.primaryColor][5];
  const svgRef = useRef(null);

  const width = 200;
  const height = 40;

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3
        // .create('svg')
        .select(svgRef.current)
        // .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height);

      const _geoJson = rewind(geom, true);
      const projection = d3
        .geoMercator()
        .fitSize([width, height - 10], _geoJson);
      const path = d3.geoPath().projection(projection);

      const handlePoint = ({ geometry }: { geometry: GeoJSON.Point }) => {
        svg
          .selectAll("circle")
          .data([geometry.coordinates])
          .enter()
          .append("circle")
          .attr("cx", "50%")
          .attr("cy", "50%")
          .attr("r", "4px")
          .attr("fill", color)
          .attr("fill-opacity", "0.1")
          .attr("stroke", color)
          .style("stroke-width", "1.5px");
      };

      const handleLines = ({ geometry }: { geometry: Geometry }) => {
        svg
          .append("path")
          .attr("stroke", color)
          .style("stroke-width", "1px")
          .attr("fill-opacity", "0")
          .datum(geometry)
          .attr("d", path);
      };

      const handleAllElse = ({ geometry }: { geometry: Geometry }) => {
        svg
          .append("path")
          .attr("fill", color)
          .attr("stroke", color)
          .style("stroke-width", "1px")
          .attr("fill-opacity", "0.1")
          .datum(geometry)
          .attr("d", path);
      };

      const handleSvg = ({ geometry }: { geometry: Geometry }) => {
        const isSpecialGeomColPointCase =
          geometry.type === "GeometryCollection" &&
          geometry.geometries.length === 1 &&
          geometry.geometries[0].type === "Point";

        const isSpecialMultiPointCase =
          geometry.type === "MultiPoint" && geometry.coordinates.length === 1;

        const isActuallyJustPoint = geometry.type === "Point";

        if (
          isActuallyJustPoint ||
          isSpecialGeomColPointCase ||
          isSpecialMultiPointCase
        ) {
          handlePoint({
            geometry: geometry as GeoJSON.Point,
          });
        } else if (geometry.type.includes("LineString")) {
          handleLines({
            geometry,
          });
        } else {
          handleAllElse({
            geometry,
          });
        }
      };

      handleSvg({ geometry: _geoJson });
    }
  }, [color, geom]);

  return <svg ref={svgRef} />;
}

function OnClickWrapper({
  children,
  geom,
  columnName,
}: {
  children: React.ReactNode;
  columnName: string;
  geom: Geometry;
}) {
  const { map } = useMap();

  const [enabledGeomColumnNamesToView, setEnabledGeomColumnNamesToView] =
    useAtom(enabledGeomColumnNamesToViewAtom);

  const fitBounds = useCallback(() => {
    if (!map) {
      return;
    }

    try {
      const bbox = getBbox(geom) as [number, number, number, number];
      bbox && map.fitBounds(bbox, { speed: 1.5 });
    } catch (error) {
      console.error(error);
    }
  }, [geom, map]);

  const enableGeomColumnVisibility = useCallback(() => {
    const selectedGeomCellIsAlreadyEnabled =
      enabledGeomColumnNamesToView.includes(columnName);

    if (!selectedGeomCellIsAlreadyEnabled) {
      setEnabledGeomColumnNamesToView((prev) => {
        return [...prev, columnName];
      });
    }
  }, [
    columnName,
    enabledGeomColumnNamesToView,
    setEnabledGeomColumnNamesToView,
  ]);

  return (
    <div
      onClick={() => {
        fitBounds();
        enableGeomColumnVisibility();
      }}
    >
      {children}
    </div>
  );
}

function EmptyCell(props: CustomCellRendererProps) {
  const apiColumnData = props.colDef?.context?.apiColumnData;
  const [addingGeomMode, setAddingGeomMode] = useAtom(addingGeomModeAtom);

  if (addingGeomMode.isEnabled) {
    if (
      addingGeomMode.datasourceColumn?.name === apiColumnData?.name &&
      addingGeomMode.rowId === props.data.id
    )
      return (
        <Pill
          withRemoveButton
          onRemove={() => {
            setAddingGeomMode({
              isEnabled: false,
            });
          }}
        >
          در حال افزودن...
        </Pill>
      );
    else return null;
  }

  return (
    <EmptyCellWithAdd
      onAdd={() => {
        const cellColumnName = props.colDef?.field;
        const rowId = props.data.id;

        if (!cellColumnName) {
          return;
        }

        setAddingGeomMode({
          isEnabled: true,
          datasourceColumn: apiColumnData,
          rowId,
        });
      }}
    />
  );
}

function Border({
  visible,
  children,
}: PropsWithChildren<{ visible: boolean }>) {
  const theme = useMantineTheme();

  return (
    <Paper
      bd={
        visible ? `2px solid ${theme.colors[theme.primaryColor][6]}` : undefined
      }
      bg={"transparent"}
      pos={"absolute"}
      inset={0}
      h={"100%"}
    >
      {children}
    </Paper>
  );
}

function GeomSvgPreview(props: CustomCellRendererProps) {
  const geom = props.value;

  const editableGeomCellInfo = useAtomValue(editableGeomCellInfoAtom);

  if (!geom || typeof geom !== "object") {
    return <EmptyCell {...props} />;
  }

  const selected =
    editableGeomCellInfo?.columnName === props.colDef?.field &&
    editableGeomCellInfo?.rowId === props.data.id;

  return (
    <Border visible={selected}>
      <OnClickWrapper geom={geom} columnName={props.colDef?.field ?? ""}>
        <SVGPreview geom={geom} />
      </OnClickWrapper>
    </Border>
  );
}
export default GeomSvgPreview;
