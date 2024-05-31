"use client";

import { PropsWithChildren } from "react";
import RouteProtectionWrapper from "./(components)/route-protection-wrapper";
import NavigationBar from "./(components)/navigation-bar";
import { Flex } from "@mantine/core";

export default function ProtectedRoutesLayout({ children }: PropsWithChildren) {
  return (
    <RouteProtectionWrapper>
      <Flex h={"100%"} direction={"column"}>
        <NavigationBar />
        {children}
      </Flex>
    </RouteProtectionWrapper>
  );
}
