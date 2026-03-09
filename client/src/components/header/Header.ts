import './header.css';
import { getPath, navigate } from '../../router';
import { getState, toast } from '../../state/store';
import { logoutUser } from '../../api/shopApi';

export function Header(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'header';

  const inner = document.createElement('div');
  inner.className = 'header-inner';

  const left = document.createElement('div');
  left.className = 'row';

  const brand = document.createElement('div');
  brand.className = 'brand';
  brand.innerHTML = `<span style="color:var(--accent)">●</span> L_Shop`;
  brand.style.cursor = 'pointer';
  brand.addEventListener('click', () => navigate('/'));
  left.appendChild(brand);

  const nav = document.createElement('div');
  nav.className = 'nav';

  function link(href: string, label: string, badge?: string): HTMLAnchorElement {
    const a = document.createElement('a');
    a.href = href;
    a.setAttribute('data-link', '1');
    a.textContent = label;
    if (badge) {
      const b = document.createElement('span');
      b.className = 'badge';
      b.style.marginLeft = '8px';
      b.textContent = badge;
      a.appendChild(b);
    }
    return a;
  }

  const right = document.createElement('div');
  right.className = 'right';

  inner.appendChild(left);
  inner.appendChild(nav);
  inner.appendChild(right);
  el.appendChild(inner);

  function render(): void {
    const { session } = getState();
    const path = getPath();

    nav.innerHTML = '';
    right.innerHTML = '';

    const basketCount = session.basket?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

    const home = link('/', 'Товары');
    const basket = link('/basket', 'Корзина', basketCount > 0 ? String(basketCount) : undefined);
    const deliveries = link('/deliveries', 'Доставки');

    for (const a of [home, basket, deliveries]) {
      if (a.getAttribute('href') === path) a.classList.add('active');
      nav.appendChild(a);
    }

    if (session.user) {
      const user = document.createElement('div');
      user.className = 'user';
      user.textContent = `Вы: ${session.user.name}`;
      right.appendChild(user);

      const out = document.createElement('button');
      out.className = 'btn';
      out.textContent = 'Выйти';
      out.addEventListener('click', async () => {
        try {
          await logoutUser();
          window.location.href = '/';
        } catch (e) {
          toast('Не удалось выйти');
        }
      });
      right.appendChild(out);
    } else {
      const login = document.createElement('a');
      login.href = '/auth';
      login.setAttribute('data-link', '1');
      login.className = path === '/auth' ? 'active' : '';
      login.textContent = 'Войти';
      nav.appendChild(login);
    }
  }

  (el as unknown as { render?: () => void }).render = render;
  render();
  return el;
}
