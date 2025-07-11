<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Http\Resources\MaterialResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        $query = Material::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');
        $perPage = $request->input('per_page', 10);

        $materials = $query->paginate($perPage);

        $data = [
            'data' => MaterialResource::collection($materials),
            'meta' => [
                'current_page' => $materials->currentPage(),
                'per_page' => $materials->perPage(),
                'last_page' => $materials->lastPage(),
                'total' => $materials->total(),
                'sort' => [
                    'field' => $sortField,
                    'direction' => $sortDirection
                ]
            ]
        ];

        if ($request->wantsJson()) {
            return response()->json($data);
        }

        return Inertia::render('Admin/Materials/Index', $data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $validated['slug'] = Str::slug($validated['name'] . ' ' . uniqid());
            $material = Material::create($validated);
            DB::commit();

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'data' => new MaterialResource($material)
                ], 201);
            }

            return redirect()->back()->with('success', 'Material created successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error creating material'
                ], 500);
            }

            return redirect()->back()->with('error', 'Error creating material');
        }
    }

    public function update(Request $request, $materialId)
    {
        $rules = [
            'name' => 'string|max:255',
            'description' => 'nullable|string',
        ];

        $validated = $request->validate($rules);

        DB::beginTransaction();
        try {
            $material = Material::findOrFail($materialId);
            $updateData = [];

            if ($request->has('name')) {
                $updateData['name'] = $validated['name'];
                $updateData['slug'] = Str::slug($validated['name']);
            }

            if ($request->has('description')) {
                $updateData['description'] = $validated['description'];
            }

            if (!empty($updateData)) {
                $material->update($updateData);
            }

            DB::commit();

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'data' => new MaterialResource($material)
                ]);
            }

            return redirect()->back()->with('success', 'Material updated successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error updating material'
                ], 500);
            }

            return redirect()->back()->with('error', 'Error updating material');
        }
    }

    public function destroy(Request $request, $materialId)
    {
        DB::beginTransaction();
        try {
            $material = Material::findOrFail($materialId);

            if ($material->products()->exists()) {
                throw new \Exception('Cannot delete material because it has associated products');
            }

            $material->delete();
            DB::commit();

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Material deleted successfully'
                ]);
            }

            return redirect()->back()->with('success', 'Material deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
