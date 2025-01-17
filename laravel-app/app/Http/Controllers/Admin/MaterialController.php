<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Material;
use App\Models\Color;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
class MaterialController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Material::query();

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
            $materials = $query->paginate($perPage);

            return [
                'data' => $materials,
                'current_page' => $materials->currentPage(),
                'per_page' => $materials->perPage(),
                'last_page' => $materials->lastPage(),
                'total' => $materials->total()
            ];
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching materials'], 500);
        }
    }
}
