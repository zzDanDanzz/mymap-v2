import { useDebouncedValue } from "@mantine/hooks";
import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { getCommonHeaders } from "@shared/api/utils";
import { DEFAULT_ROWS_PER_PAGE } from "@shared/constants/datasource.constants";
import type { ODataResponse } from "@shared/types/api.types";
import { DatasourceRow } from "@shared/types/datasource.types";
import queryString from "query-string";
import { useMemo } from "react";
import useSWRImmutable from "swr/immutable";

const fetcher = async (url: string) => {
  const res = await ax.get<ODataResponse<DatasourceRow>>(url, {
    headers: getCommonHeaders(),
  });
  return res.data;
};

export function useDatasourceRows({
  id,
  page = 1,
  rowsPerPage = DEFAULT_ROWS_PER_PAGE,
  search,
}: {
  id: string;
  page?: number;
  rowsPerPage?: number;
  search?: string;
}) {
  const [debouncedSearch] = useDebouncedValue(search, 500);

  const qs = useMemo(() => {
    return queryString.stringify(
      {
        $top: rowsPerPage,
        $skip: page === 1 ? null : (page - 1) * rowsPerPage,
        $search: debouncedSearch,
      },
      { skipNull: true, skipEmptyString: true },
    );
  }, [debouncedSearch, page, rowsPerPage]);

  const { data, error, isLoading, isValidating, mutate } = useSWRImmutable(
    `${urls.editorTables}/${id}/rows?${qs}`,
    fetcher,
  );

  return {
    datasourceRows: data?.value,
    totalCount: data?.["odata.count"],
    totalPageCount:
      typeof data?.["odata.count"] === "number"
        ? Math.ceil(data["odata.count"] / rowsPerPage)
        : 0,
    datasourceRowsError: error,
    datasourceRowsIsLoading: isLoading,
    datasourceRowsIsValidating: isValidating,
    datasourceRowsMutate: mutate,
  };
}
