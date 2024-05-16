import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { X_API_KEY } from "@shared/config";
import { z } from "zod";
import { captchaFormSchema, checkOtpFormSchema, passwordLoginFormSchema, sendOtpFormSchema } from "./schemas";


export async function sendOTP({ mobile }: z.infer<typeof sendOtpFormSchema>) {

  const res = await ax
    .post(
      `${urls.register.OTPSend}`,
      {
        mobile,
      },
      {
        headers: {
          "x-api-key": `${X_API_KEY}`,
        },
      }
    )

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


export async function checkOTP({ mobile, token }: z.infer<typeof checkOtpFormSchema>) {

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
}

type PasswordLogin = z.infer<typeof passwordLoginFormSchema> & Partial<CaptchaData>;

export async function passwordLogin({ username, password, captchaSolution, captchaId }: PasswordLogin) {

  const res = await ax.post(
    `${urls.register.login}`,
    {
      grant_type: 'password',
      client_id: 1,
      client_secret: 'MapIr',
      username,
      password,
      ...((captchaSolution && captchaId) && {
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


}

