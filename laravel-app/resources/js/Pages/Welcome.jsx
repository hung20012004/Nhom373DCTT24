import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '@/Components/Header';
import CategoryList from '@/Components/CategoryList';
import ProductGrid from '@/Components/ProductGrid';

export default function Welcome() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [categoriesResponse, productsResponse] = await Promise.all([
                axios.get('/api/v1/categories'),
                axios.get('/api/v1/products/featured')
            ]);

            setCategories(categoriesResponse.data);
            setProducts(productsResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, []);
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <CategoryList categories={categories} />
        <ProductGrid products={products} />
      </main>
    </div>
  );
}
