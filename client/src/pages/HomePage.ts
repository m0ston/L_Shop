import type { Product, ProductQuery } from '../api/types';
import { addToBasket, getProducts, getSession } from '../api/shopApi';
import { ApiError } from '../api/http';
import { getState, setBasket, setSession, toast } from '../state/store';
import { navigate } from '../router';

function createFilterCard(): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.padding = '14px';

  card.innerHTML = `
    <div style="font-weight:700; margin-bottom:10px;">Фильтры</div>
    <div class="col" style="gap:10px;">
      <div>
        <div class="hint" style="margin-bottom:6px;">Поиск (имя/описание)</div>
        <input class="input" data-search placeholder="Например: ноутбук" />
      </div>

      <div class="row">
        <div style="flex:1">
          <div class="hint" style="margin-bottom:6px;">Цена от</div>
          <input class="input" data-min type="number" min="0" placeholder="0" />
        </div>
        <div style="flex:1">
          <div class="hint" style="margin-bottom:6px;">до</div>
          <input class="input" data-max type="number" min="0" placeholder="999999" />
        </div>
      </div>

      <div>
        <div class="hint" style="margin-bottom:6px;">Категория</div>
        <select class="select" data-category>
          <option value="">Все</option>
          <option value="electronics">Electronics</option>
          <option value="phones">Phones</option>
          <option value="laptops">Laptops</option>
          <option value="home">Home</option>
          <option value="gaming">Gaming</option>
        </select>
      </div>

      <div class="row" style="justify-content:space-between;">
        <label class="row" style="gap:8px; color:var(--muted);">
          <input type="checkbox" data-available />
          Только в наличии
        </label>
        <label class="row" style="gap:8px; color:var(--muted);">
          <input type="checkbox" data-discount />
          Скидки
        </label>
      </div>

      <div>
        <div class="hint" style="margin-bottom:6px;">Сортировка</div>
        <select class="select" data-sort>
          <option value="">Без сортировки</option>
          <option value="price_asc">Цена ↑</option>
          <option value="price_desc">Цена ↓</option>
        </select>
      </div>

      <button class="btn" data-apply>Применить</button>
    </div>
  `;
  return card;
}

function formatMoney(v: number): string {
  return new Intl.NumberFormat('ru-RU').format(v) + ' ₽';
}

function productCard(p: Product): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.padding = '14px';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.gap = '10px';

  const title = document.createElement('div');
  title.style.fontWeight = '700';
  title.setAttribute('data-title', '');
  title.textContent = p.title;

  const desc = document.createElement('div');
  desc.className = 'hint';
  desc.textContent = p.description;

  const meta = document.createElement('div');
  meta.className = 'row';
  meta.style.justifyContent = 'space-between';

  const priceWrap = document.createElement('div');
  priceWrap.setAttribute('data-price', '');
  priceWrap.style.fontWeight = '700';
  priceWrap.textContent = formatMoney(p.price);

  const badge = document.createElement('div');
  badge.className = 'badge';
  badge.textContent = p.isAvailable ? 'В наличии' : 'Нет';
  badge.style.opacity = p.isAvailable ? '1' : '.6';

  meta.appendChild(priceWrap);
  meta.appendChild(badge);

  const actions = document.createElement('div');
  actions.className = 'row';
  actions.style.justifyContent = 'space-between';

  const step = document.createElement('div');
  step.className = 'row';
  step.style.gap = '8px';

  const minus = document.createElement('button');
  minus.className = 'btn';
  minus.textContent = '−';

  const qty = document.createElement('input');
  qty.className = 'input';
  qty.style.width = '72px';
  qty.type = 'number';
  qty.min = '1';
  qty.value = '1';

  const plus = document.createElement('button');
  plus.className = 'btn';
  plus.textContent = '+';

  minus.addEventListener('click', () => {
    const n = Math.max(1, Number(qty.value || '1') - 1);
    qty.value = String(n);
  });
  plus.addEventListener('click', () => {
    const n = Math.max(1, Number(qty.value || '1') + 1);
    qty.value = String(n);
  });

  step.appendChild(minus);
  step.appendChild(qty);
  step.appendChild(plus);

  const add = document.createElement('button');
  add.className = 'btn primary';
  add.textContent = 'В корзину';

  add.addEventListener('click', async () => {
    try {
      const q = Math.max(1, Math.floor(Number(qty.value || '1')));
      const basket = await addToBasket(p.id, q);
      setBasket(basket);
      toast('Добавлено в корзину');
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        toast('Сначала войдите/зарегистрируйтесь');
        navigate('/auth');
        return;
      }
      toast('Не удалось добавить');
    }
  });

  actions.appendChild(step);
  actions.appendChild(add);

  const footer = document.createElement('div');
  footer.className = 'hint';
  footer.textContent = `Категории: ${p.categories.join(', ')}${p.discount ? ` • Скидка ${p.discount}%` : ''}`;

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(meta);
  card.appendChild(actions);
  card.appendChild(footer);

  return card;
}

export function HomePage(): HTMLElement {
  const root = document.createElement('div');
  root.className = 'container';

  const layout = document.createElement('div');
  layout.style.display = 'grid';
  layout.style.gridTemplateColumns = '320px 1fr';
  layout.style.gap = '14px';
  layout.style.alignItems = 'start';

  const left = createFilterCard();
  const right = document.createElement('div');

  const top = document.createElement('div');
  top.className = 'row';
  top.style.justifyContent = 'space-between';
  top.style.marginBottom = '12px';

  const title = document.createElement('div');
  title.style.fontSize = '18px';
  title.style.fontWeight = '800';
  title.textContent = 'Каталог';

  const refresh = document.createElement('button');
  refresh.className = 'btn';
  refresh.textContent = 'Обновить';
  refresh.addEventListener('click', () => load());

  top.appendChild(title);
  top.appendChild(refresh);

  const grid = document.createElement('div');
  grid.className = 'grid';

  const status = document.createElement('div');
  status.className = 'hint';
  status.style.marginTop = '10px';

  right.appendChild(top);
  right.appendChild(grid);
  right.appendChild(status);

  layout.appendChild(left);
  layout.appendChild(right);
  root.appendChild(layout);

  // mobile collapse
  const mq = window.matchMedia('(max-width: 980px)');
  function applyResponsive(): void {
    if (mq.matches) {
      layout.style.gridTemplateColumns = '1fr';
    } else {
      layout.style.gridTemplateColumns = '320px 1fr';
    }
  }
  mq.addEventListener('change', applyResponsive);
  applyResponsive();

  function getFilter(): ProductQuery {
    const search = (left.querySelector('[data-search]') as HTMLInputElement).value.trim();
    const minRaw = (left.querySelector('[data-min]') as HTMLInputElement).value;
    const maxRaw = (left.querySelector('[data-max]') as HTMLInputElement).value;
    const category = (left.querySelector('[data-category]') as HTMLSelectElement).value;
    const onlyAvailable = (left.querySelector('[data-available]') as HTMLInputElement).checked;
    const hasDiscount = (left.querySelector('[data-discount]') as HTMLInputElement).checked;
    const sort = (left.querySelector('[data-sort]') as HTMLSelectElement).value as ProductQuery['sort'];

    return {
      search: search || undefined,
      minPrice: minRaw ? Number(minRaw) : undefined,
      maxPrice: maxRaw ? Number(maxRaw) : undefined,
      category: category || undefined,
      isAvailable: onlyAvailable ? true : undefined,
      hasDiscount: hasDiscount ? true : undefined,
      sort: sort || undefined
    };
  }

  async function load(): Promise<void> {
    status.textContent = 'Загрузка...';
    grid.innerHTML = '';
    try {
      // refresh session (basket badge)
      const session = await getSession();
      setSession(session);

      const products = await getProducts(getFilter());
      if (products.length === 0) {
        status.textContent = 'Ничего не найдено';
        return;
      }
      status.textContent = `Товаров: ${products.length}`;
      for (const p of products) grid.appendChild(productCard(p));
    } catch {
      status.textContent = 'Ошибка загрузки';
    }
  }

  left.querySelector('[data-apply]')?.addEventListener('click', () => load());

  load();
  return root;
}
