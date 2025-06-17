<?php

namespace App\Http\Controllers\Admin;

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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $color = Color::create($validated);

            DB::commit();
            return response()->json($color, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error creating color'], 500);
        }
    }

    public function update(Request $request, $colorId)
    {
        $rules = [
            'name' => 'string|max:255',
            'description' => 'nullable|string'
        ];

        $validated = $request->validate($rules);

        DB::beginTransaction();
        try {
            $color = Color::findOrFail($colorId);
            $updateData = [];

            if ($request->has('name')) {
                $updateData['name'] = $validated['name'];
            }

            if ($request->has('description')) {
                $updateData['description'] = $validated['description'];
            }

            if (!empty($updateData)) {
                $color->update($updateData);
            }

            DB::commit();
            return response()->json($color);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating color',
                'error' => $e->getMessage(),
                'data' => $request->all()
            ], 500);
        }
    }

    public function destroy($colorId)
    {
        DB::beginTransaction();

        try {
            $color = Color::findOrFail($colorId);

            // Check if color has associated variants
            if ($color->variants()->exists()) {
                return response()->json([
                    'message' => 'Cannot delete color because it has associated product variants'
                ], 400);
            }

            $color->delete();

            DB::commit();
            return response()->json([
                'message' => 'Color deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Unable to delete color'], 500);
        }
    }
}
