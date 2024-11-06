"use client";

import { Box } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";
import urls from "@shared/api/urls";
import { GEOMETRY_DATA_TYPES } from "@shared/constants/datasource.constants";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { getUserXApiKey } from "@shared/utils/local-storage";
import { useAtom, useAtomValue } from "jotai";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import Map, { MapLayerMouseEvent, MapboxGeoJSONFeature } from "react-map-gl";
import {
  addingGeomModeAtom,
  editableGeomCellInfoAtom,
} from "../../(utils)/atoms";
import AddGeometry from "./(components)/add-geometry";
import EditGeometry from "./(components)/edit-geometry";
import FitMapBoundsToGeojsonData from "./(components)/fit-map-bounds-to-geojson-data";
import LayerVisibilityToggle from "./(components)/layer-visibility-toggle";
import ReadOnlyGeometryLayer from "./(components)/read-only-geometry-layer";
import ResizeMapToContainer from "./(components)/resize-map-to-container";
import { INTERACTIVE_LAYERS } from "./(constants)";
import { featureCollectionFromCellData } from "./(utils)";
import {
  EditableGeomCellInfo,
  MapLayerFeatureProperties,
} from "./(utils)/types";

function DatasourceMap({ id }: { id: string }) {
  const { datasourceColumns } = useDatasourceColumns({ id });

  const params = useSearchParams();

  const { datasourceRows, datasourceRowsMutate } = useDatasourceRows({
    id,
    search: params.get("search") ?? "",
  });

  const geometryColumns = useMemo(
    () =>
      datasourceColumns?.filter(({ data_type }) =>
        GEOMETRY_DATA_TYPES.includes(data_type as any)
      ),
    [datasourceColumns]
  );

  const [enabledGeomColmnNamesToView, setEnabledGeomColmnNamesToView] =
    useState<string[]>([]);

  const [editableGeomCellInfo, setEditableGeomCellInfo] =
    useAtom<EditableGeomCellInfo | null>(editableGeomCellInfoAtom);

  const geojson = useMemo(() => {
    return featureCollectionFromCellData({
      datasourceRows: datasourceRows ?? [],
      geometryColumnNames: enabledGeomColmnNamesToView,
      cellToSkip: editableGeomCellInfo,
    });
  }, [enabledGeomColmnNamesToView, datasourceRows, editableGeomCellInfo]);

  const editableGeojson = useMemo(() => {
    return featureCollectionFromCellData({
      datasourceRows:
        datasourceRows?.filter((r) => r.id === editableGeomCellInfo?.rowId) ??
        [],
      geometryColumnNames: [editableGeomCellInfo?.columnName ?? ""],
      cellToSkip: null,
    });
  }, [datasourceRows, editableGeomCellInfo]);

  const [mapContainerRef, mapContainerRect] = useResizeObserver();

  const addingGeomMode = useAtomValue(addingGeomModeAtom);

  const onFeatureClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (editableGeomCellInfo) return;

      const feature = e.features?.[0] as
        | (MapboxGeoJSONFeature & {
            properties: MapLayerFeatureProperties;
          })
        | undefined;

      const { id: rowId, columnName } = feature?.properties || {};

      if (!rowId || !columnName) return;

      setEditableGeomCellInfo({
        rowId,
        columnName,
      });
    },
    [editableGeomCellInfo, setEditableGeomCellInfo]
  );

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
        interactiveLayerIds={[
          INTERACTIVE_LAYERS.CIRCLES,
          INTERACTIVE_LAYERS.FILLS,
          INTERACTIVE_LAYERS.LINES,
        ]}
        onClick={onFeatureClick}
      >
        <ResizeMapToContainer containerObserverRect={mapContainerRect} />

        {geojson && <FitMapBoundsToGeojsonData geojson={geojson} />}

        {geojson && <ReadOnlyGeometryLayer geojson={geojson} />}

        {editableGeomCellInfo && editableGeojson && (
          <EditGeometry
            geojson={editableGeojson}
            datasourceId={id}
            mutateDatasourceRows={datasourceRowsMutate}
            editableGeomCellInfo={editableGeomCellInfo}
            setEditableGeomCellInfo={setEditableGeomCellInfo}
          />
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
