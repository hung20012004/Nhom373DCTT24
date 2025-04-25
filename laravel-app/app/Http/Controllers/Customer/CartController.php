<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    protected function getUserId(Request $request = null): int
    {
        if (Auth::check()) {
            return Auth::id();
        }

        return $request->attributes->get('user')->id;
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $this->getUserId($request);

        $cart = Cart::with(['items.variant.product'])
            ->where('user_id', $userId)
            ->first();

        if (!$cart) {
            $cart = Cart::create(['user_id' => $userId]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Cart retrieved successfully',
            'data' => $cart
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $userId = $this->getUserId($request);
        $request->validate([
            'variant_id' => 'required|exists:product_variants,variant_id',
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            DB::beginTransaction();

            $variant = ProductVariant::findOrFail($request->variant_id);

            if ($variant->stock_quantity < $request->quantity) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Not enough stock available'
                ], 400);
            }

            $cart = Cart::firstOrCreate([
                'user_id' => $userId
            ]);

            $existingItem = CartItem::where([
                'cart_id' => $cart->cart_id,
                'variant_id' => $request->variant_id,
            ])->first();

            $totalQuantity = $request->quantity;
            $additionalQuantity = $request->quantity;

            if ($existingItem) {
                $totalQuantity += $existingItem->quantity;
                $additionalQuantity = $totalQuantity - $existingItem->quantity;
            }

            if ($variant->stock_quantity < $totalQuantity) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot add more items than available in stock'
                ], 400);
            }

            // Cập nhật số lượng trong kho
            $variant->stock_quantity -= $additionalQuantity;
            $variant->save();

            CartItem::updateOrCreate(
                [
                    'cart_id' => $cart->cart_id,
                    'variant_id' => $request->variant_id,
                ],
                [
                    'quantity' => $totalQuantity
                ]
            );

            DB::commit();

            // Trả về cart đã cập nhật
            $updatedCart = Cart::with(['items.variant.product'])
                ->where('user_id', $userId)
                ->first();

            return response()->json([
                'status' => 'success',
                'message' => 'Item added to cart successfully',
                'data' => $updatedCart
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to add item to cart: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        $userId = $this->getUserId($request);
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            DB::beginTransaction();

            if ($cartItem->cart->user_id !== $userId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            $variant = $cartItem->variant;
            $oldQuantity = $cartItem->quantity;
            $newQuantity = $request->quantity;
            $quantityDifference = $newQuantity - $oldQuantity;

            // Nếu tăng số lượng, kiểm tra xem có đủ hàng không
            if ($quantityDifference > 0 && $variant->stock_quantity < $quantityDifference) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Not enough stock available'
                ], 400);
            }

            // Cập nhật số lượng trong kho
            $variant->stock_quantity -= $quantityDifference;
            $variant->save();

            $cartItem->update([
                'quantity' => $newQuantity
            ]);

            DB::commit();

            // Trả về cart đã cập nhật
            $updatedCart = Cart::with(['items.variant.product'])
                ->where('user_id', $userId)
                ->first();

            return response()->json([
                'status' => 'success',
                'message' => 'Cart item updated',
                'data' => $updatedCart
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update cart item: ' . $e->getMessage()
            ], 500);
        }
    }

    public function remove(Request $request, CartItem $cartItem): JsonResponse
    {
        $userId = $this->getUserId($request);

        try {
            DB::beginTransaction();

            if ($cartItem->cart->user_id !== $userId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Khôi phục số lượng sản phẩm vào kho
            $variant = $cartItem->variant;
            $variant->stock_quantity += $cartItem->quantity;
            $variant->save();

            $cartItem->delete();

            DB::commit();

            // Trả về cart đã cập nhật
            $updatedCart = Cart::with(['items.variant.product'])
                ->where('user_id', $userId)
                ->first();

            return response()->json([
                'status' => 'success',
                'message' => 'Item removed from cart',
                'data' => $updatedCart
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove item from cart: ' . $e->getMessage()
            ], 500);
        }
    }

    public function clear(Request $request): JsonResponse
    {
        $userId = $this->getUserId($request);

        try {
            DB::beginTransaction();

            $cart = Cart::where('user_id', $userId)->first();

            if ($cart) {
                // Khôi phục số lượng sản phẩm vào kho cho tất cả sản phẩm trong giỏ hàng
                foreach ($cart->items as $cartItem) {
                    $variant = $cartItem->variant;
                    $variant->stock_quantity += $cartItem->quantity;
                    $variant->save();
                }

                $cart->items()->delete();
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Cart cleared',
                'data' => $cart
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to clear cart: ' . $e->getMessage()
            ], 500);
        }
    }
}
