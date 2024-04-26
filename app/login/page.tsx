import {
  Anchor,
  Button,
  Group,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import Link from "next/link";

export default function Page() {
  return (
    <form>
      <Stack>
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
