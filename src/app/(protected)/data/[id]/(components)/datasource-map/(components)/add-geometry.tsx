import { addingGeomModeAtom } from "@/data/[id]/(utils)/atoms";
import { Alert, Button, Flex, Group, Paper, Stack } from "@mantine/core";
import { DatasourceRow, GeomColDataType } from "@shared/types/datasource.types";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  combine as createdCombinedFeatureCollection,
  featureCollection as createFeatureCollection,
  geometryCollection as createGeometryCollection,
} from "@turf/turf";
import { Feature, FeatureCollection } from "geojson";
import { useAtom } from "jotai";
import { useCallback, useMemo, useRef } from "react";
import MapboxGlDraw from "./mapbox-gl-draw";
import { updateDatasourceRow } from "@/data/[id]/(utils)/api";
import { ODataResponse } from "@shared/types/api.types";
import { KeyedMutator } from "swr";

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

const generateGeomCellDataFromFC = ({
  columnDataType,
  featureCollection,
}: {
  columnDataType: GeomColDataType;
  featureCollection: FeatureCollection<
    GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon
  >;
}): GeoJSON.Geometry | GeoJSON.GeometryCollection => {
  /**
   * assume column data type is multi(point|line|polygon)
   * and mapbox-gl-draw has returned a feature collection of features of type=point|line|polygon respectively
   * so turf must combine all into a single multi(point|line|polygon) feature respectively
   * which is why we only need the first feature in the feature collection
   */
  if (columnDataType.includes("multi")) {
    const combined = createdCombinedFeatureCollection(featureCollection);
    console.log("🚀 ~ onSubmit ~ combined:", combined);

    return combined.features[0].geometry;
  }

  /**
   * assume column data type is geometrycollection
   * else it's any of the singlar geom types = point|line|polygon|geometry
   * and for the singular geom types, we don't allow more than one feature in the feature collection
   */
  if (columnDataType.includes("collection")) {
    const geometries = featureCollection.features.map(
      (feature) => feature.geometry
    );
    const geometryCollectionFeature = createGeometryCollection(geometries);
    return geometryCollectionFeature.geometry;
  } else {
    return featureCollection.features[0].geometry;
  }
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
              <Button onClick={onSubmit}>ثبت</Button>
              <Button onClick={onCancel} variant="light">
                لغو
              </Button>
            </Stack>
          </Group>
        </Paper>
      </Flex>

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
