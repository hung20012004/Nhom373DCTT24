<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::where('is_active', true)
            ->select('category_id', 'name', 'image_url', 'slug', 'description')
            ->orderBy('display_order')
            ->get();

        return response()->json($categories);
    }
}
