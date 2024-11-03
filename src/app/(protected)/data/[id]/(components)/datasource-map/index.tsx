"use client";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  Box,
  Checkbox,
  Flex,
  Paper,
  Stack,
  Tooltip,
  Text,
} from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";
import urls from "@shared/api/urls";
import { GEOMETRY_DATA_TYPES } from "@shared/constants/datasource.constants";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { DatasourceGeomCellType } from "@shared/types/datasource.types";
import { getUserXApiKey } from "@shared/utils/local-storage";
import { feature, featureCollection } from "@turf/helpers";
import GeoJSON, { GeometryCollection } from "geojson";
import { useAtomValue, useSetAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Map from "react-map-gl";
import { addingGeomModeAtom, selectedRowIdsAtom } from "../../(utils)/atoms";
import AddGeometry from "./(components)/add-geometry";
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
        GEOMETRY_DATA_TYPES.includes(data_type as any)
      ),
    [datasourceColumns]
  );

  const [activatedGeomColumnNames, setActivatedGeomColumnNames] = useState<
    string[]
  >([]);

  const geojsonData = useMemo(() => {
    if (activatedGeomColumnNames.length === 0 || !datasourceRows) {
      return null;
    }

    const geoms = datasourceRows
      .map((row) => {
        const geoms: GeoJSON.Feature[] = [];

        activatedGeomColumnNames.forEach((geomColId) => {
          const g = row[geomColId] as DatasourceGeomCellType | undefined;

          if (!g) return;

          if (g.type === "GeometryCollection") {
            (g as GeometryCollection).geometries.forEach((g) =>
              geoms.push(feature(g, { id: row.id }))
            );
          } else {
            geoms.push(
              feature(
                g as Exclude<DatasourceGeomCellType, GeometryCollection>,
                {
                  id: row.id,
                }
              )
            );
          }
        });

        return geoms;
      })
      .flat();
    return featureCollection(geoms.flat());
  }, [activatedGeomColumnNames, datasourceRows]);

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
            top={"10px"}
            left={"10px"}
            w={"calc(100% - 20px)"}
            align="flex-start"
            direction={"row-reverse"}
            gap={"md"}
          >
            <Paper p={"sm"} withBorder w={"256px"} maw={"100%"} mah={"60%"}>
              <Checkbox.Group
                label="نمایش ستون(های) ژئومتری"
                value={activatedGeomColumnNames}
                onChange={setActivatedGeomColumnNames}
              >
                <Stack gap={"xs"} mt={"md"}>
                  {geometryColumns?.map(({ name }) => (
                    <Tooltip
                      label={name}
                      key={name}
                      refProp="rootRef"
                      position="top-start"
                    >
                      <Checkbox
                        styles={{
                          labelWrapper: {
                            maxWidth: "100%",
                          },
                        }}
                        value={name}
                        label={
                          <Text truncate maw={"100%"} size="xs">
                            {name}
                          </Text>
                        }
                      />
                    </Tooltip>
                  ))}
                </Stack>
              </Checkbox.Group>
            </Paper>
          </Flex>
        )}

        {addingGeomMode.isEnabled && (
          <AddGeometry
            datasourceId={id}
            mutateDatasourceRows={datasourceRowsMutate}
          />
        )}
      </Map>
    </Box>
  );
}

export default DatasourceMap;
