import { API_BASE, MY_API_BASE } from "@shared/config";

const urls = {
  register: {
    mySelf: `${API_BASE}/register/users/my-self`,
    OTPSend: `${API_BASE}/register/otp/send`,
    OTPCheck: `${API_BASE}/register/otp/check`,
    apps: `${API_BASE}/register/apps`,
    login: `${API_BASE}/register/tokens/user`,
    captcha: `${API_BASE}/captcha/new/easy/5/600`,
  },
  datasources: `${MY_API_BASE}/mym/datasources`,
};

export default urls;
