import { X_API_KEY, paths } from "@/(shared)/constants";
import SubmitButton from "@/login/submit-button";
import { Anchor, Group, Stack, TextInput, Title } from "@mantine/core";
import Link from "next/link";

const loginWithOTP = async (formData: FormData) => {
  "use server";

  const mobile = formData.get("mobile");

  const response = await fetch(`${paths.register.OTPSend}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${X_API_KEY}`,
    },
    body: JSON.stringify({
      mobile,
    }),
  });

  const data = await response.json();

  return data;
};

export default function Page() {
  return (
    <form action={loginWithOTP}>
      <Stack>
        <Group>
          <Title>ورود</Title>
        </Group>
        <TextInput name="mobile" label="شماره تلفن همراه" required />
        <SubmitButton>دریافت کد</SubmitButton>
        <Anchor component={Link} href="/login">
          ورود با نام کاربری و رمز عبور
        </Anchor>
      </Stack>
    </form>
  );
}
