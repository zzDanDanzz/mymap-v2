import { updateDatasourceRow } from "@/data/[id]/(utils)/api";
import { Button, Group } from "@mantine/core";
import { DrawDeleteEvent, DrawUpdateEvent } from "@mapbox/mapbox-gl-draw";
import { ODataResponse } from "@shared/types/api.types";
import { DatasourceRow } from "@shared/types/datasource.types";
import notify from "@shared/utils/toasts";
import { Feature, FeatureCollection } from "geojson";
import { useCallback, useEffect, useState } from "react";
import { KeyedMutator } from "swr";
import { EditableGeomCellInfo, GeomEdit } from "../(utils)/types";
import MapboxGlDraw from "./mapbox-gl-draw";
import GeometryActionAlert from "./geometry-action-alert";

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
  editableGeomCellInfo,
  setEditableGeomCellInfo,
  geojson,
  datasourceId,
  mutateDatasourceRows,
}: {
  editableGeomCellInfo: EditableGeomCellInfo;
  setEditableGeomCellInfo: React.Dispatch<
    React.SetStateAction<EditableGeomCellInfo | null>
  >;
  geojson: FeatureCollection;
  datasourceId: string;
  mutateDatasourceRows: KeyedMutator<ODataResponse<DatasourceRow>>;
}) {
  const [geomEdits, setGeomEdits] = useState<GeomEdit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // reset geom edits when edit mode is turned off
  useEffect(() => {
    if (!editableGeomCellInfo) {
      setGeomEdits([]);
    }
  }, [editableGeomCellInfo]);

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

  const onDeleteFeatures = useCallback((e: DrawDeleteEvent) => {
    const features = e.features;

    const deleted = prepareFeaturesForGeomEdit(
      EditGeometryOperation.DELETE,
      features
    );
    // remove deleted features from selected row ids
    // setSelectedRowIdsAtom((prev) => {
    //   const deletedIds = deleted.map((d) => d.id);
    //   return prev.filter((id) => !deletedIds.includes(id));
    // });

    setGeomEdits((prev) => [...prev, ...deleted]);
  }, []);

  const onSelectFeatures = useCallback((e: DrawUpdateEvent) => {
    // const Ids = e.features
    //   .map((f) => f.properties?.id)
    //   .filter(Boolean) as string[];
    // setSelectedRowIdsAtom(Ids);
  }, []);

  const onSubmitDrawChanges = useCallback(async () => {
    setIsLoading(true);

    const requests = getRequestsForGeomEdits(
      geomEdits,
      datasourceId,
      editableGeomCellInfo.columnName
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

    setEditableGeomCellInfo(null);
    setIsLoading(false);
  }, [
    datasourceId,
    editableGeomCellInfo.columnName,
    geomEdits,
    mutateDatasourceRows,
    setEditableGeomCellInfo,
  ]);

  return (
    <>
      {editableGeomCellInfo && geojson && (
        <MapboxGlDraw
          controls={{
            trash: true,
          }}
          geojsonData={geojson}
          onUpdate={onUpdateFeatures}
          onDelete={onDeleteFeatures}
          onSelect={onSelectFeatures}
          position="top-right"
        />
      )}

      {editableGeomCellInfo.rowId && editableGeomCellInfo.columnName && (
        <GeometryActionAlert
          onCancel={() => setEditableGeomCellInfo(null)}
          onSubmit={onSubmitDrawChanges}
          action="edit"
          rowId={editableGeomCellInfo.rowId}
          columnName={editableGeomCellInfo.columnName}
        />
      )}
    </>
  );
}

export default EditGeometry;
