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
import { useCallback, useEffect, useMemo, useState } from "react";
import Map, { MapLayerMouseEvent, MapboxGeoJSONFeature } from "react-map-gl";
import {
  addingGeomModeAtom,
  editableGeomCellInfoAtom,
  enabledGeomColumnNamesToViewAtom,
} from "../../(utils)/atoms";
import AddGeometry from "./(components)/add-geometry";
import EditGeometry from "./(components)/edit-geometry";
import FitMapBoundsToGeojsonData from "./(components)/fit-map-bounds-to-geojson-data";
import LayerVisibilityToggle from "./(components)/layer-visibility-toggle";
import ReadOnlyGeometryLayer from "./(components)/read-only-geometry-layer";
import ResizeMapToContainer from "./(components)/resize-map-to-container";
import { INTERACTIVE_LAYERS } from "./(constants)";
import {
  featureCollectionFromCellData,
  featureCollectionFromGeomColumns,
} from "./(utils)";
import { CellInfo } from "./(utils)/types";

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

  const [enabledGeomColumnNamesToView, setEnabledGeomColumnNamesToView] =
    useAtom(enabledGeomColumnNamesToViewAtom);

  const [editableGeomCellInfo, setEditableGeomCellInfo] = useAtom(
    editableGeomCellInfoAtom
  );

  const viewOnlyGeojson = useMemo(() => {
    if (!datasourceRows) return null;

    return featureCollectionFromGeomColumns({
      datasourceRows,
      geomColumnNames: enabledGeomColumnNamesToView,
      cellToSkip: editableGeomCellInfo,
    });
  }, [datasourceRows, enabledGeomColumnNamesToView, editableGeomCellInfo]);

  const editableGeojson = useMemo(() => {
    if (!editableGeomCellInfo || !datasourceRows) return null;

    const rowWithEditableGeomCellInIt = datasourceRows.filter(
      (r) => r.id === editableGeomCellInfo.rowId
    );

    return featureCollectionFromCellData({
      datasourceRows: rowWithEditableGeomCellInIt,
      cells: [editableGeomCellInfo],
      cellToSkip: null,
    });
  }, [datasourceRows, editableGeomCellInfo]);

  const [mapContainerRef, mapContainerRect] = useResizeObserver();

  const addingGeomMode = useAtomValue(addingGeomModeAtom);

  const onFeatureClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (editableGeomCellInfo || !datasourceColumns) return;

      const feature = e.features?.[0];

      if (!feature?.properties) return;

      const { rowId, columnName } = feature.properties as Omit<
        CellInfo,
        "dataType"
      >;

      const dataType = datasourceColumns.find(
        (c) => c.name === columnName
      )?.data_type;

      if (!dataType) return;

      setEditableGeomCellInfo({
        rowId,
        columnName,
        dataType,
      });
    },
    [datasourceColumns, editableGeomCellInfo, setEditableGeomCellInfo]
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

        <FitMapBoundsToGeojsonData
          geojson={editableGeojson ?? viewOnlyGeojson}
        />

        {viewOnlyGeojson && <ReadOnlyGeometryLayer geojson={viewOnlyGeojson} />}

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
            enabledGeomColmnNamesToView={enabledGeomColumnNamesToView}
            geometryColumns={geometryColumns ?? []}
            setEnabledGeomColmnNamesToView={setEnabledGeomColumnNamesToView}
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
