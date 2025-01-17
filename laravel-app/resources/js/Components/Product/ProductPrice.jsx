import React from 'react';

export const ProductPrice = ({ price, salePrice }) => {
  if (salePrice) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-300 line-through">${price.toLocaleString()}</span>
        <span className="text-red-400 font-semibold">${salePrice.toLocaleString()}</span>
      </div>
    );
  }
  return <span className="text-gray-100">${price.toLocaleString()}</span>;
};
