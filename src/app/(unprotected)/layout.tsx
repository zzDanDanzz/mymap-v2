"use client";

import useLogin from "@shared/hooks/auth/use-login";
import { getRefreshToken, getSessionToken } from "@shared/utils/local-storage";
import { useEffect } from "react";

export default function UnprotectedRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { login } = useLogin();

  useEffect(() => {
    const sessionToken = getSessionToken();
    const refreshToken = getRefreshToken();
    if (sessionToken && refreshToken) {
      login({ sessionToken, refreshToken });
    }
  }, [login]);

  return <>{children}</>;
}
