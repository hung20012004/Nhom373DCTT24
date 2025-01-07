export default function ProductCard({ product }) {
    return (
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
        <img
          src={product.image_url || "/api/placeholder/300/300"}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold mb-2">{product.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-red-500">
              ${product.sale_price}
            </span>
            {product.price > product.sale_price && (
              <span className="text-sm line-through text-gray-400">
                ${product.price}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Thêm vào giỏ
            </button>
            <button className="p-2 border rounded-lg hover:bg-gray-50">
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }
