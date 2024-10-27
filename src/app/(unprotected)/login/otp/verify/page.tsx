"use client";

import { checkOTP } from "@/login/(utils)/api";
import { checkOtpFormSchema } from "@/login/(utils)/schemas";
import { Anchor, Button, Divider, PinInput, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import useLogin from "@shared/hooks/auth/use-login";
import notify from "@shared/utils/toasts";
import { zodResolver } from "mantine-form-zod-resolver";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

export default function Page() {
  const OTP_CODE_LENGTH = 5;

  const { login } = useLogin();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const mobile = searchParams.get("mobile")!;

  const form = useForm<z.infer<typeof checkOtpFormSchema>>({
    initialValues: {
      token: "",
      mobile,
    },
    validate: zodResolver(checkOtpFormSchema),
    enhanceGetInputProps() {
      return { disabled: loading };
    },
  });

  async function handleSubmit(values: z.infer<typeof checkOtpFormSchema>) {
    if (!form.values.mobile) {
      router.push("/login/otp");
      return;
    }

    setLoading(true);

    const { success, refreshToken, sessionToken } = await checkOTP(values);

    if (success) {
      login({ sessionToken, refreshToken });
    } else {
      notify.error("خطایی رخ داده است.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Text>پیام برای {mobile} ارسال شد.</Text>

        <PinInput
          type={"number"}
          length={OTP_CODE_LENGTH}
          dir="ltr"
          styles={{ root: { justifyContent: "center" } }}
          {...form.getInputProps("token")}
        />

        <Button type="submit" loading={loading}>
          ورود
        </Button>

        <Divider />
        <Anchor component={Link} href="/login">
          ورود با نام کاربری و رمز عبور
        </Anchor>
      </Stack>
    </form>
  );
}
