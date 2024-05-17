import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { getCommonHeaders } from "@shared/api/utils";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await ax.get<ODataResponse<Datasource>>(url, {
    headers: getCommonHeaders(),
  });
  return res.data;
};

function useAllDatasources() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    urls.datasources,
    fetcher
  );

  return {
    datasources: data?.value,
    totalCount: data?.["odata.count"],
    datasourcesError: error,
    datasourcesIsLoading: isLoading,
    datasourcesIsValidating: isValidating,
    datasourcesMutate: mutate,
  };
}

export default useAllDatasources;
