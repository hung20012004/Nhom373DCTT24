<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'variants', 'images'])
            ->select('products.*')
            ->where('products.is_active', true);

        // Xử lý sort
        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'price_asc':
                    $query->orderBy('sale_price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('sale_price', 'desc');
                    break;
                case 'newest':
                    $query->latest();
                    break;
                default:
                    $query->latest();
            }
        }

        // Xử lý filter by category
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        $products = $query->paginate(12);

        return response()->json($products);
    }

    public function featured()
{
    $products = Product::with(['category', 'variants', 'images'])
        ->where('is_active', true)
        ->orderBy('sale_price', 'desc')
        ->limit(8)
        ->get();

    // Thêm dòng này để debug
    logger()->info('Products data', ['products' => $products]);

    return response()->json($products);
}
}
