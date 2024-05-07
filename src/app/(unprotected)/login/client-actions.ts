import { ax } from "@shared/api/axios-instance";
import urls from "@shared/api/urls";
import { X_API_KEY } from "@shared/config";

type ActionReturnType = {
  success: boolean;
};

export async function sendOTP(formData: FormData): Promise<ActionReturnType> {
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

interface CheckOTPResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
  role: string;
}

export async function checkOTP(formData: FormData): Promise<ActionReturnType> {
  const { mobile, token } = Object.fromEntries(formData);

  const res = await ax.post<CheckOTPResponse>(
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
  
  

  console.log({ res });


  return {
    success: true,
  };
}
