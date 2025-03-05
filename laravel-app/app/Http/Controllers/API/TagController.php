<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $query = Tag::query()
            ->select('tags.*');

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where('name', 'like', "%{$searchTerm}%");
        }

        // Handle sorting
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        $allowedSortFields = [
            'name' => 'name',
        ];

        if (array_key_exists($sortField, $allowedSortFields)) {
            $dbField = $allowedSortFields[$sortField];
            $query->orderBy($dbField, $sortDirection);
        }

        // Handle pagination
        $perPage = $request->input('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50, 100]) ? $perPage : 10;

        $tags = $query->paginate($perPage);

        return [
            'data' => TagResource::collection($tags),
            'current_page' => $tags->currentPage(),
            'per_page' => $tags->perPage(),
            'last_page' => $tags->lastPage(),
            'total' => $tags->total(),
            'sort' => [
                'field' => $sortField,
                'direction' => $sortDirection
            ]
        ];
    }

    public function show($id)
    {
        $tag = Tag::with(['products'])->findOrFail($id);
        return response()->json(new TagResource($tag));
    }

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
