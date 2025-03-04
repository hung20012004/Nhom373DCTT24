<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Http\Resources\MaterialResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        $query = Material::query()
            ->with(['products'])
            ->select('materials.*');

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        // Handle sorting
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        $allowedSortFields = [
            'name' => 'name',
            'created_at' => 'created_at'
        ];

        if (array_key_exists($sortField, $allowedSortFields)) {
            $dbField = $allowedSortFields[$sortField];
            $query->orderBy($dbField, $sortDirection);
        }

        // Handle pagination
        $perPage = $request->input('per_page', 12);
        $perPage = in_array($perPage, [12, 24, 36, 48]) ? $perPage : 12;

        $materials = $query->paginate($perPage);

        return [
            'data' => MaterialResource::collection($materials),
            'current_page' => $materials->currentPage(),
            'per_page' => $materials->perPage(),
            'last_page' => $materials->lastPage(),
            'total' => $materials->total(),
            'sort' => [
                'field' => $sortField,
                'direction' => $sortDirection
            ]
        ];
    }

    public function show($id)
    {
        $material = Material::with(['products'])->findOrFail($id);

        // Add additional information
        $material->product_count = $material->products()->count();
        $material->has_products = $material->products()->exists();

        return response()->json($material);
    }
}
