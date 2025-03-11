import React from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({
  products = [],
  currentImageIndexes = {},
  onPrevImage,
  onNextImage,
  onToggleWishlist,
  wishlist = [],
}) => {
  const initializeIndexes = (products, currentImageIndexes) => {
    const initializedIndexes = { ...currentImageIndexes };
    products.forEach((product) => {
      if (product?.product_id && !(product.product_id in initializedIndexes)) {
        initializedIndexes[product.product_id] = 0;
      }
    });
    return initializedIndexes;
  };
  const isProductInWishlist = (productId) => {
    if (!Array.isArray(wishlist)) return false;

    // Nếu wishlist là mảng các ID đơn giản
    if (typeof wishlist[0] === 'number' || typeof wishlist[0] === 'string') {
      return wishlist.includes(productId);
    }

    // Nếu wishlist là mảng các đối tượng có chứa product_id
    return wishlist.some(item =>
      (item.product_id === productId) ||
      (item.id === productId) ||
      (item === productId)
    );
  };

  const updatedImageIndexes = initializeIndexes(products, currentImageIndexes);

  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products
        .filter((product) => product && product.product_id)
        .map((product) => (
          <ProductCard
            key={product.product_id}
            product={product}
            currentImageIndex={updatedImageIndexes[product.product_id]}
            onPrevImage={() => onPrevImage(product.product_id)}
            onNextImage={() => onNextImage(product.product_id)}
            onToggleWishlist={() => onToggleWishlist(product.product_id)}
            isInWishlist={isProductInWishlist(product.product_id)}
          />
        ))}
    </div>
  );
};

export default ProductGrid;
