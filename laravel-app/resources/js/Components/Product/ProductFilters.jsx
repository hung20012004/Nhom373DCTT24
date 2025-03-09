import React from "react";
import { Heart } from "lucide-react";

const ProductFilters = ({ categories, filters, onFilterChange, wishlistCount }) => {
    return (
        <div className="lg:w-1/4">
            <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                        Tìm kiếm theo
                    </h3>
                    <select
                        value={filters.sort}
                        onChange={(e) => onFilterChange("sort", e.target.value)}
                        className="w-full border-neutral-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="newest">Sản phẩm mới</option>
                        <option value="price_asc">Giá: Thấp đến cao</option>
                        <option value="price_desc">Giá: Cao đến thấp</option>
                        <option value="name_asc">Tên: A to Z</option>
                        <option value="name_desc">Tên: Z to A</option>
                    </select>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                        Danh mục sản phẩm
                    </h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => onFilterChange("category", "")}
                            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                !filters.category && filters.filter_type !== "wishlist"
                                    ? "bg-blue-50 text-blue-700"
                                    : "hover:bg-neutral-50"
                            }`}
                        >
                            Toàn bộ sản phẩm
                        </button>

                        <button
                            onClick={() => onFilterChange("filter_type", "wishlist")}
                            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                                filters.filter_type === "wishlist"
                                    ? "bg-blue-50 text-blue-700"
                                    : "hover:bg-neutral-50"
                            }`}
                        >
                            <Heart className="w-4 h-4 mr-2" />
                            Sản phẩm yêu thích
                            {wishlistCount > 0 && (
                                <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {wishlistCount}
                                </span>
                            )}
                        </button>

                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => onFilterChange("category", category.slug)}
                                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                    filters.category === category.slug && filters.filter_type !== "wishlist"
                                        ? "bg-blue-50 text-blue-700"
                                        : "hover:bg-neutral-50"
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductFilters;
