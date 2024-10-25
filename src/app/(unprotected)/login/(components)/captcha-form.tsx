import { ActionIcon, Group, TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import { z } from "zod";
import { captchaFormSchema } from "../(utils)/schemas";
import { Captcha } from "../(utils)/types";

function CaptchaFields({
  captchaForm,
  captcha,
  refetchCaptcha,
}: {
  captchaForm: UseFormReturnType<z.infer<typeof captchaFormSchema>>;
  captcha: Captcha;
  refetchCaptcha: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  async function handleRefetchCaptcha() {
    setLoading(true);
    await refetchCaptcha();
    setLoading(false);
  }
  return (
    <>
      <Group>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="captcha"
          src={`data:image/png;base64,${captcha.imgUrl}`}
          style={{
            filter: loading ? "blur(4px)" : "none",
          }}
        />
        <ActionIcon onClick={handleRefetchCaptcha} loading={loading}>
          <IconRefresh />
        </ActionIcon>
      </Group>
      <TextInput
        label="کد کپچا"
        {...captchaForm.getInputProps("captchaSolution")}
      />
    </>
  );
}

export default CaptchaFields;
