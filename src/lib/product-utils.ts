import type { Product as DataProduct } from '@/data/products';
import type { Product as ModelProduct } from '@/types/models';

export function toModelProduct(product: DataProduct): ModelProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stockLevel: 10, // Default value
    sku: product.id, // Use ID as SKU
    images: [product.image],
    mainImage: product.image,
    categories: [product.category],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export function toDataProduct(product: ModelProduct): DataProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.categories[0] || '',
    image: product.mainImage
  };
}

export function toViewProduct(product: ModelProduct): DataProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.categories[0] || '',
    image: product.mainImage
  };
}
