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
  // добавить если будет нужно еще
}

export interface BasketItem {
  productId: string;
  quantity: number;
}

export interface Basket {
  userId: string;
  items: Basket[];
}