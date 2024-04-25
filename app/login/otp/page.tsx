"use client";

import { X_API_KEY, paths } from "@/(shared)/constants";
import { Anchor, Group, Modal, Stack, TextInput, Title } from "@mantine/core";
import Link from "next/link";
import { useFormState } from "react-dom";
import SubmitButton from "../submit-button";
import { sendOTP } from "../login-actions";

export default function Page() {
  const [state, action] = useFormState(sendOTP, null);

  const isCodeSent = state?.message === "Verification code has been sent";

  return (
    <>
      <form action={action}>
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

      {isCodeSent && (
        <Modal
          closeOnEscape={false}
          opened={true}
          onClose={() => {}}
          withCloseButton={false}
        ></Modal>
      )}
    </>
  );
}
