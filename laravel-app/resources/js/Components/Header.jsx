import React from 'react';
import { Search, ShoppingCart, Heart } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold">Logo</div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <div className="flex gap-4">
            <Heart className="cursor-pointer" />
            <div className="relative">
              <ShoppingCart className="cursor-pointer" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
