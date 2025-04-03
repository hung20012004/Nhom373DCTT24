<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        $user = $request->attributes->get('user');

        $cart = Cart::with(['items.variant.product'])
            ->where('user_id', $user->id)
            ->first();

        if (!$cart) {
            $cart = Cart::create(['user_id' => $user->id]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Cart retrieved successfully',
            'data' => $cart
        ]);
    }

    public function add(Request $request): JsonResponse
{
    $user = $request->attributes->get('user');
    $request->validate([
        'variant_id' => 'required|exists:product_variants,variant_id',
        'quantity' => 'required|integer|min:1'
    ]);

    try {
        DB::beginTransaction();
        $variant = ProductVariant::findOrFail($request->variant_id);

        if ($variant->stock_quantity < $request->quantity) {
            return response()->json(['status' => 'error', 'message' => 'Not enough stock available'], 400);
        }

        $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        $existingItem = CartItem::where(['cart_id' => $cart->cart_id, 'variant_id' => $request->variant_id])->first();

        $totalQuantity = $request->quantity;
        $additionalQuantity = $request->quantity;

        if ($existingItem) {
            $totalQuantity += $existingItem->quantity;
            $additionalQuantity = $totalQuantity - $existingItem->quantity;
        }

        if ($variant->stock_quantity < $totalQuantity) {
            return response()->json(['status' => 'error', 'message' => 'Cannot add more items than available in stock'], 400);
        }

        $variant->stock_quantity -= $additionalQuantity;
        $variant->save();

        CartItem::updateOrCreate(
            ['cart_id' => $cart->cart_id, 'variant_id' => $request->variant_id],
            ['quantity' => $totalQuantity]
        );

        DB::commit();

        $updatedCart = Cart::with(['items.variant.product'])->where('user_id', $user->id)->first();

        return response()->json([
            'status' => 'success',
            'message' => 'Item added to cart successfully (Test API)',
            'data' => $updatedCart
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['status' => 'error', 'message' => 'Failed to add item to cart: ' . $e->getMessage()], 500);
    }
}

    public function update(Request $request, $cartItem): JsonResponse
    {
        $user = $request->attributes->get('user');

        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            DB::beginTransaction();

            $cartItem = CartItem::findOrFail($cartItem);

            if ($cartItem->cart->user_id !== $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            $variant = $cartItem->variant;
            $oldQuantity = $cartItem->quantity;
            $newQuantity = $request->quantity;
            $quantityDifference = $newQuantity - $oldQuantity;

            if ($quantityDifference > 0 && $variant->stock_quantity < $quantityDifference) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Not enough stock available'
                ], 400);
            }

            $variant->stock_quantity -= $quantityDifference;
            $variant->save();

            $cartItem->update([
                'quantity' => $newQuantity
            ]);

            DB::commit();

            $updatedCart = Cart::with(['items.variant.product'])
                ->where('user_id', $user->id)
                ->first();

            return response()->json([
                'status' => 'success',
                'message' => 'Cart item updated (Test API)',
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

    public function remove($cartItem): JsonResponse
    {
        $user = request()->attributes->get('user');

        try {
            DB::beginTransaction();

            $cartItem = CartItem::findOrFail($cartItem);

            if ($cartItem->cart->user_id !== $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            $variant = $cartItem->variant;
            $variant->stock_quantity += $cartItem->quantity;
            $variant->save();

            $cartItem->delete();

            DB::commit();

            $updatedCart = Cart::with(['items.variant.product'])
                ->where('user_id', $user->id)
                ->first();

            return response()->json([
                'status' => 'success',
                'message' => 'Item removed from cart (Test API)',
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
        $user = $request->attributes->get('user');

        try {
            DB::beginTransaction();

            $cart = Cart::where('user_id', $user->id)->first();

            if ($cart) {
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
                'message' => 'Cart cleared (Test API)',
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
