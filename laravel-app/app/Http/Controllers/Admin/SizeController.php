<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SizeResource;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SizeController extends Controller
{
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
