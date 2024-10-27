"use client";

import { Anchor, Button, Divider, Stack, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import notify from "@shared/utils/toasts";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import queryString from "query-string";
import { useState } from "react";
import { z } from "zod";
import { sendOTP } from "../(utils)/api";
import { sendOtpFormSchema } from "../(utils)/schemas";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm<z.infer<typeof sendOtpFormSchema>>({
    initialValues: {
      mobile: "",
    },
    validate: zodResolver(sendOtpFormSchema),
    enhanceGetInputProps() {
      return { disabled: loading };
    },
  });

  async function handleSubmit(values: z.infer<typeof sendOtpFormSchema>) {
    setLoading(true);
    const { success } = await sendOTP(values);

    if (success) {
      router.push(`${pathname}/verify?${queryString.stringify(form.values)}`);
    } else {
      notify.error("خطا در ارسال کد");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          type="tel"
          label="شماره تلفن همراه"
          {...form.getInputProps("mobile")}
        />

        <Button type="submit" loading={loading}>
          دریافت کد
        </Button>

        <Divider />
        <Anchor component={Link} href="/login">
          ورود با نام کاربری و رمز عبور
        </Anchor>
      </Stack>
    </form>
  );
}
