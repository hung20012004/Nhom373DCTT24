import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import Layout from '@/Layouts/Layout';
import axios from 'axios';
import { CategoryGrid, ProductGrid } from '@/Components';

const Welcome = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, productsResponse, wishlistResponse] = await Promise.all([
          axios.get('/api/v1/categories'),
          axios.get('/api/v1/products/featured'),
          axios.get('/api/v1/wishlist')
        ]);

        setCategories(categoriesResponse.data);
        setProducts(productsResponse.data);
        setWishlist(wishlistResponse.data);

        const indexes = {};
        productsResponse.data.forEach(product => {
          indexes[product.product_id] = 0;
        });
        setCurrentImageIndexes(indexes);
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

  const nextImage = (productId) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [productId]: (prev[productId] + 1) % (products.find(p => p.product_id === productId)?.images?.length || 1)
    }));
  };

  const prevImage = (productId) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [productId]: (prev[productId] - 1 + (products.find(p => p.product_id === productId)?.images?.length || 1)) %
                   (products.find(p => p.product_id === productId)?.images?.length || 1)
    }));
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
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
          <CategoryGrid categories={categories} />
        </section>

        {/* Featured Products Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
          <ProductGrid
            products={products}
            currentImageIndexes={currentImageIndexes}
            onPrevImage={prevImage}
            onNextImage={nextImage}
            onToggleWishlist={toggleWishlist}
            wishlist={wishlist}
          />
        </section>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        )}
      </div>
    </Layout>
  );
};

export default Welcome;
