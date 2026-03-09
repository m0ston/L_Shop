import type { BasketView, DeliveryOrder, SessionInfo } from '../api/types';

export interface AppState {
  session: SessionInfo;
  toast: string | null;
}

const state: AppState = {
  session: { user: null, basket: null, deliveries: null },
  toast: null
};

type Listener = () => void;
const listeners = new Set<Listener>();

export function getState(): AppState {
  return state;
}

export function setSession(session: SessionInfo): void {
  state.session = session;
  emit();
}

export function setBasket(basket: BasketView | null): void {
  state.session = { ...state.session, basket };
  emit();
}

export function setDeliveries(deliveries: DeliveryOrder[] | null): void {
  state.session = { ...state.session, deliveries };
  emit();
}

export function toast(message: string, ttlMs: number = 2500): void {
  state.toast = message;
  emit();
  window.setTimeout(() => {
    if (state.toast === message) {
      state.toast = null;
      emit();
    }
  }, ttlMs);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(): void {
  for (const l of listeners) l();
}
