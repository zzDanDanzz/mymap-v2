export const {
  NEXT_PUBLIC_API_BASE: API_BASE,
  NEXT_PUBLIC_X_API_KEY: X_API_KEY,
} = process.env;

export const paths = {
  register: {
    mySelf: `${API_BASE}/register/users/my-self`,
    OTPSend: `${API_BASE}/register/otp/send`,
    OTPCheck: `${API_BASE}/register/otp/check`,
  },
};
