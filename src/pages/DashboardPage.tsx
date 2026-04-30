import { useEffect, useState } from 'react';
import { api, ApiError } from '../api/mockApi';
import { RequestWithAuth } from '../auth/useAuth';
import { AuthRequired } from '../components/AuthRequired';
import { ErrorPanel } from '../components/ui/ErrorPanel';
import { PageHeader } from '../components/ui/PageHeader';
import { DashboardResponse } from '../types';
import { toApiError } from '../utils/apiError';
import { cx } from '../utils/cx';

type DashboardPageProps = {
  isSignedIn: boolean;
  requestWithAuth: RequestWithAuth;
};

export function DashboardPage({ isSignedIn, requestWithAuth }: DashboardPageProps) {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    if (!isSignedIn) {
      setDashboard(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    requestWithAuth((accessToken) => api.getDashboard(accessToken))
      .then((result) => {
        if (!ignore) {
          setDashboard(result);
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

  const cards = dashboard
    ? [
        { label: '일', value: dashboard.numOfTask, code: 'numOfTask', tone: 'bg-[var(--color-primary-soft)] text-[var(--color-black)]' },
        { label: '해야할 일', value: dashboard.numOfRestTask, code: 'numOfRestTask', tone: 'bg-[var(--color-warning-soft)] text-[var(--color-text)]' },
        { label: '한 일', value: dashboard.numOfDoneTask, code: 'numOfDoneTask', tone: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
      ]
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="오늘의 업무 현황"
        description="건강관리 업무의 전체 수와 진행 상태를 빠르게 확인합니다."
      />
      {error ? <ErrorPanel error={error} /> : null}
      <section className="grid gap-4 md:grid-cols-3" aria-busy={isLoading}>
        {isLoading && !dashboard
          ? [0, 1, 2].map((item) => (
              <div key={item} className="h-36 animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
            ))
          : cards.map((card) => (
              <article key={card.label} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <div className={cx('mb-5 inline-flex rounded-lg px-3 py-2 text-sm font-extrabold', card.tone)}>{card.label}</div>
                <p className="text-4xl font-extrabold text-[var(--color-text)]">{card.value.toLocaleString('ko-KR')}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-muted-text)]">{card.code}</p>
              </article>
            ))}
      </section>
    </>
  );
}
