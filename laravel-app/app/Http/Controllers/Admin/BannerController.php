<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BannerController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string',
            'button_text' => 'nullable|string|max:100',
            'button_link' => 'nullable|string|max:255',
            'image_url' => 'required|string|max:255',
            'is_active' => 'boolean',
            'order_sequence' => 'integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date'
        ]);

        $banner = Banner::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Banner created successfully',
            'data' => $banner
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::find($id);
        $validated = $request->validate([
            'title' => 'string|max:255',
            'subtitle' => 'nullable|string',
            'button_text' => 'nullable|string|max:100',
            'button_link' => 'nullable|string|max:255',
            'image_url' => 'string|max:255',
            'is_active' => 'boolean',
            'order_sequence' => 'integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date'
        ]);

        $banner->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Banner updated successfully',
            'data' => $banner
        ]);
    }

    public function destroy($id)
    {
        $banner = Banner::find($id);
        $banner->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Banner deleted successfully'
        ]);
    }

    public function toggleStatus(Request $request, $id)
    {
        $banner = Banner::find($id);

        if (!$banner) {
            return response()->json([
                'status' => 'error',
                'message' => 'Banner not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $banner->is_active = $request->input('is_active');
        $banner->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Banner status updated successfully',
            'data' => $banner
        ]);
    }
}
