import { updateDatasourceRow } from "@/data/[id]/(utils)/api";
import { selectedRowIdsAtom } from "@/data/[id]/(utils)/atoms";
import { Button, Group } from "@mantine/core";
import { DrawDeleteEvent, DrawUpdateEvent } from "@mapbox/mapbox-gl-draw";
import { ODataResponse } from "@shared/types/api.types";
import { DatasourceRow } from "@shared/types/datasource.types";
import notify from "@shared/utils/toasts";
import { Feature, FeatureCollection } from "geojson";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KeyedMutator } from "swr";
import { GeomEdit } from "../(utils)/types";
import MapboxGlDraw from "./mapbox-gl-draw";

enum EditGeometryOperation {
  UPDATE = "update",
  DELETE = "delete",
}

function prepareFeaturesForGeomEdit(
  operation: EditGeometryOperation,
  features: Feature[]
) {
  switch (operation) {
    case "delete":
      return features
        .map((f) => {
          const id = f.properties?.id;
          if (!id) return;

          return {
            id,
            type: "delete",
          };
        })
        .filter(Boolean) as GeomEdit[];
    case "update":
      return features
        .map((f) => {
          const id = f.properties?.id;
          if (!id) return;

          return {
            id,
            type: "modify",
            modifiedFeature: f,
          };
        })
        .filter(Boolean) as GeomEdit[];
    default:
      throw new Error("Invalid operation");
  }
}

function getRequestsForGeomEdits(
  geomEdits: GeomEdit[],
  datasourceId: string,
  selectedGeomColumn: string
) {
  const sharedOptions = {
    datasourceId,
    cellColumnName: selectedGeomColumn,
  };

  const deletionOperations = geomEdits
    .filter(({ type }) => type === "delete")
    .map((edit) => {
      return updateDatasourceRow({
        ...sharedOptions,
        rowId: edit.id,
        updatedCellData: null,
      });
    });

  const __deletedIds = geomEdits
    .filter(({ type }) => type === "delete")
    .map(({ id }) => id);

  const updateOperations = geomEdits
    .filter(({ type }) => type === "modify")
    // remove update operations for features that have been deleted
    .filter((edit) => !__deletedIds.includes(edit.id))
    .map((edit) => {
      return updateDatasourceRow({
        ...sharedOptions,
        rowId: edit.id,
        updatedCellData: edit.modifiedFeature.geometry,
      });
    });

  return [...deletionOperations, ...updateOperations];
}

function EditGeometry({
  isEditingGeom,
  setIsEditingGeom,
  geojsonData,
  datasourceId,
  selectedGeomColumn,
  mutateDatasourceRows,
}: {
  isEditingGeom: boolean;
  setIsEditingGeom: React.Dispatch<React.SetStateAction<boolean>>;
  geojsonData: FeatureCollection;
  datasourceId: string;
  selectedGeomColumn: string | undefined;
  mutateDatasourceRows: KeyedMutator<ODataResponse<DatasourceRow>>;
}) {
  const [geomEdits, setGeomEdits] = useState<GeomEdit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const setSelectedRowIdsAtom = useSetAtom(selectedRowIdsAtom);

  // reset geom edits when edit mode is turned off
  useEffect(() => {
    if (!isEditingGeom) {
      setGeomEdits([]);
    }
  }, [isEditingGeom]);

  // reset geom edits when the component unmounts
  useEffect(() => {
    return () => {
      setGeomEdits([]);
    };
  }, []);

  const onUpdateFeatures = useCallback((e: DrawUpdateEvent) => {
    const features = e.features;

    const updated = prepareFeaturesForGeomEdit(
      EditGeometryOperation.UPDATE,
      features
    );

    setGeomEdits((prev) => [...prev, ...updated]);
  }, []);

  const onDeleteFeatures = useCallback(
    (e: DrawDeleteEvent) => {
      const features = e.features;

      const deleted = prepareFeaturesForGeomEdit(
        EditGeometryOperation.DELETE,
        features
      );
      // remove deleted features from selected row ids
      setSelectedRowIdsAtom((prev) => {
        const deletedIds = deleted.map((d) => d.id);
        return prev.filter((id) => !deletedIds.includes(id));
      });

      setGeomEdits((prev) => [...prev, ...deleted]);
    },
    [setSelectedRowIdsAtom]
  );

  const onSelectFeatures = useCallback(
    (e: DrawUpdateEvent) => {
      const Ids = e.features
        .map((f) => f.properties?.id)
        .filter(Boolean) as string[];
      setSelectedRowIdsAtom(Ids);
    },
    [setSelectedRowIdsAtom]
  );

  const onSubmitDrawChanges = useCallback(async () => {
    if (!selectedGeomColumn) return;

    setIsLoading(true);

    const requests = getRequestsForGeomEdits(
      geomEdits,
      datasourceId,
      selectedGeomColumn
    );

    const results = await Promise.allSettled(requests);

    await mutateDatasourceRows();

    const failedCount = results.filter(
      (result) => result.status === "rejected"
    ).length;
    const totalCount = results.length;

    if (failedCount > 0) {
      notify.error(
        `متاسفانه ${failedCount} از ${totalCount} تغییرات شما ثبت نشد.`
      );
    } else {
      notify.success("تغییرات با موفقیت ثبت شد.");
    }

    setIsEditingGeom(false);
    setIsLoading(false);
  }, [
    datasourceId,
    geomEdits,
    mutateDatasourceRows,
    selectedGeomColumn,
    setIsEditingGeom,
  ]);

  return (
    <>
      {isEditingGeom && geojsonData && (
        <MapboxGlDraw
          controls={{
            trash: true,
          }}
          geojsonData={geojsonData}
          onUpdate={onUpdateFeatures}
          onDelete={onDeleteFeatures}
          onSelect={onSelectFeatures}
          position="bottom-right"
        />
      )}

      {!isEditingGeom && (
        <Button onClick={() => setIsEditingGeom(true)}>ویرایش</Button>
      )}

      {isEditingGeom && (
        <Group>
          <Button onClick={() => setIsEditingGeom(false)} variant="light">
            لغو
          </Button>
          <Button
            disabled={geomEdits.length === 0}
            onClick={onSubmitDrawChanges}
            loading={isLoading}
          >
            ثبت تغییرات
          </Button>
        </Group>
      )}
    </>
  );
}

export default EditGeometry;