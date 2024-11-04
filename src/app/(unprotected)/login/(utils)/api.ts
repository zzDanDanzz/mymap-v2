import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { X_API_KEY } from "@shared/config";
import { z } from "zod";
import {
  captchaFormSchema,
  checkOtpFormSchema,
  passwordLoginFormSchema,
  sendOtpFormSchema,
} from "./schemas";

export async function sendOTP({ mobile }: z.infer<typeof sendOtpFormSchema>) {
  const res = await ax.post(
    `${urls.register.OTPSend}`,
    {
      mobile,
    },
    {
      headers: {
        "x-api-key": `${X_API_KEY}`,
      },
    }
  );

  if (res?.data?.message === "Verification code has been sent.") {
    return {
      success: true,
    };
  }

  return {
    success: false,
  };
}

interface CheckOtpResponse {
  token_type?: string;
  expires_in?: number;
  access_token?: string;
  refresh_token?: string;
  role?: string;
}

export async function checkOTP({
  mobile,
  token,
}: z.infer<typeof checkOtpFormSchema>) {
  const res = await ax.post<CheckOtpResponse>(
    `${urls.register.OTPCheck}`,
    {
      mobile,
      token,
    },
    {
      headers: {
        "x-api-key": `${X_API_KEY}`,
      },
    }
  );

  if (res.data.access_token && res.data.refresh_token) {
    return {
      success: true as const,
      sessionToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
    };
  }

  return {
    success: false as const,
  };
}

type CaptchaData = z.infer<typeof captchaFormSchema> & {
  captchaId: string;
};

type PasswordLogin = z.infer<typeof passwordLoginFormSchema> &
  Partial<CaptchaData>;

export async function passwordLogin({
  username,
  password,
  captchaSolution,
  captchaId,
}: PasswordLogin) {
  const res = await ax.post(
    `${urls.register.login}`,
    {
      grant_type: "password",
      client_id: 1,
      client_secret: "MapIr",
      username,
      password,
      ...(captchaSolution &&
        captchaId && {
          captcha_id: captchaId,
          captcha_solution: captchaSolution,
        }),
    },
    {
      headers: {
        "x-api-key": `${X_API_KEY}`,
      },
    }
  );

  if (res.data?.access_token && res.data?.refresh_token) {
    return {
      success: true as const,
      sessionToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
    };
  }

  if (res.status === 400) {
    return {
      success: false as const,
      requiresCaptcha: true as const,
      message: "کد کپچا را وارد کنید.",
    };
  }

  if (res.status === 404) {
    return {
      success: false as const,
      message: "نام کاربری یا رمز عبور اشتباه است.",
    };
  }

  return {
    success: false as const,
    message: "هنگام ورود به سیستم خطایی رخ داده است.",
  };
}

export async function getCaptcha() {
  const res = await ax.post<{ id: string; png: string }>(
    `${urls.register.captcha}`,
    {
      headers: {
        "x-api-key": `${X_API_KEY}`,
      },
    }
  );

  if (res.data.id && res.data.png) {
    return {
      success: true as const,
      id: res.data.id,
      imgUrl: res.data.png,
    };
  }

  return {
    success: false as const,
    message: "هنگام دریافت کپچا خطایی رخ داده است.",
  };
}
