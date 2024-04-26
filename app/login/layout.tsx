import { Box, Center, Paper, Stack, Title } from "@mantine/core";
import { PropsWithChildren } from "react";

export default function LoginLayout({ children }: PropsWithChildren) {
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
