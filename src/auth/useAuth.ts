import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from '../api/mockApi';
import { AuthTokenResponse } from '../types';
import { navigate } from '../routes';
import { toApiError } from '../utils/apiError';
import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  saveTokens,
} from './tokenStorage';

type StoredTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

export type RequestWithAuth = <Response>(
  request: (accessToken: string) => Promise<Response>,
) => Promise<Response>;

export const useAuth = () => {
  const [tokens, setTokens] = useState<StoredTokens>(() => ({
    accessToken: getStoredAccessToken(),
    refreshToken: getStoredRefreshToken(),
  }));
  const accessTokenRef = useRef(tokens.accessToken);
  const refreshTokenRef = useRef(tokens.refreshToken);
  const refreshPromiseRef = useRef<Promise<string> | null>(null);

  const setTokenState = useCallback((nextTokens: StoredTokens) => {
    accessTokenRef.current = nextTokens.accessToken;
    refreshTokenRef.current = nextTokens.refreshToken;
    setTokens(nextTokens);
  }, []);

  const persistTokens = useCallback(
    (nextTokens: AuthTokenResponse) => {
      saveTokens(nextTokens);
      setTokenState(nextTokens);
    },
    [setTokenState],
  );

  const clearAuth = useCallback(() => {
    clearStoredTokens();
    setTokenState({ accessToken: null, refreshToken: null });
  }, [setTokenState]);

  const signIn = useCallback(
    (nextTokens: AuthTokenResponse) => {
      persistTokens(nextTokens);
    },
    [persistTokens],
  );

  const signOut = useCallback(() => {
    clearAuth();
    navigate('/sign-in');
  }, [clearAuth]);

  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const currentRefreshToken = refreshTokenRef.current;

    if (!currentRefreshToken) {
      clearAuth();
      throw new ApiError(401, 'refreshToken이 없어 다시 로그인해주세요.');
    }

    // 과제용 mock에서는 저장된 refreshToken을 cookie 대신 함수 인자로 전달합니다.
    const refreshPromise = api
      .refreshToken(currentRefreshToken)
      .then((nextTokens) => {
        persistTokens(nextTokens);
        return nextTokens.accessToken;
      })
      .catch((error) => {
        clearAuth();
        throw toApiError(error);
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    refreshPromiseRef.current = refreshPromise;
    return refreshPromise;
  }, [clearAuth, persistTokens]);

  const requestWithAuth: RequestWithAuth = useCallback(
    async (request) => {
      let currentAccessToken = accessTokenRef.current;

      if (!currentAccessToken) {
        currentAccessToken = await refreshAccessToken();
      }

      try {
        return await request(currentAccessToken);
      } catch (error) {
        const apiError = toApiError(error);

        if (apiError.status !== 401) {
          throw apiError;
        }

        const refreshedAccessToken = await refreshAccessToken();
        return request(refreshedAccessToken);
      }
    },
    [refreshAccessToken],
  );

  useEffect(() => {
    if (!accessTokenRef.current && refreshTokenRef.current) {
      refreshAccessToken().catch(() => undefined);
    }
  }, [refreshAccessToken]);

  return {
    accessToken: tokens.accessToken,
    isSignedIn: Boolean(tokens.accessToken || tokens.refreshToken),
    refreshAccessToken,
    requestWithAuth,
    signIn,
    signOut,
  };
};
