export interface User {
  id: string;
  name: string;
  password: string;
  email?: string;
  phone?: string;
  login?: string;
  createdAt: string;
}

export type PublicUser = Omit<User, 'password'>;

export interface Address {
  country?: string;
  town?: string;
  street?: string;
  houseNumber?: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  isAvailable: boolean;
  description: string;
  categories: string[];
  images: {
    preview: string;
    gallery?: string[];
  };
  delivery?: {
    startTown: Address;
    earlyDate: string; 
    price: number;
  };
  discount?: number;
}

export interface ProductFilters {
  category?: string;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'price_asc' | 'price_desc';
  hasDiscount?: boolean;
}

export interface BasketItem {
  productId: string;
  quantity: number;
}
export type BasketData = Record<string, BasketItem[]>

export interface BasketItemDetailed {
  product: Product;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface BasketView {
  items: BasketItemDetailed[];
  total: number;
}

export type PaymentMethod = 'card' | 'cash';

export interface DeliveryForm {
  address: Address;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod;
  comment?: string;
}

export interface DeliveryOrder {
  id: string;
  userId: string;
  createdAt: string;
  address: Address;
  contact: {
    phone: string;
    email: string;
  };
  paymentMethod: PaymentMethod;
  comment?: string;
  items: BasketItemDetailed[];
  total: number;
}

export type DeliveryData = Record<string, DeliveryOrder[]>;

export interface SessionInfo {
  user: PublicUser | null;
  basket: BasketView | null;
  deliveries: DeliveryOrder[] | null;
}
