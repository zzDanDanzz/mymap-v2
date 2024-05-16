"use client";

import { useUserProfile } from "@shared/hooks/swr/use-user-profile";
import {
  getSessionToken,
  removeRefreshToken,
  removeSessionToken,
  removeUserXApiKey,
  setUserXApiKey,
} from "@shared/utils/local-storage";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { createApp } from "./api";
import { X_API_KEY } from "@shared/config";

export default function ProtectedRoutesLayout({ children }: PropsWithChildren) {
  const router = useRouter();
  const [isCreatingMyApp, setIsCreatingMyApp] = useState(false);
  const { userIsLoading, userData, userError, userIsValidating } = useUserProfile();

  const signOut = useCallback(() => {
    router.push("/login");
    removeSessionToken();
    removeRefreshToken();
    removeUserXApiKey();
  }, [router]);

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
      signOut();
      return;
    }

    if (userIsValidating) return;

    if (userError) {
      signOut();
      return;
    }

    if (userData && !userData.id) {
      signOut();
      return;
    }

    if (userData && !userData.my_app?.access_token) {
      handleUserHasNoMyApp(userData.id);
    }
  }, [handleUserHasNoMyApp, signOut, userData, userError, userIsValidating]);

  useEffect(() => {
    handleRouteProtection();
  }, [handleRouteProtection]);

  if (userIsLoading || userError || isCreatingMyApp) {
    return <>Loading.....</>;
  }

  return <>{children}</>;
}
