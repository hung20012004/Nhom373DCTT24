<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with([
            'category',
            'material',
            'images',
            'variants.color',
            'variants.size'
        ])->select('products.*')
          ->where('products.is_active', true);

        // Handle sorting
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

        // Handle category filter
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // Handle material filter
        if ($request->has('material')) {
            $query->where('material_id', $request->material);
        }

        $products = $query->paginate(12);

        // Transform the products data to include organized variants
        $products->through(function ($product) {
            // Group variants by color and size
            $variantsGrouped = $product->variants->groupBy(function ($variant) {
                return $variant->color->name;
            })->map(function ($colorGroup) {
                return $colorGroup->pluck('size.name')->unique()->values();
            });

            // Add organized variants to the product
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

    public function show($id)
    {
        $product = Product::with([
            'category',
            'material',
            'images',
            'variants.color',
            'variants.size'
        ])->findOrFail($id);

        // Organize variants data
        $variantsGrouped = $product->variants->groupBy(function ($variant) {
            return $variant->color->name;
        })->map(function ($colorGroup) {
            return $colorGroup->pluck('size.name')->unique()->values();
        });

        $product->available_colors = $product->variants->pluck('color')->unique('color_id')->values();
        $product->available_sizes = $product->variants->pluck('size')->unique('size_id')->values();
        $product->variants_matrix = $variantsGrouped;

        return response()->json($product);
    }
}
