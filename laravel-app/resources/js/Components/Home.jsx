import React, { useEffect, useState } from 'react';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories and products from your API
    const fetchData = async () => {
      try {
        // Replace with your actual API endpoints
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products')
        ]);

        const categoriesData = await categoriesResponse.json();
        const productsData = await productsResponse.json();

        setCategories(categoriesData);
        setProducts(productsData);
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
};

export default Home;
