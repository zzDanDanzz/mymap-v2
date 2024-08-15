import { X_API_KEY } from "@shared/config";
import {
  setRefreshToken,
  setSessionToken,
  setUserXApiKey,
} from "@shared/utils/local-storage";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const login = useCallback(
    ({
      sessionToken,
      refreshToken,
    }: {
      sessionToken: string;
      refreshToken: string;
    }) => {
      setSessionToken(sessionToken);
      setRefreshToken(refreshToken);
      // temporarily use default x-api-key until user's own api key is fetched from profile
      setUserXApiKey(X_API_KEY);

      const redirectQuery = searchParams.get("redirect");

      if (redirectQuery) {
        router.push(redirectQuery);
      } else {
        router.push("/data");
      }
    },
    [router, searchParams],
  );

  return { login };
}

export default useLogin;
