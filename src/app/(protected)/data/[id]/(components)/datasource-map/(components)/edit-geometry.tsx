import { updateDatasourceRow } from "@/data/[id]/(utils)/api";
import { ODataResponse } from "@shared/types/api.types";
import { DatasourceRow, GeomColDataType } from "@shared/types/datasource.types";
import { FeatureCollection } from "geojson";
import { useCallback, useEffect, useRef, useState } from "react";
import { KeyedMutator } from "swr";
import { CellInfo, GeomEdit } from "../(utils)/types";
import GeometryActionAlert from "./geometry-action-alert";
import MapboxGlDraw from "./mapbox-gl-draw";
import {
  generateGeomCellDataFromFC,
  getGlDrawControls,
} from "../(utils)/gl-draw";
import notify from "@shared/utils/toasts";

function EditGeometry({
  editableGeomCellInfo,
  setEditableGeomCellInfo,
  geojson,
  datasourceId,
  mutateDatasourceRows,
}: {
  editableGeomCellInfo: CellInfo;
  setEditableGeomCellInfo: React.Dispatch<
    React.SetStateAction<CellInfo | null>
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

    const updatedCellData =
      updatedFeatures.features.length === 0
        ? null
        : generateGeomCellDataFromFC({
            columnDataType: editableGeomCellInfo.dataType,
            featureCollection: updatedFeatures,
          });

    const { success } = await updateDatasourceRow({
      rowId: editableGeomCellInfo.rowId,
      datasourceId,
      cellColumnName: editableGeomCellInfo.columnName,
      updatedCellData,
    });

    await mutateDatasourceRows();

    if (success) {
      notify.success("تغییرات با موفقیت ثبت شد.");
    } else {
      notify.error("متاسفانه تغییرات شما ثبت نشد.");
    }

    setEditableGeomCellInfo(null);
    setIsLoading(false);
  }, [
    datasourceId,
    editableGeomCellInfo.columnName,
    editableGeomCellInfo.dataType,
    editableGeomCellInfo.rowId,
    mutateDatasourceRows,
    setEditableGeomCellInfo,
  ]);

  return (
    <>
      {editableGeomCellInfo && geojson && (
        <MapboxGlDraw
          controls={getGlDrawControls(
            (editableGeomCellInfo.dataType ?? "point") as GeomColDataType
          )}
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
