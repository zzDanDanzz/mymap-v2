"use client";

import { Box } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";
import urls from "@shared/api/urls";
import { GEOMETRY_DATA_TYPES } from "@shared/constants/datasource.constants";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { getUserXApiKey } from "@shared/utils/local-storage";
import { useAtomValue, useSetAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Map from "react-map-gl";
import { addingGeomModeAtom, selectedRowIdsAtom } from "../../(utils)/atoms";
import AddGeometry from "./(components)/add-geometry";
import FitMapBoundsToGeojsonData from "./(components)/fit-map-bounds-to-geojson-data";
import ReadOnlyGeometryLayer from "./(components)/read-only-geometry-layer";
import ResizeMapToContainer from "./(components)/resize-map-to-container";
import { featureCollectionFromCellData } from "./(utils)";
import LayerVisibilityToggle from "./(components)/layer-visibility-toggle";

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

  const [enabledGeomColmnNamesToView, setEnabledGeomColmnNamesToView] =
    useState<string[]>([]);

  const geojson = useMemo(() => {
    if (enabledGeomColmnNamesToView.length === 0 || !datasourceRows) {
      return null;
    }
    return featureCollectionFromCellData({
      datasourceRows,
      enabledGeomColmnNamesToView,
    });
  }, [enabledGeomColmnNamesToView, datasourceRows]);

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

        {geojson && <FitMapBoundsToGeojsonData geojson={geojson} />}

        {geojson && !isEditingGeom && (
          <ReadOnlyGeometryLayer geojson={geojson} />
        )}

        {(geometryColumns ?? []).length > 0 && (
          <LayerVisibilityToggle
            enabledGeomColmnNamesToView={enabledGeomColmnNamesToView}
            geometryColumns={geometryColumns ?? []}
            setEnabledGeomColmnNamesToView={setEnabledGeomColmnNamesToView}
          />
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
