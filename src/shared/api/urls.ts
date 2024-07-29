import { MAPIR_API_BASE, MYMAP_API_BASE } from "@shared/config";

const urls = {
  register: {
    mySelf: `${MAPIR_API_BASE}/register/users/my-self`,
    OTPSend: `${MAPIR_API_BASE}/register/otp/send`,
    OTPCheck: `${MAPIR_API_BASE}/register/otp/check`,
    apps: `${MAPIR_API_BASE}/register/apps`,
    login: `${MAPIR_API_BASE}/register/tokens/user`,
    captcha: `${MAPIR_API_BASE}/captcha/new/easy/5/600`,
  },

  transfer: {
    import: `/transfer/import`,
    export: `/transfer/export`,
  },

  mapStyles: {
    "Dove-style": `${MAPIR_API_BASE}/vector/styles/main/mapir-Dove-style.json`,
    "xyz-style": `${MAPIR_API_BASE}/vector/styles/main/mapir-xyz-style.json`,
  },

  datasources: `${MYMAP_API_BASE}/mym/datasources`,
  editorTables: `${MYMAP_API_BASE}/editor/tables`,
};

export default urls;
