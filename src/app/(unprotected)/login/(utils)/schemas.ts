import {
  phoneNumberNormalizer,
  phoneNumberValidator,
} from "@persian-tools/persian-tools";
import { z } from "zod";

const mobileSchema = z
  .custom<string>(
    (val) => {
      return typeof val === "string" && phoneNumberValidator(val);
    },
    { message: "شماره موبایل وارد شده معتبر نمی‌باشد." }
  )
  .transform((val) => {
    return phoneNumberNormalizer(val, "0");
  })

export const sendOtpFormSchema =
  z.object({
    mobile: mobileSchema,
  })


export const checkOtpFormSchema =
  z.object({
    mobile: mobileSchema,
    token: z
      .string()
      .trim()
      .regex(/[0-9]/, { message: "لطفا فقط عدد وارد نمایید" })
      .length(5, { message: "کد باید 5 رقم داشته باشد" })
  })

export const passwordLoginFormSchema =
  z.object({
    username: z.string().email("یک ایمیل معتبر وارد نمایید"),
    password: z.string().min(1, "رمز عبور نمی‌تواند خلی باشد"),
  })

export const captchaFormSchema =
  z.object({
    captchaSolution: z.string().min(1, 'کد کپچا نمی‌تواند خالی باشد'),
  })