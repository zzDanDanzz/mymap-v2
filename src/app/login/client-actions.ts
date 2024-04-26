import { ax } from "@shared/api/axios-instance";
import { X_API_KEY, paths } from "@shared/constants";

type ActionReturnType = {
  success: boolean;
};

export async function sendOTP(formData: FormData): Promise<ActionReturnType> {
  const { mobile } = Object.fromEntries(formData);

  const res = await ax
    .post(
      `${paths.register.OTPSend}`,
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

  if (res?.data?.message === "Verification code has been sent.") {
    return {
      success: true,
    };
  }

  return {
    success: false,
  };
}

export async function checkOTP(formData: FormData): Promise<ActionReturnType> {
  const { mobile, token } = Object.fromEntries(formData);

  const res = await ax.post(
    `${paths.register.OTPSend}`,
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

  return {
    success: true,
  };
}
