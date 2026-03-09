import { ApiError } from '../api/http';
import { createDelivery, getBasket, getDeliveries } from '../api/shopApi';
import { getState, setBasket, setDeliveries, toast } from '../state/store';
import { navigate } from '../router';

function field(label: string, input: HTMLElement): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'col';
  wrap.style.gap = '6px';
  const l = document.createElement('div');
  l.className = 'hint';
  l.textContent = label;
  wrap.appendChild(l);
  wrap.appendChild(input);
  return wrap;
}

export function DeliveryPage(): HTMLElement {
  const root = document.createElement('div');
  root.className = 'container';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.padding = '18px';
  card.style.maxWidth = '720px';
  card.style.margin = '0 auto';

  const title = document.createElement('div');
  title.style.fontWeight = '900';
  title.style.fontSize = '20px';
  title.textContent = 'Оформление доставки';

  const form = document.createElement('form');
  form.className = 'col';
  form.style.gap = '12px';
  form.style.marginTop = '14px';
  form.setAttribute('data-delivery', ''); // required by tests

  const phone = document.createElement('input');
  phone.className = 'input';
  phone.placeholder = 'Телефон';

  const email = document.createElement('input');
  email.className = 'input';
  email.placeholder = 'Почта';

  const country = document.createElement('input');
  country.className = 'input';
  country.placeholder = 'Страна';

  const town = document.createElement('input');
  town.className = 'input';
  town.placeholder = 'Город';

  const street = document.createElement('input');
  street.className = 'input';
  street.placeholder = 'Улица';

  const house = document.createElement('input');
  house.className = 'input';
  house.placeholder = 'Дом';

  const pay = document.createElement('select');
  pay.className = 'select';
  pay.innerHTML = `
    <option value="card">Карта</option>
    <option value="cash">Наличные</option>
  `;

  const comment = document.createElement('textarea');
  comment.className = 'textarea';
  comment.rows = 3;
  comment.placeholder = 'Комментарий (опционально)';

  const submit = document.createElement('button');
  submit.className = 'btn primary';
  submit.type = 'submit';
  submit.textContent = 'Оформить заказ';

  const info = document.createElement('div');
  info.className = 'hint';
  info.textContent = 'После успешной доставки корзина очищается (по ТЗ).';

  form.appendChild(field('Телефон', phone));
  form.appendChild(field('Почта', email));
  form.appendChild(newRow(field('Страна', country), field('Город', town)));
  form.appendChild(newRow(field('Улица', street), field('Дом', house)));
  form.appendChild(field('Оплата', pay));
  form.appendChild(field('Комментарий', comment));
  form.appendChild(submit);
  form.appendChild(info);

  function newRow(a: HTMLElement, b: HTMLElement): HTMLElement {
    const r = document.createElement('div');
    r.className = 'row';
    r.style.alignItems = 'stretch';
    (a as HTMLElement).style.flex = '1';
    (b as HTMLElement).style.flex = '1';
    r.appendChild(a);
    r.appendChild(b);
    return r;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submit.disabled = true;
    try {
      const payload = {
        address: {
          country: country.value.trim() || undefined,
          town: town.value.trim() || undefined,
          street: street.value.trim() || undefined,
          houseNumber: house.value.trim() || undefined
        },
        phone: phone.value.trim(),
        email: email.value.trim(),
        paymentMethod: pay.value === 'cash' ? 'cash' : 'card',
        comment: comment.value.trim() || undefined
      } as const;

      if (!payload.phone || !payload.email) {
        toast('Заполните телефон и почту');
        return;
      }

      const order = await createDelivery(payload);
      toast('Заказ оформлен');

      // refresh basket & deliveries
      setBasket({ items: [], total: 0 });
      const deliveries = await getDeliveries();
      setDeliveries(deliveries);

      navigate('/deliveries');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast('Сначала войдите');
        navigate('/auth');
        return;
      }
      const msg = err instanceof ApiError ? err.message : 'Ошибка';
      toast(msg);
    } finally {
      submit.disabled = false;
    }
  });

  card.appendChild(title);
  card.appendChild(form);
  root.appendChild(card);

  // Ensure basket is loaded; if empty -> redirect to basket
  (async () => {
    try {
      const b = await getBasket();
      setBasket(b);
      if (b.items.length === 0) {
        toast('Корзина пустая');
        navigate('/basket');
      }
    } catch {
      // ignore; auth handled in Basket/other pages
    }
  })();

  return root;
}
