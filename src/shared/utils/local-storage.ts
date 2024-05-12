const SESSION_TOKEN_KEY = "token";
const USER_X_API_KEY_KEY = "x-api-key";
const REFRESH_TOKEN_KEY = "refresh-token";

function getSessionToken() {
    return localStorage.getItem(SESSION_TOKEN_KEY);
}

function setSessionToken(token: string) {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
}

function removeSessionToken() {
    localStorage.removeItem(SESSION_TOKEN_KEY);
}

function getUserXApiKey() {
    return localStorage.getItem(USER_X_API_KEY_KEY);
}

function setUserXApiKey(xApiKey: string) {
    localStorage.setItem(USER_X_API_KEY_KEY, xApiKey);
}

function removeUserXApiKey() {
    localStorage.removeItem(USER_X_API_KEY_KEY);
}

function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setRefreshToken(refreshToken: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function removeRefreshToken() {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}


export { getSessionToken, setSessionToken, removeSessionToken, getUserXApiKey, setUserXApiKey, removeUserXApiKey, getRefreshToken, setRefreshToken, removeRefreshToken }