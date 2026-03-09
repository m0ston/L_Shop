import './style.css';
import { startRouter, getPath } from './router';
import { subscribe, setSession } from './state/store';
import { getSession } from './api/shopApi';
import { Header } from './components/header/Header';
import { Toast } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { BasketPage } from './pages/BasketPage';
import { DeliveryPage } from './pages/DeliveryPage';
import { DeliveriesPage } from './pages/DeliveriesPage';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App root not found');

const header = Header();
const toast = Toast();
const view = document.createElement('div');

app.appendChild(header);
app.appendChild(view);
app.appendChild(toast);

function renderRoute(): void {
  const path = getPath();
  view.innerHTML = '';

  if (path === '/') view.appendChild(HomePage());
  else if (path === '/auth') view.appendChild(AuthPage());
  else if (path === '/basket') view.appendChild(BasketPage());
  else if (path === '/delivery') view.appendChild(DeliveryPage());
  else if (path === '/deliveries') view.appendChild(DeliveriesPage());
  else view.appendChild(HomePage());

  (header as unknown as { render?: () => void }).render?.();
  (toast as unknown as { render?: () => void }).render?.();
}

startRouter(renderRoute);

subscribe(() => {
  (header as unknown as { render?: () => void }).render?.();
  (toast as unknown as { render?: () => void }).render?.();
});

// initial session load
(async () => {
  try {
    const session = await getSession();
    setSession(session);
  } catch {
    // ignore
  } finally {
    renderRoute();
  }
})();
