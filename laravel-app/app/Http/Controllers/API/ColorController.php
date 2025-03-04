<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\ColorResource;
use App\Models\Color;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ColorController extends Controller
{
    public function index(Request $request)
    {
        $query = Color::query()
            ->with(['variants'])
            ->select('colors.*');

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where('name', 'like', "%{$searchTerm}%");
        }

        // Handle sorting
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        $allowedSortFields = [
            'name' => 'name'
        ];

        if (array_key_exists($sortField, $allowedSortFields)) {
            $dbField = $allowedSortFields[$sortField];
            $query->orderBy($dbField, $sortDirection);
        }

        // Handle pagination
        $perPage = $request->input('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50, 100]) ? $perPage : 10;

        $colors = $query->paginate($perPage);

        return [
            'data' => ColorResource::collection($colors),
            'current_page' => $colors->currentPage(),
            'per_page' => $colors->perPage(),
            'last_page' => $colors->lastPage(),
            'total' => $colors->total(),
            'sort' => [
                'field' => $sortField,
                'direction' => $sortDirection
            ]
        ];
    }

    public function show($id)
    {
        $color = Color::with(['variants'])->findOrFail($id);
        return response()->json($color);
    }
}
