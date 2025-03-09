<?php

namespace App\Http\Controllers\Customer;

use App\Models\Wishlist;
use App\Models\Product;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    public function index()
    {
        // Lấy danh sách product_id từ bảng wishlist
        $wishlistItems = Wishlist::where('user_id', Auth::id())->get();

        // Lấy thông tin sản phẩm dựa trên product_id
        $productIds = $wishlistItems->pluck('product_id');
        $products = Product::whereIn('product_id', $productIds)
            ->with(['images', 'variants'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,product_id',
        ]);

        // Kiểm tra đã có trong wishlist chưa
        $exists = Wishlist::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => true,
                'message' => 'Product already in wishlist',
            ]);
        }

        // Thêm vào wishlist
        $wishlist = new Wishlist();
        $wishlist->user_id = Auth::id();
        $wishlist->product_id = $request->product_id;
        $wishlist->save();

        return response()->json([
            'success' => true,
            'message' => 'Product added to wishlist successfully',
        ]);
    }

    public function remove($id)
    {
        $deleted = Wishlist::where('user_id', Auth::id())
        ->where('product_id', $id)
        ->delete();

    if (!$deleted) {
        return response()->json([
            'success' => false,
            'message' => 'Product not found in wishlist',
        ], 404);
    }

    return response()->json([
        'success' => true,
        'message' => 'Product removed from wishlist successfully',
    ]);
    }

    public function clear()
    {
        Wishlist::where('user_id', Auth::id())->delete();

        return response()->json([
            'success' => true,
            'message' => 'Wishlist cleared successfully',
        ]);
    }

    public function check($productId)
    {
        $exists = Wishlist::where('user_id', Auth::id())
            ->where('product_id', $productId)
            ->exists();

        return response()->json([
            'success' => true,
            'inWishlist' => $exists
        ]);
    }
}
