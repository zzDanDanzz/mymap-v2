"use client";

import { Anchor, Button, Divider, Stack, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import notify from "@shared/utils/toasts";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import queryString from "query-string";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { sendOTP } from "../client-actions";
import { mobileSchema } from "../schemas";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    initialValues: {
      mobile: "",
    },
    validate: zodResolver(z.object({ mobile: mobileSchema })),
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const { success } = await sendOTP(formData);

    if (success) {
      router.push(
        `/otp/verify?${queryString.stringify({
          mobile: formData.get("mobile"),
        })}`
      );
    } else {
      notify.error("خطا در ارسال کد");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <TextInput
          type="tel"
          label="شماره تلفن همراه"
          name="mobile"
          required
          {...form.getInputProps("mobile")}
        />

        <Button type="submit" disabled={loading}>
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
