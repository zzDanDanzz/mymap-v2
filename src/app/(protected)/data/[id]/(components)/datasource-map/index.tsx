"use client";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  Box,
  Flex,
  Paper,
  Select,
  Switch,
  useMantineTheme,
} from "@mantine/core";
import { useDebouncedValue, useResizeObserver } from "@mantine/hooks";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import urls from "@shared/api/urls";
import { GEOMETRY_DATA_TYPES } from "@shared/constants/datasource.constants";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { getUserXApiKey } from "@shared/utils/local-storage";
import { feature, featureCollection } from "@turf/helpers";
import { bbox as getBbox } from "@turf/turf";
import type { FeatureCollection } from "geojson";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  ControlPosition,
  Layer,
  MapboxMap,
  Source,
  useControl,
  useMap,
} from "react-map-gl";
import getGlDrawStyles from "./(utils)/gl-draw-styles";

type ControlOptions = {
  position?: ControlPosition;
};

function DrawModeWithReactMapGl({
  geojsonData,
  isEditingGeom,
}: {
  geojsonData: FeatureCollection;
  isEditingGeom: boolean;
}) {
  const theme = useMantineTheme();
  const { current: mapRef } = useMap();

  const createDrawControlInstance = useCallback(() => {
    return new MapboxDraw({
      defaultMode: "simple_select",
      displayControlsDefault: false,
      styles: getGlDrawStyles({
        fillColor: theme.colors.orange[4],
        outlineColor: theme.colors.gray[1],
      }),
    });
  }, [theme.colors.gray, theme.colors.orange]);

  const onAddControlToMap = useCallback(() => {
    // props.onCreate && map.on("draw.create", props.onCreate);
    // props.onUpdate && map.on("draw.update", props.onUpdate);
    // props.onDelete && map.on("draw.delete", props.onDelete);
  }, []);

  const onRemoveControlFromMap = useCallback(() => {
    // props.onCreate && map.off("draw.create", props.onCreate);
    // props.onUpdate && map.off("draw.update", props.onUpdate);
    // props.onDelete && map.off("draw.delete", props.onDelete);
  }, []);

  const controlOptions = useMemo(() => {
    return {
      position: "bottom-right",
    } as ControlOptions;
  }, []);

  const draw: MapboxDraw | undefined = useControl<any>(
    createDrawControlInstance,
    onAddControlToMap,
    onRemoveControlFromMap,
    controlOptions,
  );

  // add features to gl-draw if editing geom
  useEffect(() => {
    if (isEditingGeom && geojsonData && draw && mapRef?.hasControl(draw)) {
      draw.add(geojsonData);

      return () => {
        if (draw && mapRef?.hasControl(draw)) {
          draw?.deleteAll();
        }
      };
    }
  }, [draw, geojsonData, isEditingGeom, mapRef]);

  return null;
}

function GeomLayer({
  geojsonData,
  isEditingGeom,
}: {
  geojsonData: FeatureCollection;
  isEditingGeom: boolean;
}) {
  const { current: mapRef } = useMap();
  const theme = useMantineTheme();

  // zoom to bbox of fetched rows of selected geometry column
  useEffect(() => {
    if (geojsonData && mapRef) {
      try {
        const bbox = getBbox(geojsonData) as [number, number, number, number];
        console.log(bbox);
        bbox && mapRef.fitBounds(bbox, { padding: 200 });
      } catch (error) {
        console.error(error);
      }
    }
  }, [geojsonData, mapRef]);

  if (isEditingGeom) {
    return null;
  }

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
        filter={["==", "$type", "LineString"]}
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

  const [isEditingGeom, setIsEditingGeom] = useState(false);

  const theme = useMantineTheme();

  // const drawRef = useRef<MapboxDraw>();

  const mapRef = useRef<MapboxMap>();

  const [mapContainerRef, mapContainerRect] = useResizeObserver();

  const debouncedMapContainerRect = useDebouncedValue(mapContainerRect, 500);

  // resize map on container resize
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.resize();
    }
  }, [debouncedMapContainerRect]);

  return (
    <Box ref={mapContainerRef} h={"100%"}>
      <Map
        initialViewState={{
          longitude: 51.4015,
          latitude: 35.6425,
          zoom: 12,
        }}
        mapStyle={urls.mapStyles["xyz-style"]}
        onLoad={(e) => {
          mapRef.current = e.target;
        }}
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
          <GeomLayer geojsonData={geojsonData} isEditingGeom={isEditingGeom} />
        )}

        {isEditingGeom && geojsonData && (
          <DrawModeWithReactMapGl
            geojsonData={geojsonData}
            isEditingGeom={isEditingGeom}
          />
        )}
        {/* {isEditingGeom && ( */}
        {/*   <DrawControl */}
        {/*     position="bottom-right" */}
        {/*     // displayControlsDefault={false} */}
        {/*     controls={{}} */}
        {/*     // styles={getGlDrawStyles({ */}
        {/*     //   orange: theme.colors.orange[4], */}
        {/*     //   blue: theme.colors.blue[4], */}
        {/*     //   white: theme.colors.gray[1], */}
        {/*     //   sizeMultiplier: 2, */}
        {/*     // })} */}
        {/*     defaultMode="simple_select" */}
        {/*     drawRef={drawRef} */}
        {/**/}
        {/*   /> */}
        {/* )} */}
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
              <Switch
                label="ویرایش"
                checked={isEditingGeom}
                onChange={(e) => setIsEditingGeom(e.currentTarget.checked)}
              />
            </Paper>
          </Flex>
        )}
      </Map>
    </Box>
  );
}

export default DatasourceMap;
