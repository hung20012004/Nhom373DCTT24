import React from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({
  products = [], // Mảng sản phẩm, mặc định là mảng rỗng
  currentImageIndexes = {}, // Đối tượng chứa index hình ảnh hiện tại, mặc định là đối tượng rỗng
  onPrevImage,
  onNextImage,
  onToggleWishlist,
  wishlist = [], // Mảng wishlist, mặc định là mảng rỗng
}) => {
  // Hàm khởi tạo giá trị mặc định cho currentImageIndexes
  const initializeIndexes = (products, currentImageIndexes) => {
    const initializedIndexes = { ...currentImageIndexes };
    products.forEach((product) => {
      if (product?.product_id && !(product.product_id in initializedIndexes)) {
        initializedIndexes[product.product_id] = 0; // Giá trị mặc định
      }
    });
    return initializedIndexes;
  };

  // Khởi tạo giá trị cho currentImageIndexes nếu chưa có đầy đủ key
  const updatedImageIndexes = initializeIndexes(products, currentImageIndexes);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products
        .filter((product) => product && product.product_id) // Lọc các sản phẩm không hợp lệ
        .map((product) => (
          <ProductCard
            key={product.product_id}
            product={product}
            currentImageIndex={updatedImageIndexes[product.product_id]}
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
