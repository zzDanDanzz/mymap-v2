"use client";
import { Anchor, Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import useLogin from "@shared/hooks/auth/use-login";
import notify from "@shared/utils/toasts";
import { zodResolver } from "mantine-form-zod-resolver";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { z } from "zod";
import CaptchaFields from "./(components)/captcha-form";
import { getCaptcha, passwordLogin } from "./(utils)/api";
import { captchaFormSchema, passwordLoginFormSchema } from "./(utils)/schemas";
import { Captcha } from "./(utils)/types";

export default function Page() {
  const { login } = useLogin();
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState<Captcha>();

  const form = useForm<z.infer<typeof passwordLoginFormSchema>>({
    initialValues: {
      username: "",
      password: "",
    },
    validate: zodResolver(passwordLoginFormSchema),
  });

  const captchaForm = useForm<z.infer<typeof captchaFormSchema>>({
    initialValues: {
      captchaSolution: "",
    },
    validate: zodResolver(captchaFormSchema),
  });

  async function handleRequiresCaptcha() {
    const { success, id, imgUrl, message } = await getCaptcha();
    if (success) {
      setCaptcha({ id, imgUrl });
    } else {
      notify.error(message);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { hasErrors } = form.validate();
    if (hasErrors) return;

    if (captcha) {
      const { hasErrors } = captchaForm.validate();
      if (hasErrors) return;
    }

    setLoading(true);

    const { success, message, refreshToken, sessionToken, requiresCaptcha } =
      await passwordLogin({
        username: form.values.username,
        password: form.values.password,
        captchaSolution: captchaForm.values.captchaSolution,
        captchaId: captcha?.id,
      });

    if (success) {
      login({ refreshToken, sessionToken });
    } else {
      if (requiresCaptcha) {
        await handleRequiresCaptcha();
      }
      notify.error(message);
    }

    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <TextInput label="نام کاربری" {...form.getInputProps("username")} />
        <PasswordInput label="رمز عبور" {...form.getInputProps("password")} />
        {captcha && (
          <CaptchaFields
            captchaForm={captchaForm}
            captcha={captcha}
            refetchCaptcha={handleRequiresCaptcha}
          />
        )}
        <Button type="submit" loading={loading}>
          ورود
        </Button>
        <Anchor component={Link} href="/login/otp">
          ورود با رمز یک‌بار مصرف
        </Anchor>
      </Stack>
    </form>
  );
}
