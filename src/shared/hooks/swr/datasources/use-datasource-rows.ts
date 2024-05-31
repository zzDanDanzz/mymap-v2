import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { getCommonHeaders } from "@shared/api/utils";
import type { ODataResponse } from "@shared/types/api.types";
import { DatasourceRow } from "@shared/types/datasource.types";
import queryString from "query-string";
import useSWRImmutable from "swr/immutable";

const fetcher = async (url: string) => {
  const res = await ax.get<ODataResponse<DatasourceRow>>(url, {
    headers: getCommonHeaders(),
  });
  return res.data;
};

export function useDatasourceRows({ id }: { id: string }) {
  const { data, error, isLoading, isValidating, mutate } = useSWRImmutable(
    `${urls.editorTables}/${id}/rows?${queryString.stringify({ $top: 10000 })}`,
    fetcher
  );

  return {
    datasourceRows: data?.value,
    totalCount: data?.["odata.count"],
    datasourceRowsError: error,
    datasourceRowsIsLoading: isLoading,
    datasourceRowsIsValidating: isValidating,
    datasourceRowsMutate: mutate,
  };
}
