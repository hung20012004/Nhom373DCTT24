<?php

namespace App\Http\Controllers\Customer;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\OrderHistory;
use App\Models\CartItem;
use App\Models\ShippingAddress;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Payment;
use Inertia\Inertia;

class OrderController extends Controller
{
    protected function getUserId(Request $request = null)
    {
        if (Auth::check()) {
            return Auth::id();
        }
        return $request->attributes->get('user')->id;
    }

    public function index(Request $request)
    {
        $userId = $this->getUserId($request);

        $orders = Order::with([
            'details' => function ($query) {
                $query->with('variant.product', 'variant.color', 'variant.size');
            },
            'shippingAddress',
            'history' => function ($query) {
                $query->with('processedBy')->orderBy('created_at', 'desc');
            }
        ])
            ->where('user_id', $userId)
            ->orderBy('order_date', 'desc')
            ->get();

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'data' => $orders
            ]);
        }

        return Inertia::render('Order/Index', [
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, $orderId)
    {
        $userId = $this->getUserId($request);

        $order = Order::with([
            'details' => function ($query) {
                $query->with('variant.product', 'variant.color', 'variant.size');
            },
            'shippingAddress',
            'history' => function ($query) {
                $query->with('processedBy')->orderBy('created_at', 'desc');
            }
        ])
            ->where('order_id', $orderId)
            ->where('user_id', $userId)
            ->firstOrFail();

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'data' => $order
            ]);
        }

        return Inertia::render('Order/Show', [
            'order' => $order,
        ]);
    }

    public function checkout(Request $request)
    {
        try {
            $userId = $this->getUserId($request);

            $validated = $request->validate([
                'shipping_address_id' => 'required|exists:shipping_addresses,address_id',
                'payment_method' => 'required|in:cod,vnpay',
                'items' => 'required|array',
                'items.*' => 'exists:cart_items,cart_item_id',
                'shipping_fee' => 'required|numeric|min:0',
                'note' => 'nullable|string|max:500',
            ]);

            $user = Auth::user() ?? $request->attributes->get('user');
            $cartItems = CartItem::whereIn('cart_item_id', $validated['items'])
                ->whereHas('cart', function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })
                ->with('variant')
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'errors' => ['items' => 'Không tìm thấy sản phẩm trong giỏ hàng.'],
                ], 422);
            }

            DB::beginTransaction();

            $subtotal = 0;
            foreach ($cartItems as $item) {
                $subtotal += $item->variant->price * $item->quantity;
            }

            $total = $subtotal + $validated['shipping_fee'];

            $order = Order::create([
                'user_id' => $userId,
                'shipping_address_id' => $validated['shipping_address_id'],
                'order_date' => now(),
                'subtotal' => $subtotal,
                'shipping_fee' => $validated['shipping_fee'],
                'discount_amount' => 0,
                'total_amount' => $total,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_method'] === 'cod' ? 'pending' : 'awaiting_payment',
                'order_status' => 'new',
                'note' => $validated['note'],
            ]);

            Payment::create([
                'order_id' => $order->order_id,
                'amount' => $total,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_method'] === 'cod' ? 'pending' : 'awaiting_payment',
                'transaction_id' => null,
                'note' => 'Thanh toán được tạo cùng đơn hàng mới'
            ]);

            OrderHistory::create([
                'order_id' => $order->order_id,
                'status' => 'new',
                'note' => 'Đơn hàng mới được tạo',
                'processed_by_user_id' => null,
            ]);

            foreach ($cartItems as $item) {
                OrderDetail::create([
                    'order_id' => $order->order_id,
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->variant->price,
                    'subtotal' => $item->variant->price * $item->quantity,
                ]);
            }

            CartItem::whereIn('cart_item_id', $validated['items'])->delete();

            DB::commit();

            if ($validated['payment_method'] === 'cod') {
                return redirect()->route('order.confirmation', ['order' => $order->order_id]);
            } else {
                // return redirect()->away($this->processVnpayPayment($order, $total));
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'errors' => $e->validator->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Đã có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function cancel(Request $request, $orderId)
    {
        try {
            $userId = $this->getUserId($request);

            $order = Order::with('details.variant')
                ->where('order_id', $orderId)
                ->where('user_id', $userId)
                ->firstOrFail();

            if (!in_array($order->order_status, ['new', 'processing'])) {
                return back()->with('error', 'Đơn hàng không thể hủy ở trạng thái hiện tại.');
            }

            DB::beginTransaction();

            foreach ($order->details as $detail) {
                $variant = $detail->variant;
                $variant->stock_quantity += $detail->quantity;
                $variant->save();
            }

            $order->update([
                'order_status' => 'cancelled',
            ]);

            OrderHistory::create([
                'order_id' => $order->order_id,
                'status' => 'cancelled',
                'note' => 'Đơn hàng đã bị hủy bởi khách hàng: ' . ($request->reason ?? 'Không có lý do'),
                'processed_by_user_id' => $userId,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Đơn hàng đã được hủy thành công.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Đã có lỗi xảy ra: ' . $e->getMessage());
        }
    }

    public function confirmReceived(Request $request, $orderId)
    {
        try {
            $userId = $this->getUserId($request);

            $order = Order::where('order_id', $orderId)
                ->where('user_id', $userId)
                ->firstOrFail();

            if ($order->order_status !== 'delivered') {
                return response()->json([
                    'error' => 'Đơn hàng chưa được giao hoặc đã được xác nhận trước đó.',
                ], 400);
            }

            DB::beginTransaction();

            $order->update([
                'order_status' => 'completed',
            ]);

            OrderHistory::create([
                'order_id' => $order->order_id,
                'status' => 'completed',
                'comment' => 'Khách hàng đã xác nhận nhận được hàng',
                'processed_by_user_id' => $userId,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Đã xác nhận nhận hàng thành công.');

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Đã xảy ra lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function history($orderId)
    {
        $order = Order::with([
            'history' => function ($query) {
                $query->with('processedBy')->orderBy('created_at', 'desc');
            }
        ])
            ->where('order_id', $orderId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return Inertia::render('Order/History', [
            'order' => $order,
            'orderHistory' => $order->history,
        ]);
    }
}
