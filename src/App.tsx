import { useMemo } from 'react';
import { useAuth } from './auth/useAuth';
import { ThemeStyle } from './components/ThemeStyle';
import { useCurrentPath } from './hooks/useCurrentPath';
import { AppLayout } from './layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SignInPage } from './pages/SignInPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { TasksPage } from './pages/TasksPage';
import { UserPage } from './pages/UserPage';
import { parseRoute } from './routes';

function App() {
  const path = useCurrentPath();
  const route = useMemo(() => parseRoute(path), [path]);
  const auth = useAuth();

  const content = (() => {
    switch (route.name) {
      case 'dashboard':
        return <DashboardPage isSignedIn={auth.isSignedIn} requestWithAuth={auth.requestWithAuth} />;
      case 'signIn':
        return <SignInPage onSignIn={auth.signIn} />;
      case 'tasks':
        return <TasksPage isSignedIn={auth.isSignedIn} requestWithAuth={auth.requestWithAuth} />;
      case 'taskDetail':
        return <TaskDetailPage id={route.id} isSignedIn={auth.isSignedIn} requestWithAuth={auth.requestWithAuth} />;
      case 'user':
        return <UserPage isSignedIn={auth.isSignedIn} requestWithAuth={auth.requestWithAuth} onSignOut={auth.signOut} />;
      default:
        return <NotFoundPage />;
    }
  })();

  return (
    <>
      <ThemeStyle />
      <AppLayout path={path} isSignedIn={auth.isSignedIn}>
        {content}
      </AppLayout>
    </>
  );
}

export default App;
