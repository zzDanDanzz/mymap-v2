"use client";

import { PropsWithChildren } from "react";
import RouteProtectionWrapper from "./(components)/route-protection-wrapper";
import NavigationBar from "./(components)/navigation-bar";

export default function ProtectedRoutesLayout({ children }: PropsWithChildren) {
  return (
    <RouteProtectionWrapper>
      <NavigationBar />
      {children}
    </RouteProtectionWrapper>
  );
}
