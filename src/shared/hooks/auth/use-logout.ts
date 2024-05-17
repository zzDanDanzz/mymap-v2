import urls from "@shared/api/urls";
import { removeRefreshToken, removeSessionToken, removeUserXApiKey } from "@shared/utils/local-storage";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useSWRConfig } from "swr";

function useLogout() {
    const router = useRouter();
    const { cache } = useSWRConfig();

    const logOut = useCallback(() => {
        removeSessionToken();
        removeRefreshToken();
        removeUserXApiKey();
        // prevents route protection bugs
        cache.delete(urls.register.mySelf)
        router.push("/login");
    }, [cache, router]);

    return { logOut };
}

export default useLogout;