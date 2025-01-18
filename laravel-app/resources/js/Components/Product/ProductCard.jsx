import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart } from 'lucide-react';
import { ProductPrice } from './ProductPrice';
import { OutOfStockBadge } from './OutOfStockBadge';
import ProductDialog from './ProductDialog';

const ProductCard = ({
  product,
  onToggleWishlist,
  isInWishlist
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow group relative cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="relative w-full pt-[133%]">
          <div className="absolute inset-0">
            <img
              src={product.images[currentImageIndex]?.image_url || '/path/to/fallback.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {product.images.length > 1 && (
              <div className="absolute inset-y-0 w-full flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handlePrevImage}
                  className="bg-black/50 p-1 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="bg-black/50 p-1 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist();
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-4 text-white">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-medium truncate max-w-full sm:text-base md:text-lg lg:text-xl">
                {product.name}
              </h3>
              <ProductPrice price={product.price} salePrice={product.sale_price} />
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex-shrink-0 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={product.stock_quantity <= 0}
            >
              <ShoppingCart className="w-6 h-6 text-white" />
            </button>
          </div>

          {product.stock_quantity <= 0 && <OutOfStockBadge />}
        </div>
      </div>

      <ProductDialog
        product={product}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onToggleWishlist={onToggleWishlist}
        isInWishlist={isInWishlist}
      />
    </>
  );
};

export default ProductCard;
