import { getSessionToken, getUserXApiKey } from "@shared/utils/local-storage";

export function getCommonHeaders() {
  return {
    token: getSessionToken(),
    "x-api-key": getUserXApiKey(),
  };
}
