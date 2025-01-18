<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

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

    public function add(Request $request): JsonResponse
    {
        $request->validate([
            'variant_id' => 'required|exists:products_variants,variant_id',
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = Cart::firstOrCreate(['user_id' => Auth::id()]);

        $cartItem = CartItem::updateOrCreate(
            [
                'cart_id' => $cart->cart_id,
                'variant_id' => $request->variant_id,
            ],
            [
                'quantity' => $request->quantity
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Item added to cart',
            'data' => $cartItem
        ]);
    }

    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        if ($cartItem->cart->user_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $cartItem->update([
            'quantity' => $request->quantity
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Cart item updated',
            'data' => $cartItem
        ]);
    }

    public function remove(CartItem $cartItem): JsonResponse
    {
        if ($cartItem->cart->user_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $cartItem->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Item removed from cart'
        ]);
    }

    public function clear(): JsonResponse
    {
        $cart = Cart::where('user_id', Auth::id())->first();

        if ($cart) {
            $cart->items()->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Cart cleared'
        ]);
    }
}
