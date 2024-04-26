import { paths, X_API_KEY } from "@/(shared)/constants";
import { z } from "zod";
import {
  phoneNumberValidator,
  phoneNumberNormalizer,
} from "@persian-tools/persian-tools";

const mobileSchema = z
  .custom<string>(
    (val) => {
      return typeof val === "string" && phoneNumberValidator(val);
    },
    { message: "شماره موبایل وارد شده معتبر نمی‌باشد." }
  )
  .transform((val) => {
    return phoneNumberNormalizer(val, "0");
  });

const otpCodeSchema = z
  .string()
  .trim()
  .regex(/[0-9]/, { message: "لطفا فقط عدد وارد نمایید" })
  .length(5, { message: "کد باید 5 رقم داشته باشد" });

export async function sendOTP(
  formData: FormData
): Promise<{ hasError?: boolean; message?: string }> {
  const mobile = formData.get("mobile") as string | undefined;

  const {
    success,
    data: validatedMobile,
    error,
  } = mobileSchema.safeParse(mobile);

  if (!success) {
    return {
      hasError: true,
      message: error.errors[0].message,
    };
  }

  const response = await fetch(`${paths.register.OTPSend}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${X_API_KEY}`,
    },
    body: JSON.stringify({
      mobile: validatedMobile,
    }),
  }).catch(console.error);

  const resData = await response?.json().catch(console.error);

  if (resData.message === "Verification code has been sent.") {
    return {
      hasError: false,
    };
  } else {
    return {
      hasError: true,
      message: "مشکلی رخ داده است.",
    };
  }
}

export async function checkOTP(formData: FormData) {
  const {
    success,
    data: validatedOtpCode,
    error,
  } = otpCodeSchema.safeParse(formData.get("otpCode"));

  if (!success) {
    return {
      success,
      messageFa: error.errors[0].message,
    };
  }

  const body = {
    mobile: formData.get('mobile'),
    token: validatedOtpCode,
  };

  const response = await fetch(`${paths.register.OTPCheck}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${X_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return data;
}
