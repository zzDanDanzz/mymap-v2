"use client";

import { getSessionToken } from "@shared/utils/local-storage";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";

export default function ProtectedRoutesLayout({ children }: PropsWithChildren) {
  const router = useRouter();

  useEffect(() => {
    if (!getSessionToken()) {
      router.push("/login");
    }
  }, [router]);

  return <>{children}</>;
}
