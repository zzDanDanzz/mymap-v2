"use client";

import { getSessionToken } from "@shared/utils/local-storage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UnprotectedRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (getSessionToken()) {
      router.push("/data");
    }
  }, [router]);

  return <>{children}</>;
}
