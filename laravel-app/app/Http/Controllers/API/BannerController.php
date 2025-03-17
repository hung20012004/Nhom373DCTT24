<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $sortField = $request->input('sort_field', 'order_sequence');
        $sortDirection = $request->input('sort_direction', 'asc');

        $query = Banner::select('*');

        // Apply search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($request->has('is_active')) {
            $query->where('is_active', $request->input('is_active'));
        }

        // Apply date filters
        if ($request->has('from_date')) {
            $query->whereDate('start_date', '>=', $request->input('from_date'));
        }

        if ($request->has('to_date')) {
            $query->whereDate('end_date', '<=', $request->input('to_date'));
        }

        // Apply sorting
        $query->orderBy($sortField, $sortDirection);

        // Get paginated results
        $banners = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $banners
        ]);
    }
    public function getActiveBanners()
    {
        // $banners = Banner::where('is_active', true)
        //     ->where(function ($query) {
        //         $today = now()->format('Y-m-d');
        //         $query->whereNull('start_date')
        //             ->orWhereDate('start_date', '<=', $today);
        //     })
        //     ->where(function ($query) {
        //         $today = now()->format('Y-m-d');
        //         $query->whereNull('end_date')
        //             ->orWhereDate('end_date', '>=', $today);
        //     })
        //     ->select([
        //         'id',
        //         'title',
        //         'subtitle',
        //         'button_text',
        //         'button_link',
        //         'image_url',
        //         'order_sequence'
        //     ])
        //     ->orderBy('order_sequence', 'asc')
        //     ->get();

        // return response()->json([
        //     'status' => 'success',
        //     'data' => $banners
        // ]);
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

        return response()->json($banners);
    }
}
