import { ApiError } from '../api/http';
import { getBasket, removeFromBasket, updateBasket } from '../api/shopApi';
import { getState, setBasket, toast } from '../state/store';
import { navigate } from '../router';
import type { BasketItemDetailed } from '../api/types';

function formatMoney(v: number): string {
  return new Intl.NumberFormat('ru-RU').format(v) + ' ₽';
}

function itemRow(item: BasketItemDetailed, onChange: () => void): HTMLElement {
  const row = document.createElement('div');
  row.className = 'card';
  row.style.padding = '14px';
  row.style.display = 'grid';
  row.style.gridTemplateColumns = '1fr auto';
  row.style.gap = '12px';

  const left = document.createElement('div');
  left.className = 'col';
  left.style.gap = '8px';

  const title = document.createElement('div');
  title.style.fontWeight = '800';
  title.setAttribute('data-title', 'basket');
  title.textContent = item.product.title;

  const price = document.createElement('div');
  price.setAttribute('data-price', 'basket');
  price.className = 'hint';
  price.textContent = `Цена: ${formatMoney(item.unitPrice)} • Сумма: ${formatMoney(item.lineTotal)}`;

  left.appendChild(title);
  left.appendChild(price);

  const right = document.createElement('div');
  right.className = 'col';
  right.style.alignItems = 'end';
  right.style.gap = '10px';

  const step = document.createElement('div');
  step.className = 'row';
  step.style.gap = '8px';

  const minus = document.createElement('button');
  minus.className = 'btn';
  minus.textContent = '−';

  const qty = document.createElement('input');
  qty.className = 'input';
  qty.style.width = '80px';
  qty.type = 'number';
  qty.min = '1';
  qty.value = String(item.quantity);

  const plus = document.createElement('button');
  plus.className = 'btn';
  plus.textContent = '+';

  const apply = async (q: number): Promise<void> => {
    try {
      const basket = await updateBasket(item.product.id, q);
      setBasket(basket);
      onChange();
    } catch {
      toast('Не удалось обновить количество');
    }
  };

  minus.addEventListener('click', () => apply(Math.max(1, item.quantity - 1)));
  plus.addEventListener('click', () => apply(item.quantity + 1));
  qty.addEventListener('change', () => {
    const n = Math.max(1, Math.floor(Number(qty.value || '1')));
    apply(n);
  });

  step.appendChild(minus);
  step.appendChild(qty);
  step.appendChild(plus);

  const del = document.createElement('button');
  del.className = 'btn danger';
  del.textContent = 'Удалить';
  del.addEventListener('click', async () => {
    try {
      const basket = await removeFromBasket(item.product.id);
      setBasket(basket);
      onChange();
      toast('Удалено');
    } catch {
      toast('Не удалось удалить');
    }
  });

  right.appendChild(step);
  right.appendChild(del);

  row.appendChild(left);
  row.appendChild(right);

  return row;
}

export function BasketPage(): HTMLElement {
  const root = document.createElement('div');
  root.className = 'container';

  const header = document.createElement('div');
  header.className = 'row';
  header.style.justifyContent = 'space-between';
  header.style.marginBottom = '12px';

  const h = document.createElement('div');
  h.style.fontSize = '18px';
  h.style.fontWeight = '900';
  h.textContent = 'Корзина';

  const goDelivery = document.createElement('button');
  goDelivery.className = 'btn primary';
  goDelivery.textContent = 'Оформить доставку';
  goDelivery.addEventListener('click', () => navigate('/delivery'));

  header.appendChild(h);
  header.appendChild(goDelivery);

  const list = document.createElement('div');
  list.className = 'col';
  list.style.gap = '12px';

  const total = document.createElement('div');
  total.className = 'card';
  total.style.padding = '14px';
  total.style.display = 'flex';
  total.style.justifyContent = 'space-between';
  total.style.alignItems = 'center';

  const totalLeft = document.createElement('div');
  totalLeft.style.fontWeight = '800';
  totalLeft.textContent = 'Итого';

  const totalRight = document.createElement('div');
  totalRight.style.fontWeight = '900';

  total.appendChild(totalLeft);
  total.appendChild(totalRight);

  root.appendChild(header);
  root.appendChild(list);
  root.appendChild(total);

  async function load(): Promise<void> {
    try {
      const basket = await getBasket();
      setBasket(basket);
      render();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        toast('Сначала войдите');
        navigate('/auth');
        return;
      }
      toast('Ошибка загрузки корзины');
    }
  }

  function render(): void {
    const b = getState().session.basket;
    list.innerHTML = '';
    if (!b || b.items.length === 0) {
      goDelivery.disabled = true;
      list.innerHTML = '<div class="hint">Корзина пустая</div>';
      totalRight.textContent = formatMoney(0);
      return;
    }

    goDelivery.disabled = false;
    for (const it of b.items) list.appendChild(itemRow(it, render));
    totalRight.textContent = formatMoney(b.total);
  }

  load();
  return root;
}
