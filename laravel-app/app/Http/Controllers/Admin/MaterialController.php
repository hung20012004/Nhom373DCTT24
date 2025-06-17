<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Http\Resources\MaterialResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class MaterialController extends Controller
{
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
            return response()->json($material, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error creating material'], 500);
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
            return response()->json($material);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating material',
                'error' => $e->getMessage(),
                'data' => $request->all()
            ], 500);
        }
    }

    public function destroy($materialId)
    {
        DB::beginTransaction();

        try {
            $material = Material::findOrFail($materialId);

            if ($material->products()->exists()) {
                return response()->json([
                    'message' => 'Cannot delete material because it has associated products'
                ], 400);
            }

            $material->delete();

            DB::commit();
            return response()->json([
                'message' => 'Material deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Unable to delete material',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
