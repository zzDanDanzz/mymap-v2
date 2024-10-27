// @ts-ignore No type available
import rewind from "@mapbox/geojson-rewind";

import { addingGeomModeAtom } from "@/data/[id]/(utils)/atoms";
import { Pill, useMantineTheme } from "@mantine/core";
import { bbox as getBbox } from "@turf/turf";
import { CustomCellRendererProps } from "ag-grid-react";
import * as d3 from "d3";
import { Geometry } from "geojson";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl";
import EmptyCellWithAdd from "../empty-cell-with-add";

function SVGPreview({ geom }: { geom: Geometry }) {
  const theme = useMantineTheme();
  const color = theme.colors[theme.primaryColor][5];
  const svgRef = useRef(null);

  const width = 200;
  const height = 35;

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3
        // .create('svg')
        .select(svgRef.current)
        // .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height);

      const _geoJson = rewind(geom, true);

      // const color = ['#EA4C89', '#15aee7', '#A9E5BB', '#F7B32B', '#2D1E2F'][
      //   index
      // ];
      //
      // const colors = d3?.scaleQuantize([1, 100], color);
      // (window as any).colors = colors;

      // color = d3.scaleQuantize([1, 10], d3.schemeBlues[9]);

      const projection = d3.geoMercator().fitSize([width, height], _geoJson);
      const path = d3.geoPath().projection(projection);

      if (_geoJson.type.includes("Point")) {
        svg
          .selectAll("circle")
          .data([_geoJson.coordinates])
          .enter()
          .append("circle")
          .attr("cx", "50%")
          .attr("cy", "50%")
          .attr("r", "2px")
          .attr("fill", color)
          .attr("stroke", color);
      } else if (_geoJson.type.includes("LineString")) {
        svg
          .append("path")
          .attr("stroke", color)
          .style("stroke-width", "2px")
          .attr("fill-opacity", "0")
          .datum(_geoJson)
          .attr("d", path);
      } else {
        svg
          .append("path")
          .attr("fill", color)
          .attr("stroke", color)
          .style("stroke-width", "2px")
          .attr("fill-opacity", "0.1")
          .datum(_geoJson)
          .attr("d", path);
      }
    }
  }, [color, geom]);

  return <svg ref={svgRef} />;
}

function FitboundsOnClickWrapper({
  children,
  geom,
}: {
  children: React.ReactNode;
  geom: Geometry;
}) {
  const { map } = useMap();

  return (
    <div
      onClick={() => {
        if (!map) {
          return;
        }

        try {
          const bbox = getBbox(geom) as [number, number, number, number];
          bbox && map.fitBounds(bbox, { speed: 1.5 });
        } catch (error) {
          console.error(error);
        }
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

function GeomSvgPreview(props: CustomCellRendererProps) {
  const geom = props.value;

  if (!geom || typeof geom !== "object") {
    return <EmptyCell {...props} />;
  }

  return (
    <FitboundsOnClickWrapper geom={geom}>
      <SVGPreview geom={geom} />
    </FitboundsOnClickWrapper>
  );
}

export default GeomSvgPreview;
