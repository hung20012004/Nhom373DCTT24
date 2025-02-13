import React, { useState, useEffect } from "react";
import { SlidersHorizontal, Search, ArrowUp } from "lucide-react";
import Layout from "@/Layouts/Layout";
import ProductGrid from "@/Components/Product/ProductGrid";
import { Head } from '@inertiajs/react';
const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: "",
        sort: "newest",
        page: 1,
    });
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Hàm cập nhật URL
    const updateURL = (newFilters) => {
        const params = new URLSearchParams(window.location.search);

        // Cập nhật hoặc xóa params
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        // Thay đổi URL mà không reload trang
        window.history.pushState(
            {},
            "",
            `${window.location.pathname}${
                params.toString() ? `?${params.toString()}` : ""
            }`
        );
    };

    const fetchProducts = async (currentFilters) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            // Chỉ thêm các filter có giá trị
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value) {
                    params.append(key, value);
                }
            });

            const [productsRes, categoriesRes, wishlistRes] = await Promise.all(
                [
                    axios.get(`/api/v1/products?${params.toString()}`),
                    axios.get("/api/v1/categories/featured"),
                    axios.get("/api/v1/wishlist"),
                ]
            );

            setProducts(productsRes.data);
            setCategories(categoriesRes.data || []);
            setWishlist(wishlistRes.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Khởi tạo từ URL params
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const initialFilters = {
            category: urlParams.get("category") || "",
            sort: urlParams.get("sort") || "newest",
            page: parseInt(urlParams.get("page")) || 1,
        };

        setFilters(initialFilters);
        fetchProducts(initialFilters);

        // Xử lý scroll
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Xử lý thay đổi filter
    const handleFilterChange = (name, value) => {
        // Reset các filter khác về default khi chọn category
        const newFilters = {
            ...filters,
            [name]: value,
            page: 1,
        };

        // Nếu đang thay đổi category, reset sort về default
        if (name === "category") {
            newFilters.sort = "newest";
        }

        setFilters(newFilters);
        updateURL(newFilters);
        fetchProducts(newFilters);
    };

    const toggleWishlist = async (productId) => {
        try {
            const response = await axios.post(
                `/api/v1/wishlist/toggle/${productId}`
            );
            if (response.data.added) {
                setWishlist([...wishlist, productId]);
            } else {
                setWishlist(wishlist.filter((id) => id !== productId));
            }
        } catch (error) {
            console.error("Error toggling wishlist:", error);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePageChange = (newPage) => {
        const newFilters = { ...filters, page: newPage };
        setFilters(newFilters);
        updateURL(newFilters);
        fetchProducts(newFilters);
        scrollToTop();
    };

    // Loading state
    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Head title="Products" />
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <section className="py-20">
                        <div className="mb-12 text-center">
                            <span className="text-sm uppercase tracking-wider text-neutral-500">
                                Collection
                            </span>
                            <h2 className="text-3xl font-light mt-2">
                                Our Products
                            </h2>
                            <p className="mt-2 text-neutral-500">
                                Discover our wide range of products
                            </p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-12">
                            {/* Filters Section */}
                            <div className="lg:w-1/4">
                                <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Sort By
                                        </h3>
                                        <select
                                            value={filters.sort}
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    "sort",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border-neutral-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="newest">
                                                Newest
                                            </option>
                                            <option value="price_asc">
                                                Price: Low to High
                                            </option>
                                            <option value="price_desc">
                                                Price: High to Low
                                            </option>
                                            <option value="name_asc">
                                                Name: A to Z
                                            </option>
                                            <option value="name_desc">
                                                Name: Z to A
                                            </option>
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Categories
                                        </h3>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "category",
                                                        ""
                                                    )
                                                }
                                                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                                    !filters.category
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "hover:bg-neutral-50"
                                                }`}
                                            >
                                                All Categories
                                            </button>
                                            {categories.map((category) => (
                                                <button
                                                    key={category.id}
                                                    onClick={() =>
                                                        handleFilterChange(
                                                            "category",
                                                            category.slug
                                                        )
                                                    } // Dùng slug thay vì id
                                                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                                        filters.category ===
                                                        category.slug
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

                            {/* Products Section */}
                            <div className="flex-1">
                                {products.data?.length === 0 ? (
                                    <div className="text-center py-12 bg-white border border-neutral-200 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            No products found
                                        </h3>
                                        <p className="mt-2 text-neutral-500">
                                            Try adjusting your search or filter
                                            criteria
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <ProductGrid
                                            products={products.data || []}
                                            onToggleWishlist={toggleWishlist}
                                            wishlist={wishlist}
                                        />

                                        {/* Pagination */}
                                        {products.meta && (
                                            <div className="mt-8 flex justify-center">
                                                <div className="flex space-x-2">
                                                    {[
                                                        ...Array(
                                                            products.meta
                                                                .last_page
                                                        ),
                                                    ].map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    index + 1
                                                                )
                                                            }
                                                            className={`px-4 py-2 rounded-lg ${
                                                                products.meta
                                                                    .current_page ===
                                                                index + 1
                                                                    ? "bg-blue-600 text-white"
                                                                    : "bg-white border border-neutral-200 hover:bg-neutral-50"
                                                            }`}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Scroll to Top Button */}
                {showScrollTop && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 p-3 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-full shadow-lg transition-all duration-300 hover:bg-white"
                    >
                        <ArrowUp className="w-5 h-5" />
                    </button>
                )}
            </div>
        </Layout>
    );
};

export default ProductsPage;
