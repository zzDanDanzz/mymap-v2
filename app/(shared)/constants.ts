export const { X_API_KEY, API_BASE } = process.env;

export const paths = {
  register: {
    mySelf: `${API_BASE}/register/users/my-self`,
    OTPSend: `${API_BASE}/register/otp/send`,
    OTPCheck: `${API_BASE}/register/otp/check`,
  },
};
