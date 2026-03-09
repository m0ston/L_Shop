import { getState } from '../state/store';

export function Toast(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.display = 'none';

  function render(): void {
    const { toast } = getState();
    if (!toast) {
      el.style.display = 'none';
      return;
    }
    el.style.display = 'block';
    el.textContent = toast;
  }

  (el as unknown as { render?: () => void }).render = render;
  render();
  return el;
}
