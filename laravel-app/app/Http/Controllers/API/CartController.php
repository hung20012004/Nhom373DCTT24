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

    public function add(Request $request)
    {
        $request->validate([
            'variant_id' => 'required|exists:product_variants,variant_id',
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            DB::transaction(function () use ($request) {
                $variant = ProductVariant::findOrFail($request->variant_id);

                if ($variant->stock_quantity < $request->quantity) {
                    return to_route('products')->withErrors([
                        'quantity' => 'Not enough stock available'
                    ]);
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
                    return to_route('products')->withErrors([
                        'quantity' => 'Cannot add more items than available in stock'
                    ]);
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
            });

            return redirect()->back()->with('success', 'Item added to cart successfully');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to add item to cart'
            ]);
        }
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
