import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { X_API_KEY } from "@shared/config";

interface SendOtpReturn {
  success: boolean;
};

export async function sendOTP(formData: FormData): Promise<SendOtpReturn> {
  const { mobile } = Object.fromEntries(formData);

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
    .catch(console.error);
  console.log("🚀 ~ sendOTP ~ res:", res)

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

type CheckOtpErrorReturn = {
  success: false
};


type CheckOtpSuccessReturn = {
  success: true,
  sessionToken: string;
  refreshToken: string;
};

type CheckOtpReturn = CheckOtpErrorReturn | CheckOtpSuccessReturn

export async function checkOTP(formData: FormData): Promise<CheckOtpReturn> {
  const { mobile, token } = Object.fromEntries(formData);

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
      success: true,
      sessionToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
    };
  }

  return {
    success: false,
  };
}
