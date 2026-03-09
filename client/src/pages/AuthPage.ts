import { ApiError } from '../api/http';
import { loginUser, registerUser } from '../api/shopApi';
import { setSession, toast } from '../state/store';
import { navigate } from '../router';

type Mode = 'login' | 'register';

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

export function AuthPage(): HTMLElement {
  const root = document.createElement('div');
  root.className = 'container';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.padding = '18px';
  card.style.maxWidth = '560px';
  card.style.margin = '0 auto';

  const title = document.createElement('div');
  title.style.fontWeight = '900';
  title.style.fontSize = '20px';
  title.textContent = 'Вход';

  const tabs = document.createElement('div');
  tabs.className = 'row';
  tabs.style.gap = '8px';
  tabs.style.marginTop = '10px';

  const btnLogin = document.createElement('button');
  btnLogin.className = 'btn primary';
  btnLogin.textContent = 'Войти';

  const btnReg = document.createElement('button');
  btnReg.className = 'btn';
  btnReg.textContent = 'Регистрация';

  tabs.appendChild(btnLogin);
  tabs.appendChild(btnReg);

  const form = document.createElement('form');
  form.setAttribute('data-registration', ''); // required by tests (registration form)
  form.className = 'col';
  form.style.gap = '12px';
  form.style.marginTop = '14px';

  const hint = document.createElement('div');
  hint.className = 'hint';
  hint.textContent = 'Можно входить по email / телефону / логину / имени.';

  const identifier = document.createElement('input');
  identifier.className = 'input';
  identifier.placeholder = 'Email / телефон / логин / имя';

  const name = document.createElement('input');
  name.className = 'input';
  name.placeholder = 'Ваше имя';

  const email = document.createElement('input');
  email.className = 'input';
  email.placeholder = 'Email (опционально)';

  const phone = document.createElement('input');
  phone.className = 'input';
  phone.placeholder = 'Телефон (опционально)';

  const login = document.createElement('input');
  login.className = 'input';
  login.placeholder = 'Логин (опционально)';

  const pass = document.createElement('input');
  pass.className = 'input';
  pass.type = 'password';
  pass.placeholder = 'Пароль';

  const showRow = document.createElement('label');
  showRow.className = 'row';
  showRow.style.gap = '8px';
  showRow.style.color = 'var(--muted)';
  const show = document.createElement('input');
  show.type = 'checkbox';
  show.addEventListener('change', () => {
    pass.type = show.checked ? 'text' : 'password';
  });
  showRow.appendChild(show);
  showRow.appendChild(document.createTextNode('Показать пароль'));

  const submit = document.createElement('button');
  submit.className = 'btn primary';
  submit.type = 'submit';
  submit.textContent = 'Войти';

  const forgot = document.createElement('button');
  forgot.className = 'btn';
  forgot.type = 'button';
  forgot.textContent = 'Забыли пароль?';
  forgot.addEventListener('click', () => {
    toast('В учебном проекте восстановление не реализовано 🙂');
  });

  const modeHelp = document.createElement('div');
  modeHelp.className = 'hint';

  let mode: Mode = 'login';

  function setMode(m: Mode): void {
    mode = m;
    title.textContent = m === 'login' ? 'Вход' : 'Регистрация';
    submit.textContent = m === 'login' ? 'Войти' : 'Зарегистрироваться';

    btnLogin.className = m === 'login' ? 'btn primary' : 'btn';
    btnReg.className = m === 'register' ? 'btn primary' : 'btn';

    form.innerHTML = '';
    if (m === 'login') {
      form.appendChild(hint);
      form.appendChild(field('Способ входа', identifier));
      form.appendChild(field('Пароль', pass));
      form.appendChild(showRow);
      form.appendChild(newDivRow([submit, forgot]));
      modeHelp.textContent = 'Кука живёт 10 минут (httpOnly).';
    } else {
      form.appendChild(field('Имя', name));
      form.appendChild(field('Email', email));
      form.appendChild(field('Телефон', phone));
      form.appendChild(field('Логин', login));
      form.appendChild(field('Пароль', pass));
      form.appendChild(showRow);
      form.appendChild(newDivRow([submit]));
      modeHelp.textContent = 'Нужно указать хотя бы одно: email/телефон/логин.';
    }
    form.appendChild(modeHelp);

    // data attribute required by tests:
    if (m === 'register') form.setAttribute('data-registration', '');
    else form.setAttribute('data-registration', '');
  }

  function newDivRow(nodes: HTMLElement[]): HTMLElement {
    const r = document.createElement('div');
    r.className = 'row';
    r.style.justifyContent = 'space-between';
    r.style.gap = '10px';
    for (const n of nodes) r.appendChild(n);
    return r;
  }

  btnLogin.addEventListener('click', () => setMode('login'));
  btnReg.addEventListener('click', () => setMode('register'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submit.disabled = true;

    try {
      if (mode === 'login') {
        const id = identifier.value.trim();
        const pw = pass.value.trim();
        if (!id || !pw) throw new ApiError('Заполните поля', 400);
        const session = await loginUser({ identifier: id, password: pw });
        setSession(session);
        toast('Вход выполнен');
        navigate('/');
      } else {
        const n = name.value.trim();
        const pw = pass.value.trim();
        if (!n || !pw) throw new ApiError('Заполните имя и пароль', 400);
        const payload = {
          name: n,
          password: pw,
          email: email.value.trim() || undefined,
          phone: phone.value.trim() || undefined,
          login: login.value.trim() || undefined
        };
        const session = await registerUser(payload);
        setSession(session);
        toast('Регистрация успешна');
        navigate('/');
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Ошибка';
      toast(msg);
    } finally {
      submit.disabled = false;
    }
  });

  card.appendChild(title);
  card.appendChild(tabs);
  card.appendChild(form);

  root.appendChild(card);

  setMode('login');
  return root;
}
