import { ApiError } from '../api/http';
import { getDeliveries, getSession } from '../api/shopApi';
import { getState, setDeliveries, setSession, toast } from '../state/store';
import { navigate } from '../router';
import type { DeliveryOrder } from '../api/types';

function formatMoney(v: number): string {
  return new Intl.NumberFormat('ru-RU').format(v) + ' ₽';
}

function orderCard(o: DeliveryOrder): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.padding = '14px';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.gap = '10px';

  const head = document.createElement('div');
  head.className = 'row';
  head.style.justifyContent = 'space-between';

  const left = document.createElement('div');
  left.style.fontWeight = '900';
  left.textContent = `Заказ #${o.id}`;

  const right = document.createElement('div');
  right.className = 'hint';
  right.textContent = new Date(o.createdAt).toLocaleString('ru-RU');

  head.appendChild(left);
  head.appendChild(right);

  const addr = document.createElement('div');
  addr.className = 'hint';
  const a = o.address;
  addr.textContent = `Адрес: ${(a.country ?? '')} ${(a.town ?? '')} ${(a.street ?? '')} ${(a.houseNumber ?? '')}`.trim();

  const items = document.createElement('div');
  items.className = 'col';
  items.style.gap = '8px';

  for (const it of o.items) {
    const r = document.createElement('div');
    r.className = 'row';
    r.style.justifyContent = 'space-between';
    const t = document.createElement('div');
    t.textContent = `${it.product.title} × ${it.quantity}`;
    const p = document.createElement('div');
    p.className = 'hint';
    p.textContent = formatMoney(it.lineTotal);
    r.appendChild(t);
    r.appendChild(p);
    items.appendChild(r);
  }

  const total = document.createElement('div');
  total.className = 'row';
  total.style.justifyContent = 'space-between';
  total.style.borderTop = '1px solid var(--border)';
  total.style.paddingTop = '10px';

  const tl = document.createElement('div');
  tl.style.fontWeight = '800';
  tl.textContent = 'Итого';

  const tr = document.createElement('div');
  tr.style.fontWeight = '900';
  tr.textContent = formatMoney(o.total);

  total.appendChild(tl);
  total.appendChild(tr);

  card.appendChild(head);
  card.appendChild(addr);
  card.appendChild(items);
  card.appendChild(total);

  return card;
}

export function DeliveriesPage(): HTMLElement {
  const root = document.createElement('div');
  root.className = 'container';

  const header = document.createElement('div');
  header.className = 'row';
  header.style.justifyContent = 'space-between';
  header.style.marginBottom = '12px';

  const h = document.createElement('div');
  h.style.fontSize = '18px';
  h.style.fontWeight = '900';
  h.textContent = 'Доставки';

  const refresh = document.createElement('button');
  refresh.className = 'btn';
  refresh.textContent = 'Обновить';
  refresh.addEventListener('click', () => load());

  header.appendChild(h);
  header.appendChild(refresh);

  const list = document.createElement('div');
  list.className = 'col';
  list.style.gap = '12px';

  root.appendChild(header);
  root.appendChild(list);

  async function load(): Promise<void> {
    list.innerHTML = '<div class="hint">Загрузка...</div>';
    try {
      const session = await getSession();
      setSession(session);

      if (!session.user) {
        toast('Сначала войдите');
        navigate('/auth');
        return;
      }

      const deliveries = await getDeliveries();
      setDeliveries(deliveries);
      render();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        toast('Сначала войдите');
        navigate('/auth');
        return;
      }
      list.innerHTML = '<div class="hint">Ошибка</div>';
    }
  }

  function render(): void {
    const deliveries = getState().session.deliveries ?? [];
    list.innerHTML = '';
    if (deliveries.length === 0) {
      list.innerHTML = '<div class="hint">Пока нет доставок</div>';
      return;
    }
    for (const o of deliveries) list.appendChild(orderCard(o));
  }

  load();
  return root;
}
