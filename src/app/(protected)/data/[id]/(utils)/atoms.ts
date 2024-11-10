import { DatasourceColumn } from "@shared/types/datasource.types";
import { atom } from "jotai";
import { CellInfo } from "../(components)/datasource-map/(utils)/types";

export const editableGeomCellInfoAtom = atom<CellInfo | null>(null);

export const enabledGeomColumnNamesToViewAtom = atom<string[]>([]);

/**
 * tracks whether the user is in "Add mode" for adding new geometry to an empty cell.
 */
export const addingGeomModeAtom = atom<{
  isEnabled: boolean;
  rowId?: number;
  datasourceColumn?: DatasourceColumn;
}>({
  isEnabled: false,
});
