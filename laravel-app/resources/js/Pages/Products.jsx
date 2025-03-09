import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import Layout from "@/Layouts/Layout";
import ProductGrid from "@/Components/Product/ProductGrid";
import { Head } from "@inertiajs/react";
import ProductFilters from "@/Components/Product/ProductFilters";

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: "",
        sort: "newest",
        page: 1,
        filter_type: "", // Thêm filter_type để xác định đang lọc theo loại nào
    });
    const [showScrollTop, setShowScrollTop] = useState(false);

    const updateURL = (newFilters) => {
        const params = new URLSearchParams(window.location.search);

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

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

            // Add all filter values except filter_type to params
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value && key !== 'filter_type') {
                    params.append(key, value);
                }
            });

            // First get categories and wishlist data
            const [categoriesRes, wishlistRes] = await Promise.all([
                axios.get("/api/v1/categories/featured"),
                axios.get("/wishlist")
            ]);

            let productsRes;

            // Handle wishlist filter
            if (currentFilters.filter_type === 'wishlist') {
                // Format wishlist data
                const wishlistData = wishlistRes.data?.data || wishlistRes.data || [];
                const wishlistProductIds = Array.isArray(wishlistData)
                    ? wishlistData.map(item => typeof item === 'object' ? item.product_id : item)
                    : [];

                if (wishlistProductIds.length > 0) {
                    // If there are wishlist items, get them from the API
                    params.append('ids', wishlistProductIds.join(','));
                    productsRes = await axios.get(`/api/v1/products?${params.toString()}`);
                } else {
                    // Return empty data if wishlist is empty
                    productsRes = {
                        data: {
                            data: [],
                            current_page: 1,
                            last_page: 1
                        }
                    };
                }
            } else {
                // Normal product filtering
                productsRes = await axios.get(`/api/v1/products?${params.toString()}`);
            }

            setProducts(productsRes.data);
            setCategories(categoriesRes.data || []);

            // Format wishlist data for state
            const wishlistData = wishlistRes.data?.data || wishlistRes.data || [];
            const formattedWishlist = Array.isArray(wishlistData)
                ? wishlistData.map(item => typeof item === 'object' ? item.product_id : item)
                : [];

            setWishlist(formattedWishlist);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const initialFilters = {
            category: urlParams.get("category") || "",
            sort: urlParams.get("sort") || "newest",
            page: parseInt(urlParams.get("page")) || 1,
            filter_type: urlParams.get("filter_type") || "",
        };

        setFilters(initialFilters);
        fetchProducts(initialFilters);

        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleFilterChange = (name, value) => {
        let newFilters = {
            ...filters,
            [name]: value,
            page: 1,
        };

        // Nếu đang chọn category thông thường hoặc toàn bộ sản phẩm, reset filter_type
        if (name === "category") {
            newFilters.filter_type = "";
            newFilters.sort = "newest";
        }

        // Nếu đang chọn filter_type là wishlist, reset category
        if (name === "filter_type" && value === "wishlist") {
            newFilters.category = "";
        }

        setFilters(newFilters);
        updateURL(newFilters);
        fetchProducts(newFilters);
    };

    const toggleWishlist = async (productId) => {
        try {
            const response = await axios.post(`/wishlist/toggle/${productId}`);

            if (response.data.added) {
                setWishlist(prev => [...prev, productId]);
            } else {
                setWishlist(prev => prev.filter(id => id !== productId));

                // Nếu đang xem danh sách yêu thích, cần refresh lại danh sách sản phẩm
                if (filters.filter_type === 'wishlist') {
                    fetchProducts(filters);
                }
            }

            // Refresh danh sách wishlist
            const refreshWishlist = await axios.get("/wishlist");
            const wishlistData = refreshWishlist.data?.data || refreshWishlist.data || [];
            const formattedWishlist = Array.isArray(wishlistData)
                ? wishlistData.map(item => typeof item === 'object' ? item.product_id : item)
                : [];

            setWishlist(formattedWishlist);
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
                                Bộ sưu tập
                            </span>
                            <h2 className="text-3xl font-light mt-2">
                                {filters.filter_type === 'wishlist'
                                    ? 'Sản phẩm yêu thích của bạn'
                                    : 'Sản phẩm của chúng tôi'}
                            </h2>
                            <p className="mt-2 text-neutral-500">
                                {filters.filter_type === 'wishlist'
                                    ? 'Danh sách những sản phẩm bạn đã thêm vào yêu thích'
                                    : 'Tìm kiếm sản phẩm phù hợp với nhu cầu của bạn'}
                            </p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-12">
                            <ProductFilters
                                categories={categories}
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                wishlistCount={wishlist.length}
                            />

                            <div className="flex-1">
                                {products &&
                                products.data &&
                                products.data.length === 0 ? (
                                    <div className="text-center py-12 bg-white border border-neutral-200 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {filters.filter_type === 'wishlist'
                                                ? 'Bạn chưa có sản phẩm yêu thích nào'
                                                : 'Chúng tôi không tìm thấy sản phẩm nào'}
                                        </h3>
                                        <p className="mt-2 text-neutral-500">
                                            {filters.filter_type === 'wishlist'
                                                ? 'Hãy thêm sản phẩm vào danh sách yêu thích để xem tại đây'
                                                : 'Hãy thử tìm kiếm lại hoặc xem các sản phẩm khác'}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <ProductGrid
                                            products={products.data || []}
                                            onToggleWishlist={toggleWishlist}
                                            wishlist={wishlist}
                                        />

                                        {products &&
                                            products.last_page &&
                                            products.last_page > 1 && (
                                                <div className="mt-8 flex justify-center">
                                                    <div className="flex space-x-2">
                                                        {[...Array(products.last_page)].map((_, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handlePageChange(index + 1)}
                                                                className={`px-4 py-2 rounded-lg ${
                                                                    products.current_page === index + 1
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
