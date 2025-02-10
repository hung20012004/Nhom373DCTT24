<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    /**
     * Lấy danh sách wishlist của user hiện tại
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $wishlistItems = Wishlist::where('user_id', Auth::id())
                ->with(['product' => function ($query) {
                    $query->select('product_id', 'name', 'slug', 'price', 'sale_price', 'stock_quantity')
                        ->with(['images' => function ($query) {
                            $query->select('product_id', 'image_url')->first();
                        }]);
                }])
                ->get();

            // Chỉ trả về product IDs nếu frontend chỉ cần IDs
            $productIds = $wishlistItems->pluck('product_id')->toArray();

            return response()->json($productIds);

            // Hoặc trả về full data nếu frontend cần
            // return response()->json($wishlistItems);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle sản phẩm trong wishlist (thêm nếu chưa có, xóa nếu đã có)
     *
     * @param Request $request
     * @param int $productId
     * @return JsonResponse
     */
    public function toggle(Request $request, int $productId): JsonResponse
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

    /**
     * Xóa sản phẩm khỏi wishlist
     *
     * @param int $productId
     * @return JsonResponse
     */
    public function remove(int $productId): JsonResponse
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

    /**
     * Xóa toàn bộ wishlist của user
     *
     * @return JsonResponse
     */
    public function clear(): JsonResponse
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

    /**
     * Kiểm tra sản phẩm có trong wishlist không
     *
     * @param int $productId
     * @return JsonResponse
     */
    public function check(int $productId): JsonResponse
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
