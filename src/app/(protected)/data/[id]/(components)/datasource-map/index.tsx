"use client";

import { Paper, Select, useMantineTheme } from "@mantine/core";
import urls from "@shared/api/urls";
import { GEOMETRY_DATA_TYPES } from "@shared/constants/datasource.constants";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { getUserXApiKey } from "@shared/utils/local-storage";
import { feature, featureCollection } from "@turf/helpers";
import { bbox as getBbox } from "@turf/turf";
import type { FeatureCollection } from "geojson";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Map, { Layer, Source, useMap } from "react-map-gl/maplibre";

function SourcesAndLayers({ geojsonData }: { geojsonData: FeatureCollection }) {
  const { current: map } = useMap();
  const theme = useMantineTheme();

  // zoom to bbox of fetched rows of selected geometry column
  useEffect(() => {
    if (geojsonData && map) {
      const bbox = getBbox(geojsonData) as [number, number, number, number];
      bbox && map.fitBounds(bbox, { padding: 200 });
    }
  }, [geojsonData, map]);

  return (
    <Source data={geojsonData} type="geojson">
      <Layer
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
        type="fill"
        paint={{
          "fill-color": theme.colors[theme.primaryColor][4],
          "fill-outline-color": theme.colors[theme.primaryColor][7],
          "fill-opacity": 0.75,
        }}
        filter={["==", "$type", "Polygon"]}
      />
      <Layer
        type="line"
        paint={{
          "line-color": theme.colors[theme.primaryColor][7],
          "line-width": 3,
          "line-opacity": 0.75,
        }}
      />
    </Source>
  );
}

function DatasourceMap({ id }: { id: string }) {
  const { datasourceColumns } = useDatasourceColumns({ id });

  const params = useSearchParams();

  const { datasourceRows } = useDatasourceRows({
    id,
    search: params.get("search") ?? "",
  });

  const geometryColumns = datasourceColumns?.filter(({ data_type }) =>
    GEOMETRY_DATA_TYPES.includes(data_type),
  );

  const [selectedGeomColumn, setSelectedGeomColumn] = useState<string>();

  useEffect(() => {
    if (!selectedGeomColumn && geometryColumns?.[0]?.name) {
      setSelectedGeomColumn(geometryColumns[0].name);
    }
  }, [geometryColumns, selectedGeomColumn]);

  const geojsonData = useMemo(() => {
    if (!selectedGeomColumn || !datasourceRows) {
      return null;
    }

    const geoms = datasourceRows
      .map((row) => {
        const geom = row[selectedGeomColumn];
        if (geom?.type) {
          return feature(geom, { id: row.id });
        }
      })
      .filter(Boolean) as GeoJSON.Feature<any, GeoJSON.GeoJsonProperties>[];

    return featureCollection(geoms);
  }, [datasourceRows, selectedGeomColumn]);

  return (
    <Map
      initialViewState={{
        longitude: 51.4015,
        latitude: 35.6425,
        zoom: 12,
      }}
      mapStyle={urls.mapStyles["xyz-style"]}
      transformRequest={(url) => {
        return {
          url,
          headers: {
            "x-api-key": getUserXApiKey(),
          },
        };
      }}
    >
      {geojsonData && <SourcesAndLayers geojsonData={geojsonData} />}

      {(geometryColumns ?? []).length > 0 && (
        <Paper pos={"absolute"} top={10} left={10} p={"sm"} withBorder>
          <Select
            size="xs"
            label="نمایش ستون ژئومتری"
            defaultValue={geometryColumns?.[0].name}
            data={geometryColumns?.map(({ name }) => ({
              value: name,
              label: name,
            }))}
          />
        </Paper>
      )}
    </Map>
  );
}

export default DatasourceMap;
