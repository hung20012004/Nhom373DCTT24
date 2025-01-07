import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Sản phẩm nổi bật</h2>
        <div className="flex gap-2">
          <select className="border rounded-lg px-4 py-2">
            <option>Sắp xếp theo</option>
            <option>Giá tăng dần</option>
            <option>Giá giảm dần</option>
            <option>Mới nhất</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>
    </div>
  );
}
