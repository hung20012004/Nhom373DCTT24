<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\Category;
use App\Models\Material;
use App\Models\Supplier;
use App\Models\Color;
use App\Models\Size;
use App\Models\Review;
use App\Models\Promotion;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ColorController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Color::query();

            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where('name', 'like', "%{$searchTerm}%");
            }

            $sortField = $request->input('sort_field', 'created_at');
            $sortDirection = $request->input('sort_direction', 'desc');
            $allowedSortFields = ['name', 'created_at'];

            if (in_array($sortField, $allowedSortFields)) {
                $query->orderBy($sortField, $sortDirection);
            }

            $perPage = $request->input('per_page', 10);
            $colors = $query->paginate($perPage);

            return [
                'data' => $colors,
                'current_page' => $colors->currentPage(),
                'per_page' => $colors->perPage(),
                'last_page' => $colors->lastPage(),
                'total' => $colors->total()
            ];
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching colors'], 500);
        }
    }
}
