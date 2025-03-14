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

class ProductController extends Controller
{
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
            'tags.*' => 'exists:tags,id',
            'variants' => 'nullable|array',
            'variants.*.size_id' => 'required|exists:sizes,id',
            'variants.*.color_id' => 'required|exists:colors,id',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.stock_quantity' => 'required|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Create the core product data
            $productData = [
                'category_id' => $validated['category_id'],
                'material_id' => $validated['material_id'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'sale_price' => $validated['sale_price'] ?? null,
                'stock_quantity' => $validated['stock_quantity'],
                'min_purchase_quantity' => $validated['min_purchase_quantity'] ?? 1,
                'max_purchase_quantity' => $validated['max_purchase_quantity'] ?? 10,
                'gender' => $validated['gender'] ?? 'unisex',
                'care_instruction' => $validated['care_instruction'] ?? null,
                'brand' => $validated['brand'] ?? null,
                'sku' => $validated['sku'],
                'slug' => Str::slug($validated['name'] . ' ' . uniqid()),
                'is_active' => $validated['is_active'],
            ];

            // Create product
            $product = Product::create($productData);

            // Handle tags
            if ($request->has('tags') && is_array($request->tags)) {
                $product->tags()->sync($request->tags);
            }

            // Handle variants
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

            // Handle images
            if ($request->has('images')) {
                $images = json_decode($request->images, true);
                if (is_array($images)) {
                    foreach ($images as $index => $imageData) {
                        if ($imageData['type'] === 'new' && isset($imageData['url'])) {
                            $product->images()->create([
                                'image_url' => $imageData['url'],
                                'display_order' => $imageData['order'] ?? $index,
                                'is_primary' => $index === 0 // First image is primary
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
            return response()->json([
                'success' => false,
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
            'stock_quantity' => 'integer|min:0',
            'min_purchase_quantity' => 'nullable|integer|min:1',
            'max_purchase_quantity' => 'nullable|integer|min:1',
            'gender' => 'nullable|string',
            'care_instruction' => 'nullable|string',
            'brand' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'sku' => 'string|unique:products,sku,' . $productId . ',product_id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'variants' => 'nullable|array',
            'variants.*.size_id' => 'required|exists:sizes,id',
            'variants.*.color_id' => 'required|exists:colors,id',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.stock_quantity' => 'required|integer|min:0',
        ];

        $validated = $request->validate($rules);

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
                        if ($imageData['type'] === 'new' && isset($imageData['url'])) {
                            // Create new image
                            $product->images()->create([
                                'image_url' => $imageData['url'],
                                'display_order' => $imageData['order'] ?? $index,
                                'is_primary' => $index === 0
                            ]);
                        } else if ($imageData['type'] === 'existing' && isset($imageData['image_id'])) {
                            // Update existing image
                            $existingImage = ProductImage::find($imageData['image_id']);
                            if ($existingImage) {
                                $existingImage->update([
                                    'display_order' => $imageData['order'] ?? $index,
                                    'is_primary' => $index === 0
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
