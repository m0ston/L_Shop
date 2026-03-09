export type Route = '/' | '/auth' | '/basket' | '/delivery' | '/deliveries';

export function getPath(): Route {
  const p = window.location.pathname;
  if (p === '/auth' || p === '/basket' || p === '/delivery' || p === '/deliveries') return p;
  return '/';
}

export function navigate(path: Route): void {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function startRouter(onRoute: () => void): void {
  window.addEventListener('popstate', onRoute);

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const a = target.closest('a[data-link]') as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;

    e.preventDefault();
    navigate(href as Route);
  });
}
