import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import Layout from '@/Layouts/Layout';
import axios from 'axios';
import { CategoryGrid, ProductGrid, HeroBanner } from '@/Components';
import { Head } from '@inertiajs/react';

const Welcome = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersResponse, categoriesResponse, productsResponse, wishlistResponse] = await Promise.all([
          axios.get('/api/v1/banners/active'),
          axios.get('/api/v1/categories/featured'),
          axios.get('/api/v1/products/featured'),
          axios.get('/wishlist')
        ]);

        setBanners(bannersResponse.data);
        setCategories(categoriesResponse.data);
        setProducts(productsResponse.data);
        setWishlist(wishlistResponse.data);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
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

  const toggleWishlist = async (productId) => {
    try {
      const response = await axios.post(`/wishlist/toggle/${productId}`);
      if (response.data.added) {
        setWishlist([...wishlist, productId]);
      } else {
        setWishlist(wishlist.filter(id => id !== productId));
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi danh sách yêu thích:', error);
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
          <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head title="Trang Chủ" />

      {/* Phần banner chính */}
      <HeroBanner banners={banners} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Danh mục sản phẩm */}
        <section className="py-20">
          <div className="mb-12 text-center">
            <span className="text-sm uppercase tracking-wider text-neutral-500">Khám Phá</span>
            <h2 className="text-3xl font-light mt-2">Mua sắm theo danh mục</h2>
          </div>
          <CategoryGrid categories={categories} />
        </section>

        {/* Sản phẩm nổi bật */}
        <section className="py-20 border-t border-neutral-200">
          <div className="mb-12 text-center">
            <span className="text-sm uppercase tracking-wider text-neutral-500">Nổi Bật</span>
            <h2 className="text-3xl font-light mt-2">Sản phẩm mới</h2>
          </div>
          <ProductGrid
                products={products}
                onToggleWishlist={toggleWishlist}
                wishlist={wishlist.data || wishlist} // Make sure this contains product IDs
                />
        </section>
      </div>

      {/* Nút cuộn lên đầu trang */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-full shadow-lg transition-all duration-300 hover:bg-white"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </Layout>
  );
};

export default Welcome;
