import React from 'react';

export const ProductPrice = ({ price, salePrice }) => {
  const formatCurrency = (value) => {
    if (isNaN(value)) return "N/A";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (salePrice) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-300 line-through">{formatCurrency(price)}</span>
        <span className="text-red-400 font-semibold">{formatCurrency(salePrice)}</span>
      </div>
    );
  }
  return <span className="text-gray-100">{formatCurrency(price)}</span>;
};
