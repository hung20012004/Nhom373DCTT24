<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TagController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255'
        ]);

        DB::beginTransaction();
        try {
            $tag = Tag::create($validated);

            DB::commit();
            return response()->json(new TagResource($tag), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error creating tag'], 500);
        }
    }

    public function update(Request $request, $tagId)
    {
        $rules = [
            'name' => 'string|max:255',
            'slug' => 'nullable|string|max:255'
        ];

        $validated = $request->validate($rules);

        DB::beginTransaction();
        try {
            $tag = Tag::findOrFail($tagId);
            $updateData = [];

            if ($request->has('name')) {
                $updateData['name'] = $validated['name'];
            }

            if ($request->has('slug')) {
                $updateData['slug'] = $validated['slug'];
            }

            if (!empty($updateData)) {
                $tag->update($updateData);
            }

            DB::commit();
            return response()->json(new TagResource($tag));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating tag',
                'error' => $e->getMessage(),
                'data' => $request->all()
            ], 500);
        }
    }

    public function destroy($tagId)
    {
        DB::beginTransaction();

        try {
            $tag = Tag::findOrFail($tagId);

            $tag->delete();

            DB::commit();
            return response()->json([
                'message' => 'Tag deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Unable to delete tag'], 500);
        }
    }
}
