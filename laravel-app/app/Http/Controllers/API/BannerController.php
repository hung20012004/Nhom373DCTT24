<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function getActiveBanners()
    {
        $banners = Banner::active()
            ->select([
                'id',
                'title',
                'subtitle',
                'button_text',
                'button_link',
                'image_url',
                'order_sequence'
            ])
            ->get();

        return response()->json($banners); // Trả về array trực tiếp
    }
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

    public function update(Request $request, Banner $banner)
    {
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

    public function destroy(Banner $banner)
    {
        $banner->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Banner deleted successfully'
        ]);
    }
}
