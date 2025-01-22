<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SizeResource;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class SizeController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Size::with(['category', 'material', 'tags']);

            // Handle search
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                      ->orWhere('brand', 'like', "%{$searchTerm}%");
                });
            }

            // Handle sorting
            $sortField = $request->input('sort_field', 'created_at');
            $sortDirection = $request->input('sort_direction', 'desc');

            // Define allowed sort fields and their corresponding database columns
            $allowedSortFields = [
                'brand' => 'brand',
                'name' => 'name',
                'category' => 'category_id',
                'price' => 'price',
                'stock_quantity' => 'stock_quantity',
                'created_at' => 'created_at'
            ];

            if (array_key_exists($sortField, $allowedSortFields)) {
                $dbField = $allowedSortFields[$sortField];

                // Special handling for category sorting
                if ($sortField === 'category') {
                    $query->join('categories', 'products.category_id', '=', 'categories.id')
                          ->orderBy('categories.name', $sortDirection)
                          ->select('products.*');
                } else {
                    $query->orderBy($dbField, $sortDirection);
                }
            }

            // Handle pagination
            $perPage = $request->input('per_page', 10);
            $perPage = in_array($perPage, [10, 25, 50, 100]) ? $perPage : 10;

            $products = $query->paginate($perPage);

            return [
                'data' => SizeResource::collection($products),
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
                'sort' => [
                    'field' => $sortField,
                    'direction' => $sortDirection
                ]
            ];

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching products',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,category_id',
            'material_id' => 'required|exists:materials,material_id',
            'brand' => 'required|string|max:255',
            'gender' => 'required|in:male,female,unisex',
            'care_instruction' => 'nullable|string',
            'season' => 'required|string',
            'min_purchase_quantity' => 'required|integer|min:1',
            'stock_quantity' => 'required|integer|min:0',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'max_purchase_quantity' => 'required|integer|min:1',
            'images.*' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'tags' => 'array',
            'tags.*' => 'exists:tags,tag_id',
            'variants' => 'array',
            'variants.*.size_id' => 'required|exists:sizes,size_id',
            'variants.*.color_id' => 'required|exists:colors,color_id',
            'variants.*.stock_quantity' => 'required|integer|min:0',
            'variants.*.price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $validated['slug'] = Str::slug($validated['brand'] . ' ' . uniqid());

            $product = Size::create($validated);

            // Handle tags
            if (!empty($validated['tags'])) {
                $product->tags()->sync($validated['tags']);
            }

            // Handle variants
            if (!empty($validated['variants'])) {
                foreach ($validated['variants'] as $variant) {
                    $product->variants()->create($variant);
                }
            }

            // Handle images
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('products', 'public');
                    $product->images()->create([
                        'image_url' => $path,
                        'display_order' => $index,
                        'is_primary' => $index === 0
                    ]);
                }
            }

            DB::commit();
            return response()->json($product->load(['category', 'material', 'tags', 'variants', 'images']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error creating product'], 500);
        }
    }

    public function update(Request $request, Size $product)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,category_id',
            'material_id' => 'sometimes|exists:materials,material_id',
            'brand' => 'sometimes|string|max:255',
            'gender' => 'sometimes|in:male,female,unisex',
            'care_instruction' => 'nullable|string',
            'season' => 'sometimes|string',
            'min_purchase_quantity' => 'sometimes|integer|min:1',
            'stock_quantity' => 'sometimes|integer|min:0',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'max_purchase_quantity' => 'sometimes|integer|min:1',
            'new_images.*' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048',
            'tags' => 'array',
            'tags.*' => 'exists:tags,tag_id',
            'variants' => 'array',
            'variants.*.id' => 'sometimes|exists:product_variants,variant_id',
            'variants.*.size_id' => 'required|exists:sizes,size_id',
            'variants.*.color_id' => 'required|exists:colors,color_id',
            'variants.*.stock_quantity' => 'required|integer|min:0',
            'variants.*.price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            if (isset($validated['brand'])) {
                $validated['slug'] = Str::slug($validated['brand'] . ' ' . uniqid());
            }

            $product->update($validated);

            // Handle tags
            if (isset($validated['tags'])) {
                $product->tags()->sync($validated['tags']);
            }

            // Handle variants
            if (isset($validated['variants'])) {
                $existingVariantIds = [];
                foreach ($validated['variants'] as $variant) {
                    if (isset($variant['id'])) {
                        $product->variants()->where('variant_id', $variant['id'])->update($variant);
                        $existingVariantIds[] = $variant['id'];
                    } else {
                        $newVariant = $product->variants()->create($variant);
                        $existingVariantIds[] = $newVariant->variant_id;
                    }
                }
                // Remove variants not in the update
                $product->variants()->whereNotIn('variant_id', $existingVariantIds)->delete();
            }

            // Handle new images
            if ($request->hasFile('new_images')) {
                foreach ($request->file('new_images') as $index => $image) {
                    $path = $image->store('products', 'public');
                    $product->images()->create([
                        'image_url' => $path,
                        'display_order' => $product->images->count() + $index,
                        'is_primary' => false
                    ]);
                }
            }

            // Handle image deletions
            if ($request->has('delete_image_ids')) {
                $imagesToDelete = $product->images()->whereIn('image_id', $request->delete_image_ids)->get();
                foreach ($imagesToDelete as $image) {
                    Storage::disk('public')->delete($image->image_url);
                    $image->delete();
                }
            }

            DB::commit();
            return response()->json($product->load(['category', 'material', 'tags', 'variants', 'images']));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error updating product'], 500);
        }
    }

    public function destroy(Size $product)
    {
        DB::beginTransaction();
        try {
            // Delete related images from storage
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image->image_url);
            }

            // Delete the product (cascade deletion will handle related records)
            $product->delete();

            DB::commit();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error deleting product'], 500);
        }
    }
}
