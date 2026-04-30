export type Route =
  | { name: 'dashboard' }
  | { name: 'signIn' }
  | { name: 'tasks' }
  | { name: 'taskDetail'; id: string }
  | { name: 'user' }
  | { name: 'notFound' };

export const parseRoute = (pathname: string): Route => {
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

export const navigate = (path: string) => {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }

  window.dispatchEvent(new Event('popstate'));

  if (!window.navigator.userAgent.toLowerCase().includes('jsdom')) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }
};
