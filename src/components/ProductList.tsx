'use client';

import { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  onCompareToggle?: (product: Product) => void;
  compareProducts?: Product[];
}

export default function ProductList({ products, onCompareToggle, compareProducts = [] }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product}
          onCompareToggle={onCompareToggle}
          isComparing={compareProducts.some(p => p.id === product.id)}
        />
      ))}
    </div>
  );
}
