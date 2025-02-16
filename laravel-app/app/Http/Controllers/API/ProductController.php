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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,category_id',
            'material_id' => 'required|exists:materials,material_id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string',
            'is_active' => 'required|boolean',
            'stock' => 'required|integer|min:0',
            'sku' => 'required|string|unique:products,sku'
        ]);

        DB::beginTransaction();
        try {
            $validated['slug'] = Str::slug($validated['name'] . ' ' . uniqid());

            // Handle image URL
            if ($request->has('image_url')) {
                $validated['image_url'] = $request->image_url;
            }

            $product = Product::create($validated);

            // Handle variants if they exist in the request
            if ($request->has('variants')) {
                foreach ($request->variants as $variantData) {
                    $product->variants()->create($variantData);
                }
            }

            DB::commit();
            return response()->json(new ProductResource($product), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error creating product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $productId)
    {
        $rules = [
            'category_id' => 'exists:categories,category_id',
            'material_id' => 'exists:materials,material_id',
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string',
            'is_active' => 'boolean',
            'stock' => 'integer|min:0',
            'sku' => 'string|unique:products,sku,' . $productId . ',product_id'
        ];

        $validated = $request->validate($rules);

        DB::beginTransaction();
        try {
            $product = Product::with(['category', 'material', 'images', 'variants.color', 'variants.size', 'tags'])
                ->findOrFail($productId);

            $updateData = [];

            // Handle basic fields
            foreach ($validated as $key => $value) {
                if ($request->has($key)) {
                    $updateData[$key] = $value;
                }
            }

            // Handle slug if name is updated
            if ($request->has('name')) {
                $updateData['slug'] = Str::slug($validated['name']);
            }

            // Handle image
            if ($request->has('image_url')) {
                if (empty($request->image_url)) {
                    $updateData['image_url'] = null;
                } else {
                    $updateData['image_url'] = $validated['image_url'];
                }
            }

            // Update product
            if (!empty($updateData)) {
                $product->update($updateData);
            }

            // Handle variants update if they exist in the request
            if ($request->has('variants')) {
                // First remove old variants
                $product->variants()->delete();
                // Then create new ones
                foreach ($request->variants as $variantData) {
                    $product->variants()->create($variantData);
                }
            }

            DB::commit();
            return response()->json(new ProductResource($product));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating product',
                'error' => $e->getMessage(),
                'data' => $request->all()
            ], 500);
        }
    }

    public function destroy($productId)
    {
        DB::beginTransaction();

        try {
            $product = Product::findOrFail($productId);

            // Check for any related data that should prevent deletion
            // For example, if the product is in any orders
            if ($product->orders()->exists()) {
                return response()->json([
                    'message' => 'Cannot delete product because it has associated orders'
                ], 400);
            }

            // Delete related variants first
            $product->variants()->delete();

            // Delete related images
            $product->images()->delete();

            // Finally delete the product
            $product->delete();

            DB::commit();
            return response()->json([
                'message' => 'Product deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Cannot delete product',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
