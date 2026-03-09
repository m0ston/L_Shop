import { promises as fs } from 'fs';
import path from 'path';
import { Product, ProductFilters } from '../../types';

const productsFilePath = path.join(__dirname, '../../../database/products.json');

async function readText(): Promise<string | null> {
  try {
    return await fs.readFile(productsFilePath, 'utf-8');
  } catch {
    return null;
  }
}

export async function readProducts(): Promise<Product[]> {
  try {
    const data = await fs.readFile(productsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function writeProducts(products: Product[]): Promise<void> {
  await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let products = await readProducts();

  if (filters.search) {
    const q = filters.search.toLowerCase();
    products = products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  if (filters.category) {
    products = products.filter(p => p.categories.includes(filters.category!));
  }

  if (filters.isAvailable !== undefined) {
    products = products.filter(p => p.isAvailable === filters.isAvailable);
  }

  if (filters.hasDiscount !== undefined) {
    products = products.filter(p => (p.discount ?? 0) > 0 === filters.hasDiscount);
  }

  if (filters.minPrice !== undefined) {
    products = products.filter(p => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    products = products.filter(p => p.price <= filters.maxPrice!);
  }

  if (filters.sort) {
    products = [...products].sort((a, b) => {
      if (filters.sort === 'price_asc') return a.price - b.price;
      return b.price - a.price;
    });
  }

  return products;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await readProducts();
  return products.find(p => p.id === id) || null;
}

// Опционально: создание товара (если понадобится админка)
export async function createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
  const products = await readProducts();
  const newProduct = {
    id: Date.now().toString(),
    ...productData
  };
  products.push(newProduct);
  await writeProducts(products);
  return newProduct;
}
