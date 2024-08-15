import urls from "@shared/api/urls";
import {
  removeRefreshToken,
  removeSessionToken,
  removeUserXApiKey,
} from "@shared/utils/local-storage";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useSWRConfig } from "swr";

function useLogout() {
  const pathname = usePathname();
  const router = useRouter();
  const { cache } = useSWRConfig();
  const searchParams = useSearchParams();

  const logOut = useCallback(() => {
    removeSessionToken();
    removeRefreshToken();
    removeUserXApiKey();
    // prevents route protection bugs
    cache.delete(urls.register.mySelf);

    // if pathname is other than '/'
    // store both current pathname and search params in redirect query for accurate redirection
    if (pathname.length > 1) {
      const params = searchParams.toString();
      const hasParams = params.length > 0;

      const redirectQuery = new URLSearchParams({
        redirect: `${pathname}${hasParams ? "?" : ""}${params}`,
      });

      router.push("/login?" + redirectQuery.toString());
    } else {
      router.push("/login");
    }
  }, [cache, pathname, router, searchParams]);

  return { logOut };
}

export default useLogout;
