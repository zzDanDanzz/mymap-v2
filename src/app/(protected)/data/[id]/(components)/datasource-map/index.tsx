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

  useEffect(() => {
    console.log("geojsonData", geojsonData);
  }, [geojsonData]);

  const theme = useMantineTheme();

  // const deckglLayers = useMemo(() => {
  //   return [
  //     new GeoJsonLayer({
  //       id: "GeoJsonLayer",
  //       data: geojsonData,
  //       getFillColor: () => {
  //         const [r, g, b] = hexRgb(theme.colors[theme.primaryColor][5], {
  //           format: "array",
  //         });
  //         return [r, g, b, 255 * 0.3];
  //       },
  //       getLineColor: () => {
  //         const [r, g, b] = hexRgb(theme.colors[theme.primaryColor][5], {
  //           format: "array",
  //         });
  //         return [r, g, b, 255 * 0.8];
  //       },
  //       getLineWidth: 3,
  //       lineWidthUnits: "pixels",
  //     }),
  //   ];
  // }, [geojsonData, theme.colors, theme.primaryColor]);

  return (
    <Map
      // style={{
      //   position: "relative",
      // }}
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
        <Source data={geojsonData} type="geojson" id="geojson-source">
          <Layer
            source="geojson-source"
            id="geojson-layer"
            type="circle"
            paint={{
              "circle-color": theme.colors[theme.primaryColor][5],
              "circle-radius": 5,
              // "circle-blur": 0.5,
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
