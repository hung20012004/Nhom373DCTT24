// resources/js/Components/Product/ProductCard.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart } from 'lucide-react';
import { ProductPrice } from './ProductPrice';
import { OutOfStockBadge } from './OutOfStockBadge';
import ProductDialog from './ProductDialog';

const ProductCard = ({
  product,
  currentImageIndex,
  onPrevImage,
  onNextImage,
  onToggleWishlist,
  isInWishlist
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div
        className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow group relative cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      >
        {/* Existing ProductCard content */}
        <div className="relative aspect-w-1 aspect-h-1">
          <img
            src={product.images[currentImageIndex]?.image_url || '/path/to/fallback.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          {product.images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPrevImage();
                }}
                className="bg-black/50 p-1 rounded-full text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onNextImage();
                }}
                className="bg-black/50 p-1 rounded-full text-white"
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
            <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium truncate">{product.name}</h3>
              <ProductPrice price={product.price} salePrice={product.sale_price} />
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
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
