"use client";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  Alert,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Select,
  Stack,
} from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";
import urls from "@shared/api/urls";
import { GEOMETRY_DATA_TYPES } from "@shared/constants/datasource.constants";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { getUserXApiKey } from "@shared/utils/local-storage";
import { IconInfoCircle } from "@tabler/icons-react";
import { feature, featureCollection } from "@turf/helpers";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Map from "react-map-gl";
import { addingGeomModeAtom, selectedRowIdsAtom } from "../../(utils)/atoms";
import EditGeometry from "./(components)/edit-geometry";
import FitMapBoundsToGeojsonData from "./(components)/fit-map-bounds-to-geojson-data";
import MapboxGlDraw from "./(components)/mapbox-gl-draw";
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
        GEOMETRY_DATA_TYPES.includes(data_type as any)
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

  const addingGeomMode = useAtomValue(addingGeomModeAtom);

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
        id="map"
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

            {geojsonData && !addingGeomMode.isEnabled && (
              <Paper p={"sm"} withBorder>
                <EditGeometry
                  datasourceId={id}
                  isEditingGeom={isEditingGeom}
                  setIsEditingGeom={setIsEditingGeom}
                  geojsonData={geojsonData}
                  selectedGeomColumn={selectedGeomColumn}
                  mutateDatasourceRows={datasourceRowsMutate}
                />
              </Paper>
            )}
          </Flex>
        )}

        {addingGeomMode.isEnabled && <AddGeometry />}
      </Map>
    </Box>
  );
}

type GeomDataTypeType = (typeof GEOMETRY_DATA_TYPES)[number];

const getControls = (dataType: (typeof GEOMETRY_DATA_TYPES)[number]) => {
  const pointControls = { point: true };
  const lineControls = { line_string: true };
  const polygonControls = { polygon: true };
  const allControls = { ...pointControls, ...lineControls, ...polygonControls };

  const map: Record<GeomDataTypeType, MapboxDraw.MapboxDrawControls> = {
    point: pointControls,
    multipoint: pointControls,
    linestring: lineControls,
    multilinestring: lineControls,
    polygon: polygonControls,
    multipolygon: polygonControls,
    geometry: allControls,
    geometrycollection: allControls,
  };
  return map[dataType];
};

function AddGeometry() {
  const [addingGeomMode, setAddingGeomMode] = useAtom(addingGeomModeAtom);
  const onCancel = useCallback(() => {
    setAddingGeomMode({ isEnabled: false });
  }, [setAddingGeomMode]);

  return (
    <>
      <Flex pos={"absolute"} bottom={10} left={10} w={"calc(100% - 20px)"}>
        <Paper p={"sm"} withBorder>
          <Group wrap="nowrap">
            <Alert title="افزودن ژئومتری" icon={<IconInfoCircle />}>
              {"شما در حال افزودن ژئومتری در ردیفی با آیدی " +
                addingGeomMode.rowId +
                " در ستون " +
                addingGeomMode.datasourceColumn?.name +
                " هستید"}
            </Alert>
            <Stack>
              <Button>ثبت</Button>
              <Button onClick={onCancel} variant="light">
                لغو
              </Button>
            </Stack>
          </Group>
        </Paper>
      </Flex>

      <MapboxGlDraw
        controls={getControls(
          (addingGeomMode.datasourceColumn?.data_type ??
            "geometry") as GeomDataTypeType
        )}
        position="top-right"
      />
    </>
  );
}
export default DatasourceMap;
