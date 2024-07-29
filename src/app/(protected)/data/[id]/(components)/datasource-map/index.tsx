"use client";

import { Paper, Select, useMantineTheme } from "@mantine/core";
import urls from "@shared/api/urls";
import { GEOMETRY_DATA_TYPES } from "@shared/constants/datasource.constants";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { getUserXApiKey } from "@shared/utils/local-storage";
import { feature, featureCollection } from "@turf/helpers";
import { useEffect, useMemo, useState } from "react";

import Map, { Layer, Source } from "react-map-gl/maplibre";

function DatasourceMap({ id }: { id: string }) {
  const { datasourceColumns } = useDatasourceColumns({ id });

  const { datasourceRows } = useDatasourceRows({
    id,
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

  const theme = useMantineTheme();

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
      {geojsonData && (
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
      )}

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
