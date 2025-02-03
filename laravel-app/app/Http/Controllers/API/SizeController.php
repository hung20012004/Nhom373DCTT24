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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $size = Size::create($validated);

            DB::commit();
            return response()->json(new SizeResource($size), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error creating size'], 500);
        }
    }

    public function update(Request $request, $sizeId)
    {
        $rules = [
            'name' => 'string|max:255',
            'description' => 'nullable|string'
        ];

        $validated = $request->validate($rules);

        DB::beginTransaction();
        try {
            $size = Size::findOrFail($sizeId);
            $updateData = [];

            if ($request->has('name')) {
                $updateData['name'] = $validated['name'];
            }

            if ($request->has('description')) {
                $updateData['description'] = $validated['description'];
            }

            if (!empty($updateData)) {
                $size->update($updateData);
            }

            DB::commit();
            return response()->json(new SizeResource($size));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating size',
                'error' => $e->getMessage(),
                'data' => $request->all()
            ], 500);
        }
    }

    public function destroy($sizeId)
    {
        DB::beginTransaction();

        try {
            $size = Size::findOrFail($sizeId);

            // Check if size has associated variants
            if ($size->variants()->exists()) {
                return response()->json([
                    'message' => 'Cannot delete size because it has associated product variants'
                ], 400);
            }

            $size->delete();

            DB::commit();
            return response()->json([
                'message' => 'Size deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Unable to delete size'], 500);
        }
    }
}
