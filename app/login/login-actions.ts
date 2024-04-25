'use server';

import { paths, X_API_KEY } from "@/(shared)/constants";

export async function sendOTP(prevState: any, formData: FormData) {
  const mobile = formData.get("mobile");

  const response = await fetch(`${paths.register.OTPSend}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${X_API_KEY}`,
    },
    body: JSON.stringify({
      mobile,
    }),
  });

  const data = await response.json();

  return data;
}
