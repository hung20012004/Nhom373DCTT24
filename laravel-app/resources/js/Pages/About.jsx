import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import Layout from '@/Layouts/Layout';
import { Link } from '@inertiajs/react';
import { Users, Award, Heart, Clock } from 'lucide-react';
import { Head } from '@inertiajs/react';
const About = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Layout>
         <Head title="About" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Our Shop</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're dedicated to providing the best shopping experience with quality products
            and exceptional customer service.
          </p>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Customer First</h3>
            <p className="text-gray-600">Our customers are at the heart of everything we do</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Award className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quality Products</h3>
            <p className="text-gray-600">We ensure only the best products make it to our shelves</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Heart className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Passion</h3>
            <p className="text-gray-600">We're passionate about delivering excellence</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Quick and reliable shipping to your doorstep</p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-600 mb-4">
              Founded in 2020, we started with a simple mission: to make quality products
              accessible to everyone. What began as a small online store has grown into a
              trusted destination for thousands of satisfied customers.
            </p>
            <p className="text-gray-600 mb-4">
              Our team of dedicated professionals works tirelessly to source the best products,
              negotiate the best prices, and ensure that every customer has a great shopping experience.
            </p>
            <p className="text-gray-600">
              Today, we continue to grow and evolve, always keeping our core values and
              commitment to customer satisfaction at the heart of our business.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Start Shopping Today</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of satisfied customers and experience our quality products and service.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse Our Products
          </Link>
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
    </Layout>
  );
};

export default About;
