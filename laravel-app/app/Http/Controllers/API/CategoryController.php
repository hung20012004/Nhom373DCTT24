<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::query()
            ->with(['products'])
            ->select('categories.*');

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
    }

    public function featured()
    {
        $categories = Category::where('is_active', true)
            ->select('category_id', 'name', 'image_url', 'slug', 'description')
            ->orderBy('display_order')

            ->get();
        return response()->json($categories);
    }

    public function show($id)
    {
        $category = Category::with(['products'])->findOrFail($id);

        // Organize child categories and product count
        $category->product_count = $category->products()->count();
        $category->has_children = $category->products()->exists();

        return response()->json($category);
    }
}
