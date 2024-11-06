import { updateDatasourceRow } from "@/data/[id]/(utils)/api";
import { ODataResponse } from "@shared/types/api.types";
import { DatasourceRow } from "@shared/types/datasource.types";
import { FeatureCollection } from "geojson";
import { useCallback, useEffect, useRef, useState } from "react";
import { KeyedMutator } from "swr";
import { EditableGeomCellInfo, GeomEdit } from "../(utils)/types";
import GeometryActionAlert from "./geometry-action-alert";
import MapboxGlDraw from "./mapbox-gl-draw";

enum EditGeometryOperation {
  UPDATE = "update",
  DELETE = "delete",
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

  const glDrawRef = useRef<MapboxDraw>(null);

  const onSubmitDrawChanges = useCallback(async () => {
    setIsLoading(true);

    const updatedFeatures = glDrawRef.current?.getAll?.();

    if (!updatedFeatures) {
      return;
    }

    await updateDatasourceRow({
      rowId: editableGeomCellInfo.rowId,
      datasourceId,
      cellColumnName: editableGeomCellInfo.columnName,
      updatedCellData,
    });

    // const requests = getRequestsForGeomEdits(
    //   geomEdits,
    //   datasourceId,
    //   editableGeomCellInfo.columnName
    // );

    // const results = await Promise.allSettled(requests);

    // await mutateDatasourceRows();

    // const failedCount = results.filter(
    //   (result) => result.status === "rejected"
    // ).length;
    // const totalCount = results.length;

    // if (failedCount > 0) {
    //   notify.error(
    //     `متاسفانه ${failedCount} از ${totalCount} تغییرات شما ثبت نشد.`
    //   );
    // } else {
    //   notify.success("تغییرات با موفقیت ثبت شد.");
    // }

    setEditableGeomCellInfo(null);
    setIsLoading(false);
  }, [
    datasourceId,
    editableGeomCellInfo.columnName,
    editableGeomCellInfo.rowId,
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
          position="top-right"
          ref={glDrawRef}
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
