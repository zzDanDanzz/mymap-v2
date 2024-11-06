import { useMantineTheme } from "@mantine/core";
import type { FeatureCollection } from "geojson";
import { Layer, Source } from "react-map-gl";
import { INTERACTIVE_LAYERS } from "../(constants)";

function ReadOnlyGeometryLayer({ geojson }: { geojson: FeatureCollection }) {
  const theme = useMantineTheme();

  return (
    <Source data={geojson} type="geojson">
      <Layer
        id={INTERACTIVE_LAYERS.CIRCLES}
        type="circle"
        paint={{
          "circle-color": theme.colors[theme.primaryColor][4],
          "circle-stroke-color": theme.colors[theme.primaryColor][7],
          "circle-stroke-width": 2,
          "circle-opacity": 0.75,
        }}
        filter={["==", "$type", "Point"]}
      />
      <Layer
        id={INTERACTIVE_LAYERS.FILLS}
        type="fill"
        paint={{
          "fill-color": theme.colors[theme.primaryColor][4],
          "fill-outline-color": theme.colors[theme.primaryColor][7],
          "fill-opacity": 0.75,
        }}
        filter={["==", "$type", "Polygon"]}
      />
      <Layer
        id={INTERACTIVE_LAYERS.LINES}
        type="line"
        paint={{
          "line-color": theme.colors[theme.primaryColor][7],
          "line-width": 3,
          "line-opacity": 0.75,
        }}
        filter={["==", "$type", "LineString"]}
      />
    </Source>
  );
}
export default ReadOnlyGeometryLayer;
