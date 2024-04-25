import {
  Anchor,
  Button,
  Group,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { API_BASE, X_API_KEY } from "../(shared)/constants";
import Link from "next/link";

const loginWithEmail = async (formData: FormData) => {
  "use server";
  console.log("key", API_BASE);

  console.log({
    username: formData.get("username"),
    password: formData.get("password"),
  });
};

export default function Page() {
  return (
    <form action={loginWithEmail}>
      <Stack>
        <Group>
          <Title>ورود</Title>
        </Group>
        <TextInput name="username" label="نام کاربری" required />
        <PasswordInput name="password" label="رمز عبور" required />
        <Button type="submit">ورود</Button>
        <Anchor component={Link} href="/login/otp">
          ورود با رمز یک‌بار مصرف
        </Anchor>
      </Stack>
    </form>
  );
}
