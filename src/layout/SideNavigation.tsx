import {
  DashboardIcon,
  HealthIcon,
  IconProps,
  SignInIcon,
  TaskIcon,
  UserIcon,
} from '../components/icons';
import { ReactElement } from 'react';
import { navigate } from '../routes';
import { cx } from '../utils/cx';

type SideNavigationProps = {
  path: string;
  isSignedIn: boolean;
  variant: 'desktop' | 'mobile';
};

type NavItem = {
  label: string;
  path: string;
  icon: (props: IconProps) => ReactElement;
  isActive: boolean;
};

export function SideNavigation({ path, isSignedIn, variant }: SideNavigationProps) {
  const navItems: NavItem[] = [
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
