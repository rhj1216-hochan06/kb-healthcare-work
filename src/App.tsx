import React, {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { api, ApiError } from './api/mockApi';
import {
  AuthTokenResponse,
  DashboardResponse,
  TaskDetailResponse,
  TaskItem,
  UserResponse,
} from './types';
import { colorCssVariableDeclaration } from './utils/colors';

const ACCESS_TOKEN_KEY = 'kb-healthcare.access-token';
const REFRESH_TOKEN_KEY = 'kb-healthcare.refresh-token';
const TASK_ITEM_HEIGHT = 148;
const VIRTUAL_OVERSCAN = 4;

type Route =
  | { name: 'dashboard' }
  | { name: 'signIn' }
  | { name: 'tasks' }
  | { name: 'taskDetail'; id: string }
  | { name: 'user' }
  | { name: 'notFound' };

type IconProps = {
  className?: string;
};

const cx = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(' ');

const parseRoute = (pathname: string): Route => {
  if (pathname === '/') {
    return { name: 'dashboard' };
  }

  if (pathname === '/sign-in') {
    return { name: 'signIn' };
  }

  if (pathname === '/task') {
    return { name: 'tasks' };
  }

  const taskDetailMatch = pathname.match(/^\/task\/([^/]+)$/);

  if (taskDetailMatch) {
    return { name: 'taskDetail', id: decodeURIComponent(taskDetailMatch[1]) };
  }

  if (pathname === '/user') {
    return { name: 'user' };
  }

  return { name: 'notFound' };
};

const navigate = (path: string) => {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }

  window.dispatchEvent(new Event('popstate'));

  if (!window.navigator.userAgent.toLowerCase().includes('jsdom')) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }
};

const useCurrentPath = () => {
  const [path, setPath] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return path;
};

const toApiError = (error: unknown) =>
  error instanceof ApiError ? error : new ApiError(500, '요청 처리 중 문제가 발생했습니다.');

function ThemeStyle() {
  return <style>{`:root {\n${colorCssVariableDeclaration}\n}`}</style>;
}

function DashboardIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 13h6V4H4v9ZM14 20h6V4h-6v16ZM4 20h6v-3H4v3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function TaskIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 7h11M8 12h11M8 17h8M4.5 7h.01M4.5 12h.01M4.5 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SignInIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 17l5-5-5-5M15 12H3M15 4h3a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HealthIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20s-7-4.6-7-10.2A4.2 4.2 0 0 1 12 6a4.2 4.2 0 0 1 7 3.8C19 15.4 12 20 12 20Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.5 12h2l1-2.5 2 5 1-2.5h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const primaryButtonClass = (disabled?: boolean) =>
  cx(
    'inline-flex h-12 items-center justify-center rounded-lg px-5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
    disabled
      ? 'cursor-not-allowed bg-[var(--color-disabled)] text-[var(--color-disabled-text)]'
      : 'bg-[var(--color-primary)] text-[var(--color-black)] hover:bg-[var(--color-primary-hover)]',
  );

const secondaryButtonClass =
  'inline-flex h-12 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-bold text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]';

const dangerButtonClass =
  'inline-flex h-12 items-center justify-center rounded-lg bg-[var(--color-danger)] px-5 text-sm font-bold text-[var(--color-surface)] transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]';

const inputClass =
  'mt-2 h-12 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted-text)] focus:border-[var(--color-focus)] focus:ring-2 focus:ring-[var(--color-focus)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)]';

type ModalProps = {
  title: string;
  children: ReactNode;
  actions: ReactNode;
  onClose: () => void;
};

function Modal({ title, children, actions, onClose }: ModalProps) {
  const titleId = React.useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-bold text-[var(--color-text)]">
            {title}
          </h2>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-[var(--color-muted-text)] transition hover:bg-[var(--color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
            onClick={onClose}
            aria-label="모달 닫기"
          >
            x
          </button>
        </div>
        <div className="text-sm leading-6 text-[var(--color-sub-text)]">{children}</div>
        <div className="mt-6 flex justify-end gap-2">{actions}</div>
      </div>
    </div>
  );
}

type LayoutProps = {
  path: string;
  isSignedIn: boolean;
  children: ReactNode;
};

function AppLayout({ path, isSignedIn, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans text-[var(--color-text)] md:flex">
      <SideNavigation path={path} isSignedIn={isSignedIn} variant="mobile" />
      <SideNavigation path={path} isSignedIn={isSignedIn} variant="desktop" />
      <main className="min-h-screen flex-1 px-5 py-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

type SideNavigationProps = {
  path: string;
  isSignedIn: boolean;
  variant: 'desktop' | 'mobile';
};

function SideNavigation({ path, isSignedIn, variant }: SideNavigationProps) {
  const navItems = [
    { label: '대시보드', path: '/', icon: DashboardIcon, isActive: path === '/' },
    { label: '할 일', path: '/task', icon: TaskIcon, isActive: path === '/task' || path.startsWith('/task/') },
    {
      label: isSignedIn ? '회원정보' : '로그인',
      path: isSignedIn ? '/user' : '/sign-in',
      icon: isSignedIn ? UserIcon : SignInIcon,
      isActive: isSignedIn ? path === '/user' : path === '/sign-in',
    },
  ];

  const containerClass =
    variant === 'desktop'
      ? 'sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar)] px-5 py-6 md:flex'
      : 'sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-sidebar)] px-4 py-3 md:hidden';

  return (
    <aside className={containerClass}>
      <div className={variant === 'desktop' ? 'mb-8' : 'mb-3 flex items-center justify-between'}>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-3 rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
          aria-label="대시보드로 이동"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-black)]">
            <HealthIcon className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-base font-extrabold text-[var(--color-black)]">KB Healthcare</span>
            <span className="block text-xs font-semibold text-[var(--color-muted-text)]">Task Console</span>
          </span>
        </button>
      </div>
      <nav aria-label="주요 메뉴" className={variant === 'desktop' ? 'space-y-2' : 'grid grid-cols-3 gap-2'}>
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.path}
              href={item.path}
              aria-current={item.isActive ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault();
                navigate(item.path);
              }}
              className={cx(
                'flex items-center gap-3 rounded-lg border px-3 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]',
                variant === 'mobile' && 'justify-center',
                item.isActive
                  ? 'border-[var(--color-primary-border)] bg-[var(--color-primary-soft)] text-[var(--color-black)]'
                  : 'border-transparent text-[var(--color-sub-text)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)]',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={variant === 'mobile' ? 'hidden sm:inline' : undefined}>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-2 text-sm font-extrabold text-[var(--color-warning)]">{eyebrow}</p>
        <h1 className="text-3xl font-extrabold tracking-normal text-[var(--color-text)]">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-sub-text)]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

function AuthRequired() {
  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
      <div className="flex max-w-xl flex-col gap-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-black)]">
          <SignInIcon className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--color-text)]">로그인이 필요한 화면입니다</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-sub-text)]">
            API 계약의 bearer 인증 기준에 맞춰 로그인 이후 데이터를 표시합니다.
          </p>
        </div>
        <button type="button" className={primaryButtonClass()} onClick={() => navigate('/sign-in')}>
          로그인으로 이동
        </button>
      </div>
    </section>
  );
}

type DashboardPageProps = {
  accessToken: string | null;
};

function DashboardPage({ accessToken }: DashboardPageProps) {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    if (!accessToken) {
      setDashboard(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    api
      .getDashboard(accessToken)
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
  }, [accessToken]);

  if (!accessToken) {
    return <AuthRequired />;
  }

  const cards = dashboard
    ? [
        { label: '일', value: dashboard.numOfTask, tone: 'bg-[var(--color-primary-soft)] text-[var(--color-black)]' },
        { label: '해야할 일', value: dashboard.numOfRestTask, tone: 'bg-[var(--color-warning-soft)] text-[var(--color-text)]' },
        { label: '한 일', value: dashboard.numOfDoneTask, tone: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
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
                <p className="mt-2 text-sm font-semibold text-[var(--color-muted-text)]">numOf{card.label === '일' ? 'Task' : card.label === '해야할 일' ? 'RestTask' : 'DoneTask'}</p>
              </article>
            ))}
      </section>
    </>
  );
}

type ErrorPanelProps = {
  error: ApiError;
};

function ErrorPanel({ error }: ErrorPanelProps) {
  return (
    <div className="mb-4 rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-4 text-sm font-semibold text-[var(--color-danger)]">
      {error.status}: {error.errorMessage}
    </div>
  );
}

type SignInPageProps = {
  onSignIn: (tokens: AuthTokenResponse) => void;
};

function SignInPage({ onSignIn }: SignInPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,24}$/.test(password);
  const canSubmit = isEmailValid && isPasswordValid && !isSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ email: true, password: true });

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      const tokens = await api.signIn({ email, password });
      onSignIn(tokens);
      navigate('/');
    } catch (requestError) {
      setErrorMessage(toApiError(requestError).errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Sign in" title="로그인" description="유효한 email과 영문/숫자 조합의 비밀번호로 제출할 수 있습니다." />
      <section className="max-w-xl rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="text-sm font-bold text-[var(--color-text)]">
              email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, email: true }))}
              aria-invalid={touched.email && !isEmailValid}
              aria-describedby="email-error"
              autoComplete="email"
            />
            <p id="email-error" className="mt-2 min-h-5 text-sm font-semibold text-[var(--color-danger)]">
              {touched.email && !isEmailValid ? 'email 규약에 맞는 문자열을 입력해주세요.' : ''}
            </p>
          </div>
          <div className="mt-5">
            <label htmlFor="password" className="text-sm font-bold text-[var(--color-text)]">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={inputClass}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              aria-invalid={touched.password && !isPasswordValid}
              aria-describedby="password-error"
              autoComplete="current-password"
            />
            <p id="password-error" className="mt-2 min-h-5 text-sm font-semibold text-[var(--color-danger)]">
              {touched.password && !isPasswordValid ? '영문, 숫자로 구성된 8~24글자 문자열을 입력해주세요.' : ''}
            </p>
          </div>
          <button type="submit" className={cx('mt-6 w-full', primaryButtonClass(!canSubmit))} disabled={!canSubmit}>
            {isSubmitting ? '제출 중' : '제출'}
          </button>
        </form>
      </section>
      {errorMessage ? (
        <Modal
          title="로그인 실패"
          onClose={() => setErrorMessage('')}
          actions={
            <button type="button" className={primaryButtonClass()} onClick={() => setErrorMessage('')}>
              확인
            </button>
          }
        >
          {errorMessage}
        </Modal>
      ) : null}
    </>
  );
}

type TasksPageProps = {
  accessToken: string | null;
};

function TasksPage({ accessToken }: TasksPageProps) {
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
      if (!accessToken || isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const result = await api.getTasks(accessToken, nextPage);
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
    [accessToken],
  );

  useEffect(() => {
    if (!accessToken) {
      setTasks([]);
      return;
    }

    setTasks([]);
    setPage(0);
    setHasNext(true);
    setScrollTop(0);
    loadPage(1, true);
  }, [accessToken, loadPage]);

  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(containerRef.current?.clientHeight || 560);
    };

    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    return () => window.removeEventListener('resize', updateViewportHeight);
  }, []);

  if (!accessToken) {
    return <AuthRequired />;
  }

  const startIndex = Math.max(0, Math.floor(scrollTop / TASK_ITEM_HEIGHT) - VIRTUAL_OVERSCAN);
  const visibleCount = Math.ceil(viewportHeight / TASK_ITEM_HEIGHT) + VIRTUAL_OVERSCAN * 2;
  const endIndex = Math.min(tasks.length, startIndex + visibleCount);
  const visibleTasks = tasks.slice(startIndex, endIndex);
  const totalHeight = tasks.length * TASK_ITEM_HEIGHT;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
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
                <div key={task.id} style={{ height: TASK_ITEM_HEIGHT }} className="p-2">
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

type TaskCardProps = {
  task: TaskItem;
};

function TaskCard({ task }: TaskCardProps) {
  return (
    <button
      type="button"
      className="flex h-full w-full items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-left transition hover:border-[var(--color-primary-border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
      onClick={() => navigate(`/task/${encodeURIComponent(task.id)}`)}
      aria-label={`${task.title} 상세 페이지로 이동`}
      role="listitem"
    >
      <span className="min-w-0">
        <span className="mb-2 flex items-center gap-2">
          <StatusBadge status={task.status} />
          <span className="text-xs font-bold text-[var(--color-muted-text)]">{task.id}</span>
        </span>
        <span className="block truncate text-lg font-extrabold text-[var(--color-text)]">{task.title}</span>
        <span className="mt-2 block line-clamp-2 text-sm leading-6 text-[var(--color-sub-text)]">{task.memo}</span>
      </span>
      <ChevronIcon className="h-5 w-5 shrink-0 text-[var(--color-muted-text)]" />
    </button>
  );
}

type StatusBadgeProps = {
  status: TaskItem['status'];
};

function StatusBadge({ status }: StatusBadgeProps) {
  const isDone = status === 'DONE';

  return (
    <span
      className={cx(
        'inline-flex rounded-lg px-2.5 py-1 text-xs font-extrabold',
        isDone ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]' : 'bg-[var(--color-primary-soft)] text-[var(--color-black)]',
      )}
    >
      {isDone ? 'DONE' : 'TODO'}
    </span>
  );
}

type TaskDetailPageProps = {
  accessToken: string | null;
  id: string;
};

function TaskDetailPage({ accessToken, id }: TaskDetailPageProps) {
  const [detail, setDetail] = useState<TaskDetailResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const canDelete = confirmId === id;

  useEffect(() => {
    let ignore = false;

    if (!accessToken) {
      setDetail(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    api
      .getTaskDetail(accessToken, id)
      .then((result) => {
        if (!ignore) {
          setDetail(result);
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
  }, [accessToken, id]);

  const handleDelete = async () => {
    if (!canDelete) {
      return;
    }

    try {
      await api.deleteTask(accessToken, id);
      navigate('/task');
    } catch (requestError) {
      setDeleteErrorMessage(toApiError(requestError).errorMessage);
    }
  };

  if (!accessToken) {
    return <AuthRequired />;
  }

  if (error?.status === 404) {
    return <MissingTask id={id} />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Task Detail"
        title={id}
        description="할 일 상세 내용과 등록일을 확인합니다."
        action={
          <button type="button" className={dangerButtonClass} onClick={() => setIsDeleteModalOpen(true)}>
            삭제
          </button>
        }
      />
      {error ? <ErrorPanel error={error} /> : null}
      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8" aria-busy={isLoading}>
        {isLoading && !detail ? (
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded-lg bg-[var(--color-disabled)]" />
            <div className="h-24 animate-pulse rounded-lg bg-[var(--color-disabled)]" />
          </div>
        ) : detail ? (
          <div className="space-y-8">
            <div>
              <p className="mb-2 text-sm font-bold text-[var(--color-muted-text)]">title</p>
              <h2 className="text-2xl font-extrabold text-[var(--color-text)]">{detail.title}</h2>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-[var(--color-muted-text)]">memo</p>
              <p className="rounded-lg bg-[var(--color-surface-muted)] p-5 text-base leading-7 text-[var(--color-sub-text)]">{detail.memo}</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-[var(--color-muted-text)]">registerDatetime</p>
              <p className="text-base font-bold text-[var(--color-text)]">{new Date(detail.registerDatetime).toLocaleString('ko-KR')}</p>
            </div>
          </div>
        ) : null}
      </section>
      {isDeleteModalOpen ? (
        <Modal
          title="삭제 확인"
          onClose={() => {
            setIsDeleteModalOpen(false);
            setConfirmId('');
            setDeleteErrorMessage('');
          }}
          actions={
            <>
              <button type="button" className={secondaryButtonClass} onClick={() => setIsDeleteModalOpen(false)}>
                취소
              </button>
              <button type="button" className={primaryButtonClass(!canDelete)} disabled={!canDelete} onClick={handleDelete}>
                제출
              </button>
            </>
          }
        >
          <label htmlFor="delete-confirm-id" className="block text-sm font-bold text-[var(--color-text)]">
            삭제하려면 {id}를 입력해주세요.
          </label>
          <input
            id="delete-confirm-id"
            className={inputClass}
            value={confirmId}
            onChange={(event) => setConfirmId(event.target.value)}
            aria-describedby="delete-confirm-error"
          />
          <p id="delete-confirm-error" className="mt-2 min-h-5 text-sm font-semibold text-[var(--color-danger)]">
            {deleteErrorMessage}
          </p>
        </Modal>
      ) : null}
    </>
  );
}

function MissingTask({ id }: { id: string }) {
  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
      <p className="mb-2 text-sm font-extrabold text-[var(--color-danger)]">404</p>
      <h1 className="text-2xl font-extrabold text-[var(--color-text)]">리소스가 없습니다</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--color-sub-text)]">{id}에 해당하는 할 일을 찾을 수 없습니다.</p>
      <button type="button" className={cx('mt-6', primaryButtonClass())} onClick={() => navigate('/task')}>
        목록으로 돌아가기
      </button>
    </section>
  );
}

type UserPageProps = {
  accessToken: string | null;
  onSignOut: () => void;
};

function UserPage({ accessToken, onSignOut }: UserPageProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    if (!accessToken) {
      setUser(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    api
      .getUser(accessToken)
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
  }, [accessToken]);

  if (!accessToken) {
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

function NotFoundPage() {
  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
      <p className="mb-2 text-sm font-extrabold text-[var(--color-warning)]">Not Found</p>
      <h1 className="text-2xl font-extrabold text-[var(--color-text)]">페이지를 찾을 수 없습니다</h1>
      <button type="button" className={cx('mt-6', primaryButtonClass())} onClick={() => navigate('/')}>
        대시보드로 이동
      </button>
    </section>
  );
}

function App() {
  const path = useCurrentPath();
  const route = useMemo(() => parseRoute(path), [path]);
  const [accessToken, setAccessToken] = useState(() => window.localStorage.getItem(ACCESS_TOKEN_KEY));
  const isSignedIn = Boolean(accessToken);

  const handleSignIn = (tokens: AuthTokenResponse) => {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    setAccessToken(tokens.accessToken);
  };

  const handleSignOut = () => {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    navigate('/sign-in');
  };

  const content = (() => {
    switch (route.name) {
      case 'dashboard':
        return <DashboardPage accessToken={accessToken} />;
      case 'signIn':
        return <SignInPage onSignIn={handleSignIn} />;
      case 'tasks':
        return <TasksPage accessToken={accessToken} />;
      case 'taskDetail':
        return <TaskDetailPage accessToken={accessToken} id={route.id} />;
      case 'user':
        return <UserPage accessToken={accessToken} onSignOut={handleSignOut} />;
      default:
        return <NotFoundPage />;
    }
  })();

  return (
    <>
      <ThemeStyle />
      <AppLayout path={path} isSignedIn={isSignedIn}>
        {content}
      </AppLayout>
    </>
  );
}

export default App;
