import { useEffect, useState } from 'react';
import { api, ApiError } from '../api/mockApi';
import { RequestWithAuth } from '../auth/useAuth';
import { AuthRequired } from '../components/AuthRequired';
import { UserIcon } from '../components/icons';
import { ErrorPanel } from '../components/ui/ErrorPanel';
import { PageHeader } from '../components/ui/PageHeader';
import { secondaryButtonClass } from '../components/ui/buttonStyles';
import { UserResponse } from '../types';
import { toApiError } from '../utils/apiError';

type UserPageProps = {
  isSignedIn: boolean;
  onSignOut: () => void;
  requestWithAuth: RequestWithAuth;
};

export function UserPage({ isSignedIn, onSignOut, requestWithAuth }: UserPageProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    if (!isSignedIn) {
      setUser(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    requestWithAuth((accessToken) => api.getUser(accessToken))
      .then((result) => {
        if (!ignore) {
          setUser(result);
        }
      })
      .catch((requestError) => {
        if (!ignore) {
          setError(toApiError(requestError));
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isSignedIn, requestWithAuth]);

  if (!isSignedIn) {
    return <AuthRequired />;
  }

  return (
    <>
      <PageHeader
        eyebrow="User"
        title="회원정보"
        description="인증된 사용자에게 제공되는 프로필 정보를 표시합니다."
        action={
          <button type="button" className={secondaryButtonClass} onClick={onSignOut}>
            로그아웃
          </button>
        }
      />
      {error ? <ErrorPanel error={error} /> : null}
      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8" aria-busy={isLoading}>
        {isLoading && !user ? (
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--color-disabled)]" />
            <div className="h-20 animate-pulse rounded-lg bg-[var(--color-disabled)]" />
          </div>
        ) : user ? (
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-black)]">
              <UserIcon className="h-8 w-8" />
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--color-muted-text)]">name</p>
              <h2 className="mt-1 text-2xl font-extrabold text-[var(--color-text)]">{user.name}</h2>
              <p className="mt-4 rounded-lg bg-[var(--color-surface-muted)] p-5 text-base leading-7 text-[var(--color-sub-text)]">{user.memo}</p>
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
