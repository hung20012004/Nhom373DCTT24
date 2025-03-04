<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()
            ->with([
                'category',
                'material',
                'images',

                'variants.color',
                'variants.size'
            ])
            ->select('*', DB::raw('CASE
                WHEN sale_price > 0 THEN sale_price
                ELSE price
                END as final_price'));

        // Handle search
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Handle category filter
        if ($request->filled('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Handle sorting
        switch ($request->input('sort', 'newest')) {
            case 'price_asc':
                $query->orderByRaw('CASE
                    WHEN sale_price > 0 THEN sale_price
                    ELSE price
                    END ASC');
                break;
            case 'price_desc':
                $query->orderByRaw('CASE
                    WHEN sale_price > 0 THEN sale_price
                    ELSE price
                    END DESC');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'newest':
            default:
                $query->latest('created_at');
                break;
        }

        // Get paginated products
        $products = $query->paginate(12);

        // Transform products data
        $products->getCollection()->transform(function ($product) {
            $variantsGrouped = $product->variants->groupBy(function ($variant) {
                return $variant->color->name;
            })->map(function ($colorGroup) {
                return $colorGroup->pluck('size.name')->unique()->values();
            });

            $product->available_colors = $product->variants->pluck('color')->unique('color_id')->values();
            $product->available_sizes = $product->variants->pluck('size')->unique('size_id')->values();
            $product->variants_matrix = $variantsGrouped;

            return $product;
        });

        return response()->json($products);
    }
    public function featured()
    {
        $products = Product::with([
            'category',
            'material',
            'images',
            'variants.color',
            'variants.size'
        ])->where('is_active', true)
            ->orderBy('sale_price', 'desc')
            ->limit(8)
            ->get();

        // Transform the products data
        $products->transform(function ($product) {
            $variantsGrouped = $product->variants->groupBy(function ($variant) {
                return $variant->color->name;
            })->map(function ($colorGroup) {
                return $colorGroup->pluck('size.name')->unique()->values();
            });

            $product->available_colors = $product->variants->pluck('color')->unique('color_id')->values();
            $product->available_sizes = $product->variants->pluck('size')->unique('size_id')->values();
            $product->variants_matrix = $variantsGrouped;

            return $product;
        });
        return response()->json($products);
    }
}
