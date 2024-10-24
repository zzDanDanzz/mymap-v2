"use client";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";

import { Box, Flex, Paper, Select } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";
import urls from "@shared/api/urls";
import { GEOMETRY_DATA_TYPES } from "@shared/constants/datasource.constants";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { getUserXApiKey } from "@shared/utils/local-storage";
import { feature, featureCollection } from "@turf/helpers";
import { useSetAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Map from "react-map-gl";
import { selectedRowIdsAtom } from "../../(utils)/atoms";
import EditGeometry from "./(components)/edit-geometry";
import FitMapBoundsToGeojsonData from "./(components)/fit-map-bounds-to-geojson-data";
import ReadOnlyGeometryLayer from "./(components)/read-only-geometry-layer";
import ResizeMapToContainer from "./(components)/resize-map-to-container";

function DatasourceMap({ id }: { id: string }) {
  const { datasourceColumns } = useDatasourceColumns({ id });

  const params = useSearchParams();

  const { datasourceRows, datasourceRowsMutate } = useDatasourceRows({
    id,
    search: params.get("search") ?? "",
  });

  const setSelectedRowIds = useSetAtom(selectedRowIdsAtom);

  const geometryColumns = useMemo(
    () =>
      datasourceColumns?.filter(({ data_type }) =>
        GEOMETRY_DATA_TYPES.includes(data_type)
      ),
    [datasourceColumns]
  );

  const [selectedGeomColumn, setSelectedGeomColumn] = useState<string>();

  // get initial value for selectedGeomColumn
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

  const [isEditingGeom, setIsEditingGeom] = useState(false);

  // clear the selected row IDs when the user is no longer editing the geometry.
  useEffect(() => {
    if (!isEditingGeom) {
      setSelectedRowIds([]);
    }
  }, [isEditingGeom, setSelectedRowIds]);

  const [mapContainerRef, mapContainerRect] = useResizeObserver();

  return (
    <Box ref={mapContainerRef} h={"100%"}>
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
        style={{
          fontFamily: "IRANSansWeb",
        }}
      >
        <ResizeMapToContainer containerObserverRect={mapContainerRect} />

        {geojsonData && <FitMapBoundsToGeojsonData geojsonData={geojsonData} />}

        {geojsonData && !isEditingGeom && (
          <ReadOnlyGeometryLayer geojsonData={geojsonData} />
        )}

        {(geometryColumns ?? []).length > 0 && (
          <Flex
            pos={"absolute"}
            top={10}
            left={10}
            align="flex-start"
            direction={"row-reverse"}
            gap={"md"}
          >
            <Paper p={"sm"} withBorder>
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

            <Paper p={"sm"} withBorder>
              {geojsonData && (
                <EditGeometry
                  datasourceId={id}
                  isEditingGeom={isEditingGeom}
                  setIsEditingGeom={setIsEditingGeom}
                  geojsonData={geojsonData}
                  selectedGeomColumn={selectedGeomColumn}
                  mutateDatasourceRows={datasourceRowsMutate}
                />
              )}
            </Paper>
          </Flex>
        )}
      </Map>
    </Box>
  );
}

export default DatasourceMap;
