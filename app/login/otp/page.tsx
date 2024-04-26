"use client";

import { Anchor, Button, Divider, Stack, TextInput } from "@mantine/core";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import queryString from "query-string";
import { FormEvent, useState } from "react";
import { sendOTP } from "../client-actions";

export default function Page() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const { hasError, message } = await sendOTP(formData);
    if (hasError) {
      setErrorMsg(message ?? "");
    } else {
      router.push(
        `${pathname}?${queryString.stringify({
          mobile: formData.get("mobile"),
        })}`
      );
    }

    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <TextInput
          type="tel"
          name="mobile"
          label="شماره تلفن همراه"
          required
          error={errorMsg}
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
