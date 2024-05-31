import urls from "@shared/api/urls";
import type { ODataResponse } from "@shared/types/api.types";
import { getCommonHeaders } from "@shared/api/utils";
import { ax } from "@shared/api/axios-instance";
import { DatasourceColumn } from "@shared/types/datasource.types";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await ax.get<ODataResponse<DatasourceColumn>>(url, {
    headers: getCommonHeaders(),
  });
  return res.data;
};

export function useDatasourceColumns({ id }: { id: string }) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    `${urls.editorTables}/${id}/columns`,
    fetcher
  );

  return {
    datasourceColumns: data?.value,
    totalCount: data?.["odata.count"],
    datasourceColumnsError: error,
    datasourceColumnsIsLoading: isLoading,
    datasourceColumnsIsValidating: isValidating,
    datasourceColumnsMutate: mutate,
  };
}
