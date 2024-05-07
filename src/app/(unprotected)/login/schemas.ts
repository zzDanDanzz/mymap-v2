import {
  phoneNumberValidator,
  phoneNumberNormalizer,
} from "@persian-tools/persian-tools";
import { z } from "zod";

export const mobileSchema = z
  .custom<string>(
    (val) => {
      return typeof val === "string" && phoneNumberValidator(val);
    },
    { message: "شماره موبایل وارد شده معتبر نمی‌باشد." }
  )
  .transform((val) => {
    return phoneNumberNormalizer(val, "0");
  });

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/[0-9]/, { message: "لطفا فقط عدد وارد نمایید" })
  .length(5, { message: "کد باید 5 رقم داشته باشد" });
