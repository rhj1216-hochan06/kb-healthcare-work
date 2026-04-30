import { AuthTokenResponse } from '../types';

export const ACCESS_TOKEN_KEY = 'kb-healthcare.access-token';
export const REFRESH_TOKEN_KEY = 'kb-healthcare.refresh-token';

export const getStoredAccessToken = () => window.localStorage.getItem(ACCESS_TOKEN_KEY);

export const getStoredRefreshToken = () => window.localStorage.getItem(REFRESH_TOKEN_KEY);

export const saveTokens = (tokens: AuthTokenResponse) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
};

export const clearStoredTokens = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};
