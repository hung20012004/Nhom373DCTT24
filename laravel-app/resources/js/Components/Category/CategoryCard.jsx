import React from 'react';
import { Link } from '@inertiajs/react';

const CategoryCard = ({ category }) => {
  return (
    <Link
      href={`/products?category=${category.slug}`} // Thay đổi đường dẫn này
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={category.image_url}
          alt={category.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
        {category.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
};

export default CategoryCard;
