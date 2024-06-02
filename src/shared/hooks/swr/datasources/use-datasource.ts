import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { getCommonHeaders } from "@shared/api/utils";
import useSWR from "swr";

import type { Datasource } from "@shared/types/datasource.types";

const fetcher = async (url: string) => {
  const res = await ax.get<{ data: Datasource }>(url, {
    headers: getCommonHeaders(),
  });
  return res.data.data;
};

function useDatasource({ id }: { id: string }) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    `${urls.datasources}/${id}`,
    fetcher
  );

  return {
    datasource: data,
    datasourceError: error,
    datasourceIsLoading: isLoading,
    datasourceIsValidating: isValidating,
    datasourceMutate: mutate,
  };
}

export default useDatasource;
