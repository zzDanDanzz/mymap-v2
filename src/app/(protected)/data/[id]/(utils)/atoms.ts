import { DatasourceColumn } from "@shared/types/datasource.types";
import { atom } from "jotai";
import { EditableGeomCellInfo } from "../(components)/datasource-map/(utils)/types";

export const editableGeomCellInfoAtom = atom<EditableGeomCellInfo | null>(null);

/**
 * tracks whether the user is in "Add mode" for adding new geometry to an empty cell.
 */
export const addingGeomModeAtom = atom<{
  isEnabled: boolean;
  rowId?: string;
  datasourceColumn?: DatasourceColumn;
}>({
  isEnabled: false,
});
