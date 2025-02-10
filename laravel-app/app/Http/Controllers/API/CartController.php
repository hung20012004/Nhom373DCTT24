<?php
namespace App\Http\Controllers\API;

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
    public function index(): JsonResponse
    {
        $cart = Cart::with(['items.variant.product'])
            ->where('user_id', Auth::id())
            ->first();

        if (!$cart) {
            $cart = Cart::create(['user_id' => Auth::id()]);
        }

        return response()->json([
            'status' => 'success',
            'data' => $cart
        ]);
    }

    public function add(Request $request): JsonResponse // Thay đổi kiểu trả về
    {
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
                'user_id' => Auth::id()
            ]);

            $existingItem = CartItem::where([
                'cart_id' => $cart->cart_id,
                'variant_id' => $request->variant_id,
            ])->first();

            $totalQuantity = $request->quantity;
            if ($existingItem) {
                $totalQuantity += $existingItem->quantity;
            }

            if ($variant->stock_quantity < $totalQuantity) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot add more items than available in stock'
                ], 400);
            }

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
                ->where('user_id', Auth::id())
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
                'message' => 'Failed to add item to cart'
            ], 500);
        }
    }

    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            if ($cartItem->cart->user_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Kiểm tra số lượng tồn kho
            if ($cartItem->variant->stock_quantity < $request->quantity) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Not enough stock available'
                ], 400);
            }

            $cartItem->update([
                'quantity' => $request->quantity
            ]);

            // Trả về cart đã cập nhật
            $updatedCart = Cart::with(['items.variant.product'])
                ->where('user_id', Auth::id())
                ->first();

            return response()->json([
                'status' => 'success',
                'message' => 'Cart item updated',
                'data' => $updatedCart
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update cart item'
            ], 500);
        }
    }

    public function remove(CartItem $cartItem): JsonResponse
    {
        try {
            if ($cartItem->cart->user_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            $cartItem->delete();

            // Trả về cart đã cập nhật
            $updatedCart = Cart::with(['items.variant.product'])
                ->where('user_id', Auth::id())
                ->first();

            return response()->json([
                'status' => 'success',
                'message' => 'Item removed from cart',
                'data' => $updatedCart
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove item from cart'
            ], 500);
        }
    }

    public function clear(): JsonResponse
    {
        try {
            $cart = Cart::where('user_id', Auth::id())->first();

            if ($cart) {
                $cart->items()->delete();
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Cart cleared',
                'data' => $cart
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to clear cart'
            ], 500);
        }
    }
}
