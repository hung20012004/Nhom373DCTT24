<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Category::with(['products']);

            // Handle search
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where('name', 'like', "%{$searchTerm}%");
            }

            // Handle sorting
            $sortField = $request->input('sort_field', 'display_order');
            $sortDirection = $request->input('sort_direction', 'asc');

            $allowedSortFields = [
                'name' => 'name',
                'display_order' => 'display_order',
                'created_at' => 'created_at'
            ];

            if (array_key_exists($sortField, $allowedSortFields)) {
                $dbField = $allowedSortFields[$sortField];
                $query->orderBy($dbField, $sortDirection);
            }

            // Handle pagination
            $perPage = $request->input('per_page', 10);
            $perPage = in_array($perPage, [10, 25, 50, 100]) ? $perPage : 10;

            $categories = $query->paginate($perPage);

            return [
                'data' => CategoryResource::collection($categories),
                'current_page' => $categories->currentPage(),
                'per_page' => $categories->perPage(),
                'last_page' => $categories->lastPage(),
                'total' => $categories->total(),
                'sort' => [
                    'field' => $sortField,
                    'direction' => $sortDirection
                ]
            ];

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:categories,category_id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'is_active' => 'required|boolean',
            'display_order' => 'required|integer|min:0'
        ]);

        DB::beginTransaction();
        try {
            $validated['slug'] = Str::slug($validated['name'] . ' ' . uniqid());

            // Handle image upload
            if ($request->hasFile('image')) {
                $validated['image_url'] = $request->file('image')->store('categories', 'public');
            }

            $category = Category::create($validated);

            DB::commit();
            return response()->json(new CategoryResource($category), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error creating category'], 500);
        }
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:categories,category_id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048',
            'is_active' => 'sometimes|boolean',
            'display_order' => 'sometimes|integer|min:0'
        ]);

        DB::beginTransaction();
        try {
            if (isset($validated['name'])) {
                $validated['slug'] = Str::slug($validated['name'] . ' ' . uniqid());
            }

            // Handle image upload
            if ($request->hasFile('image')) {
                if ($category->image_url) {
                    Storage::disk('public')->delete($category->image_url);
                }
                $validated['image_url'] = $request->file('image')->store('categories', 'public');
            }

            $category->update($validated);

            DB::commit();
            return response()->json(new CategoryResource($category));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error updating category'], 500);
        }
    }

    public function destroy(Category $category)
    {
        DB::beginTransaction();
        try {
            if ($category->image_url) {
                Storage::disk('public')->delete($category->image_url);
            }

            $category->delete();

            DB::commit();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error deleting category'], 500);
        }
    }
}
