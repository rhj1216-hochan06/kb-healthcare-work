import { UIEvent, useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from '../api/mockApi';
import { RequestWithAuth } from '../auth/useAuth';
import { AuthRequired } from '../components/AuthRequired';
import { TaskCard } from '../components/tasks/TaskCard';
import { ErrorPanel } from '../components/ui/ErrorPanel';
import { PageHeader } from '../components/ui/PageHeader';
import { TaskItem } from '../types';
import { toApiError } from '../utils/apiError';

const TASK_ITEM_HEIGHT = 148;
const VIRTUAL_OVERSCAN = 4;

type TasksPageProps = {
  isSignedIn: boolean;
  requestWithAuth: RequestWithAuth;
};

export function TasksPage({ isSignedIn, requestWithAuth }: TasksPageProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(560);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const loadPage = useCallback(
    async (nextPage: number, replace = false) => {
      if (!isSignedIn || isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const result = await requestWithAuth((accessToken) => api.getTasks(accessToken, nextPage));
        setTasks((current) => (replace ? result.data : [...current, ...result.data]));
        setHasNext(result.hasNext);
        setPage(nextPage);
      } catch (requestError) {
        setError(toApiError(requestError));
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [isSignedIn, requestWithAuth],
  );

  useEffect(() => {
    if (!isSignedIn) {
      setTasks([]);
      return;
    }

    setTasks([]);
    setPage(0);
    setHasNext(true);
    setScrollTop(0);
    loadPage(1, true);
  }, [isSignedIn, loadPage]);

  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(containerRef.current?.clientHeight || 560);
    };

    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    return () => window.removeEventListener('resize', updateViewportHeight);
  }, []);

  if (!isSignedIn) {
    return <AuthRequired />;
  }

  const startIndex = Math.max(0, Math.floor(scrollTop / TASK_ITEM_HEIGHT) - VIRTUAL_OVERSCAN);
  const visibleCount = Math.ceil(viewportHeight / TASK_ITEM_HEIGHT) + VIRTUAL_OVERSCAN * 2;
  const endIndex = Math.min(tasks.length, startIndex + visibleCount);
  const visibleTasks = tasks.slice(startIndex, endIndex);
  const totalHeight = tasks.length * TASK_ITEM_HEIGHT;

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    setScrollTop(target.scrollTop);

    const isNearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - TASK_ITEM_HEIGHT * 2;

    if (isNearBottom && hasNext && !isLoading) {
      loadPage(page + 1);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Tasks"
        title="할 일 목록"
        description="카드는 보이는 영역 중심으로 렌더링하고, 끝에 가까워지면 다음 페이지를 불러옵니다."
      />
      {error ? <ErrorPanel error={error} /> : null}
      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 md:p-4">
        <div
          ref={containerRef}
          className="h-[68vh] overflow-y-auto rounded-lg bg-[var(--color-surface-muted)]"
          onScroll={handleScroll}
          role="list"
          aria-label="할 일 카드 목록"
          aria-busy={isLoading}
        >
          <div style={{ height: totalHeight || TASK_ITEM_HEIGHT, position: 'relative' }}>
            <div style={{ transform: `translateY(${startIndex * TASK_ITEM_HEIGHT}px)` }}>
              {visibleTasks.map((task) => (
                <div key={task.id} style={{ height: TASK_ITEM_HEIGHT }} className="p-2" role="listitem">
                  <TaskCard task={task} />
                </div>
              ))}
              {!tasks.length && isLoading ? (
                <div className="p-2">
                  <div className="h-32 animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between px-1 text-sm font-semibold text-[var(--color-muted-text)]">
          <span>렌더링 {visibleTasks.length}개 / 로드 {tasks.length}개</span>
          <span>{isLoading ? '불러오는 중' : hasNext ? '다음 페이지 대기' : '마지막 목록'}</span>
        </div>
      </section>
    </>
  );
}
