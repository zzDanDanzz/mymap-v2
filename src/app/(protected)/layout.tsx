"use client";

import { X_API_KEY } from "@shared/config";
import { useUserProfile } from "@shared/hooks/swr/use-user-profile";
import useLogout from "@shared/hooks/use-logout";
import { getSessionToken, setUserXApiKey } from "@shared/utils/local-storage";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { createApp } from "./api";

export default function ProtectedRoutesLayout({ children }: PropsWithChildren) {
  const { logOut } = useLogout();
  const [isCreatingMyApp, setIsCreatingMyApp] = useState(false);
  const { userIsLoading, userData, userError, userIsValidating } =
    useUserProfile();

  const handleUserHasNoMyApp = useCallback(async (userId: string) => {
    setIsCreatingMyApp(true);
    const res = await createApp(userId);

    if (res.success) {
      setUserXApiKey(res.appToken);
    } else {
      // TODO: this key should not be used. must change when backend is ready
      setUserXApiKey(X_API_KEY);
    }
    setIsCreatingMyApp(false);
  }, []);

  const handleRouteProtection = useCallback(async () => {
    const sessionToken = getSessionToken();

    if (!sessionToken) {
      logOut();
      return;
    }

    if (userIsValidating) {
      return;
    }

    if (userError) {
      logOut();
      return;
    }

    if (userData && !userData.id) {
      logOut();
      return;
    }

    if (userData && !userData.my_app?.access_token) {
      handleUserHasNoMyApp(userData.id);
    }
  }, [handleUserHasNoMyApp, logOut, userData, userError, userIsValidating]);

  useEffect(() => {
    handleRouteProtection();
  }, [handleRouteProtection]);

  if (userIsLoading || userError || isCreatingMyApp) {
    return <>Loading.....</>;
  }

  return <>{children}</>;
}
