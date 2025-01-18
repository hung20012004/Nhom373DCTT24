import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Search, ArrowUp } from 'lucide-react';
import Layout from '@/Layouts/Layout';
import ProductGrid from '@/Components/Product/ProductGrid';
import axios from 'axios';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    sort: 'newest',
    page: 1
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        try {
          const [categoriesRes, productsRes, wishlistRes] = await Promise.all([
            axios.get('/api/v1/categories'),
            axios.get('/api/v1/products/featured'),
            axios.get('/api/v1/wishlist')
          ]);

          // Log để debug
          console.log('Categories:', categoriesRes.data);
          console.log('Products:', productsRes.data);
          console.log('Wishlist:', wishlistRes.data);

          // Kiểm tra data trước khi set state
          const productsData = Array.isArray(productsRes.data) ? productsRes.data : [];
          const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
          const wishlistData = Array.isArray(wishlistRes.data) ? wishlistRes.data : [];

          setCategories(categoriesData);
          setProducts(productsData);
          setWishlist(wishlistData);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const toggleWishlist = async (productId) => {
    try {
      const response = await axios.post(`/api/v1/wishlist/toggle/${productId}`);
      if (response.data.added) {
        setWishlist([...wishlist, productId]);
      } else {
        setWishlist(wishlist.filter(id => id !== productId));
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12 text-center">
            <span className="text-sm uppercase tracking-wider text-neutral-500">Collection</span>
            <h1 className="text-4xl font-light mt-2">Our Products</h1>
            <p className="mt-2 text-neutral-500">Discover our wide range of products</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-12">
            {/* Filters Section */}
            <div className="sm:w-1/4">
              <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">Sort By</h3>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">Categories</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className={`block w-full text-left px-2 py-1 rounded ${
                        filters.category === '' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
  <button
    key={category.id} // Đảm bảo category.id tồn tại
    onClick={() => handleFilterChange('category', category.id)}
    className={`block w-full text-left px-2 py-1 rounded ${
      filters.category === category.id
        ? 'bg-blue-50 text-blue-700'
        : 'hover:bg-gray-50'
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
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <ProductGrid
                  products={products}
                  onToggleWishlist={toggleWishlist}
                  wishlist={wishlist}
                />
              )}
            </div>
          </div>
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
