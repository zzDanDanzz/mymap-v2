"use client";

import { Anchor, Button, Divider, Stack, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import notify from "@shared/utils/toasts";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import queryString from "query-string";
import { FormEvent, useState } from "react";
import { sendOTP } from "../api";
import { sendOtpFormSchema } from "../schemas";
import { z } from "zod";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm<z.infer<typeof sendOtpFormSchema>>({
    initialValues: {
      mobile: "",
    },
    validate: zodResolver(sendOtpFormSchema),
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { hasErrors } = form.validate();
    if (hasErrors) return;

    setLoading(true);
    const { success } = await sendOTP(form.values);

    if (success) {
      router.push(`${pathname}/verify?${queryString.stringify(form.values)}`);
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
