export default function CategoryList({ categories }) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Danh mục sản phẩm</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {categories.map((category) => (
            <div
              key={category.category_id}
              className="min-w-[120px] text-center p-4 border rounded-lg cursor-pointer hover:shadow-md transition"
            >
              <img
                src={category.image_url || "/api/placeholder/100/100"}
                alt={category.name}
                className="w-16 h-16 mx-auto mb-2"
              />
              <span className="text-sm">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
