export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
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
    startTown: string;
    earlyDate: Date;
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
}

export interface BasketItem {
  productId: string;
  quantity: number;
}

export interface Basket {
  userId: string;
  items: Basket[];
}