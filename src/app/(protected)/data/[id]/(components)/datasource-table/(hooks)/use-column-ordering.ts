import useDatasource from "@shared/hooks/swr/datasources/use-datasource";
import { Datasource, DatasourceColumn } from "@shared/types/datasource.types";
import arrayDifference from "lodash.difference";
import arrayPullAll from "lodash.pullall";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { updateColumnOrdering } from "../(utils)/api";

export function useColumnOrdering({
  currentDatasource,
  columns,
}: {
  currentDatasource: Datasource | undefined;
  columns: DatasourceColumn[] | undefined;
}): string[] {
  const { datasourceMutate } = useDatasource({ id: currentDatasource?.id });

  const columnOrdering = useMemo(() => {
    if (!currentDatasource || !columns) return [];

    const prevColumnOrdering =
      currentDatasource?.settings?.columns_ordering ?? [];

    if (prevColumnOrdering.length === 0) {
      return columns.map((c) => c.name);
    }
    try {
      const columnNames = columns.map((col) => col.name);
      const deletedColumns = arrayDifference(prevColumnOrdering, columnNames);

      const addedColumns = arrayDifference(columnNames, prevColumnOrdering);

      const colsWithoutDeletedCols = arrayPullAll(
        // spreading because pullall mutates.
        [...prevColumnOrdering],
        deletedColumns,
      );

      const finalColumnOrdering = [
        ...colsWithoutDeletedCols,
        ...addedColumns,
      ] as string[];

      return finalColumnOrdering;
    } catch (_) {
      return [];
    }
  }, [columns, currentDatasource]);

  const updateInProgress = useRef(false);

  const seedColumnOrderingSetting = useCallback(async () => {
    if (!currentDatasource || !columnOrdering || updateInProgress.current)
      return;

    // the setting already exists; do nothing
    if (currentDatasource.settings?.columns_ordering) return;

    updateInProgress.current = true;
    await updateColumnOrdering({
      columns_ordering: columnOrdering,
      currentDatasource,
    });
    await datasourceMutate();
    updateInProgress.current = false;
  }, [columnOrdering, currentDatasource, datasourceMutate]);

  // create column ordering setting if it doesn't exist already
  useEffect(() => {
    seedColumnOrderingSetting();
  }, [seedColumnOrderingSetting]);

  return columnOrdering;
}
