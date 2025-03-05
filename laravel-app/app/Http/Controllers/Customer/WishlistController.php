<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\WishlistResource;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    public function index()
    {
        try {
            $wishlists = Wishlist::query()
            ->where('user_id', Auth::id())
            ->with(['product' => function($query) {
                $query->with(['images', 'category', 'material']);
            }])
            ->get();

            return response()->json([
                'status' => 'success',
                'data' => $wishlists
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // public function products()
    // {
    //     try {
    //         $wishlistProducts = Wishlist::query()


    //             $user = Auth::user();
    //         return response()->json([
    //             'status' => 'success',
    //             'data' => $wishlistProducts
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => 'Error fetching wishlist',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function toggle(Request $request, int $productId)
    {
        try {
            // Kiểm tra sản phẩm có tồn tại
            $product = Product::find($productId);
            if (!$product) {
                return response()->json([
                    'message' => 'Product not found'
                ], 404);
            }

            $userId = Auth::id();
            $existingWishlistItem = Wishlist::where('user_id', $userId)
                ->where('product_id', $productId)
                ->first();

            if ($existingWishlistItem) {
                // Nếu đã có trong wishlist thì xóa
                $existingWishlistItem->delete();
                return response()->json([
                    'message' => 'Product removed from wishlist',
                    'added' => false
                ]);
            } else {
                // Nếu chưa có thì thêm mới
                Wishlist::create([
                    'user_id' => $userId,
                    'product_id' => $productId
                ]);
                return response()->json([
                    'message' => 'Product added to wishlist',
                    'added' => true
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function remove(int $productId)
    {
        try {
            $deleted = Wishlist::where('user_id', Auth::id())
                ->where('product_id', $productId)
                ->delete();

            if ($deleted) {
                return response()->json([
                    'message' => 'Product removed from wishlist'
                ]);
            }

            return response()->json([
                'message' => 'Product not found in wishlist'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error removing product from wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function clear()
    {
        try {
            Wishlist::where('user_id', Auth::id())->delete();

            return response()->json([
                'message' => 'Wishlist cleared successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error clearing wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function check(int $productId)
    {
        try {
            $exists = Wishlist::where('user_id', Auth::id())
                ->where('product_id', $productId)
                ->exists();

            return response()->json([
                'exists' => $exists
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error checking wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
