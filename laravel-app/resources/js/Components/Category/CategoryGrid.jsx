import React from 'react';
import CategoryCard from './CategoryCard';

const CategoryGrid = ({ categories }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {categories.map((category) => (
        <CategoryCard key={category.category_id} category={category} />
      ))}
    </div>
  );
};

export default CategoryGrid;
