"use client";

import { Paper, Select, useMantineTheme } from "@mantine/core";
import urls from "@shared/api/urls";
import { GEOMETRY_DATA_TYPES } from "@shared/constants/datasource.constants";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { getUserXApiKey } from "@shared/utils/local-storage";
import { feature, featureCollection } from "@turf/helpers";
import { useEffect, useMemo, useState } from "react";
import { Layer, Source } from "react-map-gl/maplibre";
import Map from "react-map-gl/maplibre";

function DatasourceMap({ id }: { id: string }) {
  const { datasourceColumns, datasourceColumnsIsLoading } =
    useDatasourceColumns({ id });

  const { datasourceRows, datasourceRowsIsLoading } = useDatasourceRows({
    id,
  });

  const geometryColumns = datasourceColumns?.filter(({ data_type }) =>
    GEOMETRY_DATA_TYPES.includes(data_type)
  );

  const [selectedGeomColumn, setSelectedGeomColumn] = useState<string>();

  useEffect(() => {
    if (!selectedGeomColumn && geometryColumns?.[0]?.name) {
      setSelectedGeomColumn(geometryColumns[0].name);
    }
  }, [geometryColumns, selectedGeomColumn]);

  const geojsonData = useMemo(() => {
    if (!selectedGeomColumn || !datasourceRows) {
      return [];
    }

    const geoms = datasourceRows
      .map((row) => {
        const geom = row[selectedGeomColumn];
        if (geom?.type) {
          return feature(geom);
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
        <Source type="geojson" data={geojsonData}>
          {/* <Layer
            type="fill"
            paint={{
              "fill-color": theme.primaryColor,
              "fill-opacity": 0.5,
            }}
            filter={["==", "$type", "Polygon"]}
          /> */}
          <Layer
            type="line"
            paint={{
              "line-color": theme.primaryColor,
              // "line-opacity": 0.9,
              "line-width": 2,
            }}
            filter={["==", "$type", "Polygon"]}
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
