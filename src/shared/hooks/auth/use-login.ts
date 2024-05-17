import { X_API_KEY } from "@shared/config";
import {
    setRefreshToken,
    setSessionToken,
    setUserXApiKey
} from "@shared/utils/local-storage";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

function useLogin() {
  const router = useRouter();

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
      router.push("/data");
    },
    [router]
  );

  return { login };
}

export default useLogin;
