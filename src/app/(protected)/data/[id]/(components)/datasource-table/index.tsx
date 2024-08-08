import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

import { AG_GRID_LOCALE_IR } from "@ag-grid-community/locale";
import {
  Group,
  Pagination,
  Stack,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import useDatasource from "@shared/hooks/swr/datasources/use-datasource";
import { useDatasourceColumns } from "@shared/hooks/swr/datasources/use-datasource-columns";
import { useDatasourceRows } from "@shared/hooks/swr/datasources/use-datasource-rows";
import { IconSearch, IconSquareX } from "@tabler/icons-react";
import type {
  CellEditingStoppedEvent,
  ColumnMovedEvent,
  ColumnPinnedEvent,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ActionButtons from "./(components)/action-buttons";
import AddDataButtons from "./(components)/add-data-buttons";
import useColDefs from "./(hooks)/use-col-defs";
import {
  syncGridColumnsOrderWithApi,
  updateDatasourceRow,
} from "./(utils)/api";
import useCreateQueryString from "@shared/hooks/use-create-query-string";

function useSyncSearchTextWithUrl({ searchText }: { searchText: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const createQueryString = useCreateQueryString();

  // sync search text with url
  useEffect(() => {
    if (searchText) {
      router.push(pathname + "?" + createQueryString("search", searchText));
    } else {
      router.push(pathname);
    }
  }, [createQueryString, pathname, router, searchText]);

  return null;
}

export function DatasourceTable() {
  const { id } = useParams<{ id: string }>();

  const params = useSearchParams();

  const [searchText, setSearchText] = useState(params.get("search") ?? "");

  useSyncSearchTextWithUrl({ searchText });

  const { datasourceColumns, datasourceColumnsIsLoading } =
    useDatasourceColumns({ id });

  const { datasourceRows, datasourceRowsIsValidating, totalPageCount } =
    useDatasourceRows({
      id,
      search: searchText,
    });

  const { datasource, datasourceMutate } = useDatasource({ id });

  const colDefs = useColDefs({
    datasourceColumns,
    currentDatasource: datasource,
  });

  const onCellEditingStopped = useCallback(
    async (event: CellEditingStoppedEvent) => {
      const _columnField = event.colDef.field;

      if (!_columnField) return;

      const _cellData = event.data[_columnField];

      event.api.setGridOption("loading", true);

      await updateDatasourceRow({
        datasourceId: id,
        rowId: event.data.id,
        cellColumnName: _columnField,
        updatedCellData: _cellData,
      });

      event.api.setGridOption("loading", false);
    },
    [id],
  );

  const onColumnMovedOrPinned = useCallback(
    async (event: ColumnMovedEvent | ColumnPinnedEvent) => {
      if (typeof (event as ColumnMovedEvent)?.finished === "boolean") {
        // if finished is false then it means the user is still dragging the column (only for ColumnMovedEvent)
        if (!(event as ColumnMovedEvent).finished) return;
      }

      event.api.setGridOption("loading", true);

      await syncGridColumnsOrderWithApi({
        columns: event.api.getAllGridColumns(),
        currentDatasource: datasource,
      });

      await datasourceMutate();

      event.api.setGridOption("loading", false);
    },
    [datasource, datasourceMutate],
  );

  const [currentPage, setCurrentPage] = useState(1);

  return (
    <Stack h={"100%"} p={"md"}>
      <title>{datasource?.name}</title>
      <Group justify="space-between">
        <TextInput
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="جستجو"
          rightSection={
            searchText ? (
              <UnstyledButton
                onClick={() => setSearchText("")}
                display={"flex"}
              >
                <IconSquareX />
              </UnstyledButton>
            ) : (
              <IconSearch />
            )
          }
        />
        <ActionButtons />
      </Group>
      <AgGridReact
        localeText={AG_GRID_LOCALE_IR}
        className="ag-theme-alpine"
        loading={datasourceRowsIsValidating || datasourceColumnsIsLoading}
        enableRtl={true}
        rowData={datasourceRows}
        columnDefs={colDefs}
        onCellEditingStopped={onCellEditingStopped}
        onColumnMoved={onColumnMovedOrPinned}
        onColumnPinned={onColumnMovedOrPinned}
        headerHeight={80}
      />
      <Group justify={"space-between"}>
        {totalPageCount > 1 && (
          <Pagination
            total={totalPageCount}
            value={currentPage}
            onChange={setCurrentPage}
            ff={"IRANSansWebFa"}
          />
        )}

        <AddDataButtons />
      </Group>
    </Stack>
  );
}

export default DatasourceTable;
