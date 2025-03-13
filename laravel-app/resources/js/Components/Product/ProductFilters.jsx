import React, { useEffect, useState } from "react";
import { Heart, Search, SlidersHorizontal } from "lucide-react";
import { useWishlist } from "@/Contexts/WishlistContext";

const ProductFilters = ({ categories, filters, onFilterChange, wishlistCount: propWishlistCount }) => {
    const { wishlist } = useWishlist();
    const contextWishlistCount = wishlist?.length || 0;
    const displayWishlistCount = contextWishlistCount || propWishlistCount || 0;
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isExpanded, setIsExpanded] = useState(true);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle search form submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onFilterChange("search", searchTerm);
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm("");
        onFilterChange("search", "");
    };

    return (
        <div className="lg:w-1/4">
            <div className="bg-white border border-neutral-100 rounded-xl p-6 space-y-8 shadow-sm">
                {/* Mobile toggle */}
                <div className="flex items-center justify-between lg:hidden">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <SlidersHorizontal className="w-5 h-5 mr-2" />
                        Bộ lọc
                    </h2>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        {isExpanded ? "Ẩn" : "Hiện"}
                    </button>
                </div>

                <div className={`space-y-8 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
                    {/* Search Box */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                            Tìm kiếm sản phẩm
                        </h3>
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Nhập tên sản phẩm..."
                                className="w-full border-neutral-200 rounded-lg pl-4 pr-10 py-3 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                            />
                            <button
                                type="submit"
                                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-blue-600 transition-colors"
                                aria-label="Tìm kiếm"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-10 top-0 h-full px-2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Xóa tìm kiếm"
                                >
                                    &times;
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Sort Options */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                            Sắp xếp theo
                        </h3>
                        <select
                            value={filters.sort}
                            onChange={(e) => onFilterChange("sort", e.target.value)}
                            className="w-full border-neutral-200 rounded-lg py-3 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                        >
                            <option value="newest">Sản phẩm mới nhất</option>
                            <option value="price_asc">Giá: Thấp đến cao</option>
                            <option value="price_desc">Giá: Cao đến thấp</option>
                            <option value="name_asc">Tên: A đến Z</option>
                            <option value="name_desc">Tên: Z đến A</option>
                        </select>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                            Danh mục sản phẩm
                        </h3>
                        <div className="space-y-2 mt-3">
                            <button
                                onClick={() => onFilterChange("category", "")}
                                className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                    !filters.category && filters.filter_type !== "wishlist"
                                        ? "bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-500"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                Toàn bộ sản phẩm
                            </button>

                            <button
                                onClick={() => onFilterChange("filter_type", "wishlist")}
                                className={`block w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                                    filters.filter_type === "wishlist"
                                        ? "bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-500"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                <Heart className={`w-4 h-4 mr-2 ${filters.filter_type === "wishlist" ? "fill-blue-700" : ""}`} />
                                Sản phẩm yêu thích
                                {displayWishlistCount > 0 && (
                                    <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {displayWishlistCount}
                                    </span>
                                )}
                            </button>

                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => onFilterChange("category", category.slug)}
                                    className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                        filters.category === category.slug && filters.filter_type !== "wishlist"
                                            ? "bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-500"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductFilters;
