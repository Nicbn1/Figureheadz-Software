import { setAuthTokenGetter } from "@workspace/api-client-react";

const ADMIN_TOKEN_KEY = "figureheadz_admin_token";

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

// Initialize on load
setAuthTokenGetter(getAdminToken);
