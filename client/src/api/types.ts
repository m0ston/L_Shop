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
  images: { preview: string; gallery?: string[] };
  discount?: number;
}

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

export interface PublicUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  login?: string;
  createdAt: string;
}

export type PaymentMethod = 'card' | 'cash';

export interface DeliveryOrder {
  id: string;
  userId: string;
  createdAt: string;
  address: Address;
  contact: { phone: string; email: string };
  paymentMethod: PaymentMethod;
  comment?: string;
  items: BasketItemDetailed[];
  total: number;
}

export interface SessionInfo {
  user: PublicUser | null;
  basket: BasketView | null;
  deliveries: DeliveryOrder[] | null;
}

export interface ProductQuery {
  search?: string;
  category?: string;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc';
  hasDiscount?: boolean;
}
