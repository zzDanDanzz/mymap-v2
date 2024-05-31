"use client";

import useLogout from "@shared/hooks/auth/use-logout";
import { useUserProfile } from "@shared/hooks/swr/use-user-profile";
import { getSessionToken, setUserXApiKey } from "@shared/utils/local-storage";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createApp } from "../(utils)/api";
import CenteredLoader from "@shared/component/centered-loader";

export default function RouteProtectionWrapper({
  children,
}: PropsWithChildren) {
  const { logOut } = useLogout();
  const [isCreatingMyApp, setIsCreatingMyApp] = useState(false);
  const { userIsLoading, userData, userIsValidating } =
    useUserProfile();

  const hasAttemptedMyAppCreationRef = useRef(false);

  const handleUserHasNoMyApp = useCallback(async (userId: string) => {
    if (hasAttemptedMyAppCreationRef.current) {
      return;
    }
    setIsCreatingMyApp(true);
    hasAttemptedMyAppCreationRef.current = true;
    const res = await createApp(userId);

    if (res.success) {
      setUserXApiKey(res.appToken);
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

    if (userData && !userData.id) {
      logOut();
      return;
    }

    if (userData && !userData.my_app?.access_token) {
      handleUserHasNoMyApp(userData.id);
    }
  }, [handleUserHasNoMyApp, logOut, userData, userIsValidating]);

  useEffect(() => {
    handleRouteProtection();
  }, [handleRouteProtection]);

  if (userIsLoading || !userData?.id || isCreatingMyApp) {
    return <CenteredLoader />
  }

  return <>{children}</>;
}
