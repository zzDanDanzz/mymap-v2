import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { X_API_KEY } from "@shared/config";
import { getSessionToken } from "@shared/utils/local-storage";
import useSWRImmutable from "swr/immutable";
interface MyApp {
  access_token: Accesstoken;
}

interface Accesstoken {
  token: string;
}

interface MySelf {
  id: string;
  my_app?: MyApp;
}

const fetcher = async (url: string) => {
  const res = await ax.get<MySelf>(url, {
    headers: {
      token: getSessionToken(),
      "x-api-key": X_API_KEY,
    },
  });
  return res.data;
};

export function useUserProfile() {
  const { data, error, isLoading, mutate, isValidating } = useSWRImmutable(
    urls.register.mySelf,
    fetcher
  );

  return {
    userData: data,
    userError: error,
    userIsLoading: isLoading,
    userIsValidating: isValidating,
    userMutate: mutate,
  };
}
