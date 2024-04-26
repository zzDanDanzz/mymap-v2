"use client";

import { Center, Paper, Stack, Title } from "@mantine/core";
import useToken from "@shared/hooks/use-token";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect } from "react";

export default function LoginLayout({ children }: PropsWithChildren) {
  const [token] = useToken();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.push("/data");
    }
  }, [router, token]);

  return (
    <Center>
      <Paper withBorder p={"md"} maw={400} mt={128} flex={"1"}>
        <Stack>
          <Title>ورود</Title>
          {children}
        </Stack>
      </Paper>
    </Center>
  );
}
