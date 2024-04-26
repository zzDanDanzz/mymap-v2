"use client";

import { checkOTP } from "@/login/client-actions";
import { Anchor, Button, Divider, PinInput, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const mobile = searchParams.get("mobile");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!mobile) {
      router.push("/login/otp");
      return;
    }

    setLoading(true);

    const { hasError, message } = await checkOTP(new FormData(e.currentTarget));
    // if (hasError) {
    //   setErrorMsg(message ?? "");
    // } else {
    //   router.push(
    //     `${pathname}?${queryString.stringify({
    //       mobile: formData.get("mobile"),
    //     })}`
    //   );
    // }

    // setLoading(false);
  }

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <Text>پیام برای {mobile} ارسال شد.</Text>

        <input type="hidden" name="mobile" value={mobile!} />

        <PinInput
          type={"number"}
          length={5}
          name="token"
          dir="ltr"
          ariaLabel="hih"
          styles={{ root: { justifyContent: "center" } }}
        />

        <Button type="submit" disabled={loading}>
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
