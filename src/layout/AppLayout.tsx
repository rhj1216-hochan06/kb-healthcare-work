import { ReactNode } from 'react';
import { SideNavigation } from './SideNavigation';

type AppLayoutProps = {
  path: string;
  isSignedIn: boolean;
  children: ReactNode;
};

export function AppLayout({ path, isSignedIn, children }: AppLayoutProps) {
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
