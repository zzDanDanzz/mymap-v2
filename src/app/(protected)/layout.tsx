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
import { createApp } from "./client-actions";
import { X_API_KEY } from "@shared/config";

export default function ProtectedRoutesLayout({ children }: PropsWithChildren) {
  const router = useRouter();
  const [isCreatingMyApp, setIsCreatingMyApp] = useState(false);
  const { userIsLoading, userData, userError } = useUserProfile();

  const signOut = useCallback(() => {
    router.push("/login");
    removeSessionToken();
    removeRefreshToken();
    removeUserXApiKey();
  }, [router]);

  const handleUserHasNoMyApp = useCallback(async (userId: string) => {
    const res = await createApp(userId);

    if (res.success) {
      setUserXApiKey(res.appToken);
    } else {
      setUserXApiKey(X_API_KEY);
    }
  }, []);

  const handleRouteProtection = useCallback(async () => {
    if (!getSessionToken()) {
      signOut();
      return;
    }

    if (userIsLoading) return;

    if (userError) {
      signOut();
      return;
    }

    if (!userData) return;

    if (!userData.my_app?.access_token) {
      setIsCreatingMyApp(true);
      handleUserHasNoMyApp(userData.id);
      setIsCreatingMyApp(false);
    }
  }, [handleUserHasNoMyApp, signOut, userData, userError, userIsLoading]);

  useEffect(() => {
    handleRouteProtection();
  }, [handleRouteProtection]);

  if (isCreatingMyApp) {
    return <>Loading.....</>;
  }

  return <>{children}</>;
}
