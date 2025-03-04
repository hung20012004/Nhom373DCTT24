<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\SizeResource;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SizeController extends Controller
{
    public function index(Request $request)
    {
        $query = Size::query()
            ->with(['variants'])
            ->select('sizes.*');

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

        $sizes = $query->paginate($perPage);

        return [
            'data' => SizeResource::collection($sizes),
            'current_page' => $sizes->currentPage(),
            'per_page' => $sizes->perPage(),
            'last_page' => $sizes->lastPage(),
            'total' => $sizes->total(),
            'sort' => [
                'field' => $sortField,
                'direction' => $sortDirection
            ]
        ];
    }

    public function show($id)
    {
        $size = Size::with(['variants'])->findOrFail($id);
        return response()->json(new SizeResource($size));
    }
}
