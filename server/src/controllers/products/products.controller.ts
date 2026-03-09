import { Request, Response } from 'express';
import { getProducts, getProductById, createProduct } from '../../services/products/products.service';

export async function getProductsHandler(req: Request, res: Response) {
  try {
    const filters = {
      search: req.query.search as string,
      category: req.query.category as string,
      isAvailable: req.query.isAvailable === 'true' ? true : 
                   req.query.isAvailable === 'false' ? false : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      sort: req.query.sort as 'price_asc' | 'price_desc'
    };
    
    const products = await getProducts(filters);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export async function getProductByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const idParam = req.params.id;

    if (typeof idParam !== 'string') {
      res.status(400).json({ error: 'Product ID must be a string' });
      return;
    }

    if (!idParam) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    const product = await getProductById(idParam);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

export async function createProductHandler(req: Request, res: Response) {
  try {
    const productData = req.body;
    const newProduct = await createProduct(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
}