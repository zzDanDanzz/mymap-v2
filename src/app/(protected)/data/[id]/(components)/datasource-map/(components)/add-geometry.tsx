import { updateDatasourceRow } from "@/data/[id]/(utils)/api";
import { addingGeomModeAtom } from "@/data/[id]/(utils)/atoms";
import { ODataResponse } from "@shared/types/api.types";
import { DatasourceRow, GeomColDataType } from "@shared/types/datasource.types";
import { featureCollection as createFeatureCollection } from "@turf/turf";
import { Feature } from "geojson";
import { useAtom } from "jotai";
import { useCallback, useMemo, useRef } from "react";
import { KeyedMutator } from "swr";
import GeometryActionAlert from "./geometry-action-alert";
import MapboxGlDraw from "./mapbox-gl-draw";
import { generateGeomCellDataFromFC } from "../(utils)/gl-draw";

const getControls = (dataType: GeomColDataType) => {
  const pointControls = { point: true };
  const lineControls = { line_string: true };
  const polygonControls = { polygon: true };
  const allControls = { ...pointControls, ...lineControls, ...polygonControls };

  const map: Record<GeomColDataType, MapboxDraw.MapboxDrawControls> = {
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

const getFeatureCollectionFromGlDraw = (glDraw: MapboxDraw) => {
  const feats = (glDraw.getAll?.()?.features ?? []) as Feature<
    GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon
  >[];
  const featCol = createFeatureCollection(feats);
  return featCol;
};

function AddGeometry({
  datasourceId,
  mutateDatasourceRows,
}: {
  datasourceId: string;
  mutateDatasourceRows: KeyedMutator<ODataResponse<DatasourceRow>>;
}) {
  const [addingGeomMode, setAddingGeomMode] = useAtom(addingGeomModeAtom);

  const glDrawRef = useRef<MapboxDraw>();

  const columnDataType = useMemo(() => {
    const FALLBACK = "geometry";
    return (
      addingGeomMode.datasourceColumn?.data_type ?? FALLBACK
    ).toLowerCase() as GeomColDataType;
  }, [addingGeomMode.datasourceColumn?.data_type]);

  const isMulti = useMemo(() => {
    return (
      columnDataType.includes("multi") || columnDataType.includes("collection")
    );
  }, [columnDataType]);

  const onCancel = useCallback(() => {
    setAddingGeomMode({ isEnabled: false });
  }, [setAddingGeomMode]);

  const onCreate = useCallback(
    (e: MapboxDraw.DrawCreateEvent) => {
      const lastAddedFeature = e.features[e.features.length - 1];

      if (!isMulti) {
        const features = glDrawRef.current?.getAll().features ?? [];
        if (features.length > 1) {
          // delete all features except the most recently addded one
          features.forEach((feature) => {
            if (feature.id !== lastAddedFeature.id) {
              glDrawRef.current?.delete(
                (feature as GeoJSON.Feature & { id: string }).id
              );
            }
          });
        }
      }
    },
    [isMulti]
  );

  const onSubmit = useCallback(async () => {
    const cellColumnName = addingGeomMode.datasourceColumn?.name;
    const rowId = addingGeomMode.rowId;

    if (!cellColumnName || !rowId || !glDrawRef.current) {
      return;
    }

    const featureCollection = getFeatureCollectionFromGlDraw(glDrawRef.current);

    const cellData = generateGeomCellDataFromFC({
      columnDataType,
      featureCollection,
    });

    await updateDatasourceRow({
      datasourceId,
      cellColumnName,
      rowId,
      updatedCellData: cellData,
    });

    await mutateDatasourceRows();

    setAddingGeomMode({ isEnabled: false });
  }, [
    addingGeomMode.datasourceColumn?.name,
    addingGeomMode.rowId,
    columnDataType,
    datasourceId,
    mutateDatasourceRows,
    setAddingGeomMode,
  ]);

  const { rowId, datasourceColumn } = addingGeomMode;
  return (
    <>
      {rowId && datasourceColumn && (
        <GeometryActionAlert
          onCancel={onCancel}
          onSubmit={onSubmit}
          action="add"
          rowId={rowId}
          columnName={datasourceColumn.name}
        />
      )}
      <MapboxGlDraw
        controls={getControls(columnDataType)}
        onCreate={onCreate}
        position="top-right"
        ref={glDrawRef}
      />
    </>
  );
}

export default AddGeometry;
