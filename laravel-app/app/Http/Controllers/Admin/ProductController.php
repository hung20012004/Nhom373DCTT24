<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'material', 'images', 'variants.color', 'variants.size', 'tags']);

        // Handle search
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        // Handle sorting
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        $allowedSortFields = [
            'name' => 'name',
            'price' => 'price',
            'created_at' => 'created_at'
        ];

        if (array_key_exists($sortField, $allowedSortFields)) {
            $query->orderBy($allowedSortFields[$sortField], $sortDirection);
        }

        // Handle pagination
        $perPage = $request->input('per_page', 10);
        $products = $query->paginate($perPage);

        $data = [
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
                'sort' => [
                    'field' => $sortField,
                    'direction' => $sortDirection
                ]
            ]
        ];

        if ($request->wantsJson()) {
            return response()->json($data);
        }

        return Inertia::render('Admin/Products/Index', $data);
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
            'is_active' => 'required|boolean',
            'stock_quantity' => 'required|integer|min:0',
            'min_purchase_quantity' => 'nullable|integer|min:1',
            'max_purchase_quantity' => 'nullable|integer|min:1',
            'gender' => 'nullable|string',
            'care_instruction' => 'nullable|string',
            'brand' => 'nullable|string|max:100',
            'sku' => 'required|string|unique:products,sku',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,tag_id',
            'variants' => 'nullable|array',
            'variants.*.size_id' => 'required|exists:sizes,size_id',
            'variants.*.color_id' => 'required|exists:colors,color_id',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.stock_quantity' => 'required|integer|min:0',
        ]);

        // In ra dữ liệu nhận được từ request để kiểm tra
        Log::info('Product data received:', $request->all());

        DB::beginTransaction();
        try {
            // Create the core product data - đảm bảo trường name được đưa vào
            $productData = [
                'category_id' => $request->category_id,
                'material_id' => $request->material_id,
                'name' => $request->name, // Đảm bảo name được lấy từ request
                'description' => $request->description ?? null,
                'price' => $request->price,
                'sale_price' => $request->sale_price ?? null,
                'stock_quantity' => $request->stock_quantity,
                'min_purchase_quantity' => $request->min_purchase_quantity ?? 1,
                'max_purchase_quantity' => $request->max_purchase_quantity ?? 10,
                'gender' => $request->gender ?? 'unisex',
                'care_instruction' => $request->care_instruction ?? null,
                'brand' => $request->brand ?? null,
                'sku' => $request->sku,
                'slug' => Str::slug($request->name . ' ' . uniqid()),
                'is_active' => $request->is_active,
            ];

            // In ra dữ liệu sản phẩm trước khi tạo
            Log::info('Product data before create:', $productData);

            $product = Product::create($productData);

            if ($request->has('tags') && is_array($request->tags)) {
                $product->tags()->sync($request->tags);
            }


            if ($request->has('variants') && is_array($request->variants)) {
                foreach ($request->variants as $variantData) {
                    $product->variants()->create([
                        'size_id' => $variantData['size_id'],
                        'color_id' => $variantData['color_id'],
                        'price' => $variantData['price'],
                        'stock_quantity' => $variantData['stock_quantity'],
                    ]);
                }
            }

            if ($request->has('images')) {
                $images = json_decode($request->images, true);
                if (is_array($images)) {
                    foreach ($images as $index => $imageData) {
                        if ($imageData['type'] === 'new' && isset($imageData['image_url'])) {
                            // Make sure product_id is explicitly set
                            ProductImage::create([
                                'product_id' => $product->product_id,  // This line is problematic
                                'image_url' => $imageData['image_url'],
                                'display_order' => $imageData['display_order'] ?? $index,
                                'is_primary' => $imageData['is_primary'] ?? ($index === 0)
                            ]);
                        }
                    }
                }
            }
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => new ProductResource($product->fresh(['category', 'material', 'images', 'variants.color', 'variants.size', 'tags']))
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating product: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Error creating product',
                'error' => $e->getMessage(),
                'request_data' => $request->all() // Thêm dữ liệu request vào response
            ], 500);
        }
    }

    public function show(Request $request, $productId)
    {
        try {
            $product = Product::with(['category', 'material', 'images', 'variants.color', 'variants.size', 'tags'])
                ->findOrFail($productId);

            $data = new ProductResource($product);

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'data' => $data
                ]);
            }

            return Inertia::render('Admin/Products/Show', [
                'product' => $data
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching product: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error fetching product details'
                ], 500);
            }

            return redirect()->back()->with('error', 'Error fetching product details');
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
            'stock_quantity' => 'integer|min:0',
            'min_purchase_quantity' => 'nullable|integer|min:1',
            'max_purchase_quantity' => 'nullable|integer|min:1',
            'gender' => 'nullable|string',
            'care_instruction' => 'nullable|string',
            'brand' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'sku' => 'string|unique:products,sku,' . $productId . ',product_id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,tag_id',
            'variants' => 'nullable|array',
            'variants.*.size_id' => 'required|exists:sizes,size_id',
            'variants.*.color_id' => 'required|exists:colors,color_id',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.stock_quantity' => 'required|integer|min:0',
        ];

        $validated = $request->validate($rules);

        // In ra dữ liệu nhận được từ request để kiểm tra
        Log::info('Product update data received:', $request->all());

        DB::beginTransaction();
        try {
            $product = Product::findOrFail($productId);

            // Update basic product fields
            $updateData = [];
            $validFields = [
                'category_id', 'material_id', 'name', 'description', 'price',
                'sale_price', 'stock_quantity', 'min_purchase_quantity',
                'max_purchase_quantity', 'gender', 'care_instruction',
                'brand', 'is_active', 'sku'
            ];

            foreach ($validFields as $field) {
                if ($request->has($field)) {
                    $updateData[$field] = $request->input($field);
                }
            }

            // Update slug if name is provided
            if ($request->has('name')) {
                $updateData['slug'] = Str::slug($request->name . ' ' . uniqid());
            }

            // Log update data
            Log::info('Product update data:', $updateData);

            // Update the product
            if (!empty($updateData)) {
                $product->update($updateData);
            }

            // Handle tags
            if ($request->has('tags')) {
                $product->tags()->sync($request->tags);
            }

            // Handle variants
            if ($request->has('variants')) {
                // Delete existing variants
                $product->variants()->delete();

                // Create new variants
                foreach ($request->variants as $variantData) {
                    $product->variants()->create([
                        'size_id' => $variantData['size_id'],
                        'color_id' => $variantData['color_id'],
                        'price' => $variantData['price'],
                        'stock_quantity' => $variantData['stock_quantity'],
                    ]);
                }
            }

            // Handle images
            if ($request->has('images')) {
                $images = json_decode($request->images, true);
                if (is_array($images)) {
                    // Track existing image IDs to determine which ones to delete
                    $existingImageIds = [];

                    foreach ($images as $index => $imageData) {
                        if ($imageData['type'] === 'new' && isset($imageData['image_url'])) {
                            // Create new image
                            $product->images()->create([
                                'image_url' => $imageData['image_url'],
                                'display_order' => $imageData['display_order'] ?? $index,
                                'is_primary' => $imageData['is_primary'] ?? ($index === 0)
                            ]);
                        } else if ($imageData['type'] === 'existing' && isset($imageData['image_id'])) {
                            // Update existing image
                            $existingImage = ProductImage::find($imageData['image_id']);
                            if ($existingImage) {
                                $existingImage->update([
                                    'display_order' => $imageData['display_order'] ?? $index,
                                    'is_primary' => $imageData['is_primary'] ?? ($index === 0)
                                ]);
                                $existingImageIds[] = $imageData['image_id'];
                            }
                        }
                    }

                    // Delete images that are no longer in the list
                    $product->images()
                            ->whereNotIn('image_id', $existingImageIds)
                            ->delete();
                }
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => new ProductResource($product->fresh(['category', 'material', 'images', 'variants.color', 'variants.size', 'tags']))
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating product: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
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

            // Explicitly delete related records
            $product->images()->delete();
            $product->variants()->delete();
            $product->tags()->detach();

            // Delete the product
            $product->delete();

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error deleting product',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
