"use client";
import { Anchor, Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import Link from "next/link";
import { z } from "zod";
import { captchaFormSchema, passwordLoginFormSchema } from "./schemas";
import { FormEvent, useState } from "react";
import { passwordLogin } from "./api";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [captchaId, setCaptchaId] = useState<string>();

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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { hasErrors } = form.validate();
    if (hasErrors) return;

    if (captchaId) {
      const { hasErrors } = captchaForm.validate();
      if (hasErrors) return;
    }

    setLoading(true);

    await passwordLogin({
      username: form.values.username,
      password: form.values.password,
      captchaSolution: captchaForm.values.captchaSolution,
      captchaId,
    });

    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <TextInput label="نام کاربری" {...form.getInputProps("username")} />
        <PasswordInput label="رمز عبور" {...form.getInputProps("password")} />
        {captchaId && (
          <TextInput
            label="کد کپچا"
            {...captchaForm.getInputProps("captchaSolution")}
          />
        )}
        <Button type="submit">ورود</Button>
        <Anchor component={Link} href="/login/otp">
          ورود با رمز یک‌بار مصرف
        </Anchor>
      </Stack>
    </form>
  );
}
