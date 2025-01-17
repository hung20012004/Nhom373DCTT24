import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, currentImageIndexes, onPrevImage, onNextImage, onToggleWishlist, wishlist }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.product_id}
          product={product}
          currentImageIndex={currentImageIndexes[product.product_id]}
          onPrevImage={() => onPrevImage(product.product_id)}
          onNextImage={() => onNextImage(product.product_id)}
          onToggleWishlist={() => onToggleWishlist(product.product_id)}
          isInWishlist={wishlist.includes(product.product_id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
