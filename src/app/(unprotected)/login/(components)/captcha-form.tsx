import { ActionIcon, Group, TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { captchaFormSchema } from "../schemas";
import { z } from "zod";
import Image from "next/image";
import { IconRefresh } from "@tabler/icons-react";

function CaptchaFields({
  captchaForm,
  captcha,
  setCaptcha,
}: {
  captchaForm: UseFormReturnType<z.infer<typeof captchaFormSchema>>;
  captcha: Captcha;
  setCaptcha: (captcha: Captcha) => void;
}) {
  return (
    <Group>
      <TextInput
        label="کد کپچا"
        {...captchaForm.getInputProps("captchaSolution")}
      />
      <Image alt="captcha" src={captcha.imgUrl} />
      <ActionIcon>
        <IconRefresh />
      </ActionIcon>
    </Group>
  );
}

export default CaptchaFields;
