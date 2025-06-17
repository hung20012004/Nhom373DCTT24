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
    public function index()
    {
        $orders = Order::with([
            'details' => function ($query) {
                $query->with('variant.product', 'variant.color', 'variant.size');
            },
            'shippingAddress',
            'history' => function ($query) {
                $query->with('processedBy')->orderBy('created_at', 'desc');
            }
        ])
            ->where('user_id', Auth::id())
            ->orderBy('order_date', 'desc')
            ->get();

        return Inertia::render('Order/Index', [
            'orders' => $orders,
        ]);
    }

    public function show($orderId)
    {
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
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return Inertia::render('Order/Show', [
            'order' => $order,
        ]);
    }

    public function checkout(Request $request)
    {
        try {
            $validated = $request->validate([
                'shipping_address_id' => 'required|exists:shipping_addresses,address_id',
                'payment_method' => 'required|in:cod,vnpay',
                'items' => 'required|array',
                'items.*' => 'exists:cart_items,cart_item_id',
                'shipping_fee' => 'required|numeric|min:0',
                'note' => 'nullable|string|max:500',
            ]);

            $user = Auth::user();
            $cartItems = CartItem::whereIn('cart_item_id', $validated['items'])
                ->whereHas('cart', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
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
                'user_id' => $user->id,
                'shipping_address_id' => $validated['shipping_address_id'],
                'order_date' => now(),
                'subtotal' => $subtotal,
                'shipping_fee' => $validated['shipping_fee'],
                'discount_amount' => 0, // Có thể mở rộng để thêm mã giảm giá
                'total_amount' => $total,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_method'] === 'cod' ? 'pending' : 'awaiting_payment',
                'order_status' => 'new',
                'note' => $validated['note'],
            ]);

            // Create payment record for the order
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
                return redirect()->away($this->processVnpayPayment($order, $total));
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
    /**
     * Xử lý thanh toán qua VNPAY
     */
    private function processVnpayPayment(Order $order, $amount)
    {
        $vnpayConfig = [
            'vnp_TmnCode' => env('VNPAY_TMN_CODE'), // Mã terminal từ VNPAY
            'vnp_HashSecret' => env('VNPAY_HASH_SECRET'), // Key bí mật từ VNPAY
            'vnp_Url' => env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'), // URL thanh toán (sandbox hoặc production)
            'vnp_ReturnUrl' => route('payment.vnpay.callback'), // URL trả về sau thanh toán
        ];

        $vnp_Url = $vnpayConfig['vnp_Url'];
        $vnp_ReturnUrl = $vnpayConfig['vnp_ReturnUrl'];
        $vnp_TmnCode = $vnpayConfig['vnp_TmnCode'];
        $vnp_HashSecret = $vnpayConfig['vnp_HashSecret'];

        // Tạo dữ liệu thanh toán
        $vnp_TxnRef = $order->order_id; // Sử dụng order_id làm mã giao dịch
        $vnp_OrderInfo = "Thanh toan don hang #{$order->order_id}";
        $vnp_OrderType = 'billpayment';
        $vnp_Amount = $amount * 100; // VNPAY yêu cầu đơn vị là VNĐ, nhân 100 vì tính bằng xu
        $vnp_Locale = 'vn';
        $vnp_IpAddr = request()->ip();

        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_ReturnUrl,
            "vnp_TxnRef" => $vnp_TxnRef,
        ];

        ksort($inputData);
        $query = http_build_query($inputData);
        $hash = hash_hmac('sha512', $query, $vnp_HashSecret);
        $vnp_Url .= '?' . $query . '&vnp_SecureHash=' . $hash;

        return $vnp_Url;
    }

    public function vnpayCallback(Request $request)
    {
        $vnp_HashSecret = env('VNPAY_HASH_SECRET');
        $inputData = $request->all();
        $vnp_SecureHash = $inputData['vnp_SecureHash'];
        unset($inputData['vnp_SecureHash']);

        // Sắp xếp dữ liệu theo thứ tự bảng chữ cái
        ksort($inputData);
        $hashData = http_build_query($inputData);
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        if ($secureHash === $vnp_SecureHash) {
            $orderId = $inputData['vnp_TxnRef'];
            $status = $inputData['vnp_ResponseCode'];

            $order = Order::find($orderId);

            if ($order && $status === '00') { // Thanh toán thành công
                DB::beginTransaction();

                try {
                    $order->update([
                        'payment_status' => 'paid',
                    ]);

                    // Tạo lịch sử thanh toán
                    OrderHistory::create([
                        'order_id' => $orderId,
                        'status' => 'paid',
                        'note' => 'Thanh toán thành công qua VNPAY, Mã giao dịch: ' . $inputData['vnp_TransactionNo'],
                        'processed_by_user_id' => null, // Tự động xử lý
                    ]);

                    DB::commit();

                    return response()->json([
                        'message' => 'Thanh toán thành công!',
                        'redirect' => route('order.confirmation', ['order' => $orderId]),
                    ], 200);
                } catch (\Exception $e) {
                    DB::rollBack();

                    return response()->json([
                        'error' => 'Lỗi khi cập nhật trạng thái thanh toán: ' . $e->getMessage(),
                    ], 500);
                }
            }

            return response()->json([
                'error' => 'Thanh toán thất bại hoặc đơn hàng không hợp lệ.',
            ], 400);
        }

        return response()->json([
            'error' => 'Chữ ký không hợp lệ, thanh toán thất bại.',
        ], 400);
    }

    public function confirmation($orderId)
    {
        $order = Order::with([
            'details' => function ($query) {
                $query->with('variant.product');
            },
            'shippingAddress',
            'history' => function ($query) {
                $query->with('processedBy')->orderBy('created_at', 'desc');
            }
        ])
            ->where('order_id', $orderId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        if (!$order->shippingAddress && $order->shipping_address_id) {
            $shippingAddress = ShippingAddress::find($order->shipping_address_id);
            $order->setRelation('shippingAddress', $shippingAddress);
        }

        if ($order->details->isEmpty()) {
            $details = OrderDetail::with('variant')
                ->where('order_id', $order->order_id)
                ->get();
            $order->setRelation('details', $details);
        }

        return Inertia::render('Order/Confirmation', [
            'order' => $order,
        ]);
    }

    public function cancel(Request $request, $orderId)
    {
        try {
            $order = Order::with('details.variant')
                ->where('order_id', $orderId)
                ->where('user_id', Auth::id())
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
                'processed_by_user_id' => Auth::id(),
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Đơn hàng đã được hủy thành công.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Đã có lỗi xảy ra: ' . $e->getMessage());
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
    public function confirmReceived($orderId)
{
    try {
        $order = Order::where('order_id', $orderId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        if ($order->order_status !== 'delivered') {
            return response()->json([
                'error' => 'Đơn hàng chưa được giao hoặc đã được xác nhận trước đó.',
            ], 400);
        }

        DB::beginTransaction();

        // Update order status to completed or any other final status you prefer
        $order->update([
            'order_status' => 'completed',
        ]);

        // Create order history entry
        OrderHistory::create([
            'order_id' => $order->order_id,
            'status' => 'completed',
            'comment' => 'Khách hàng đã xác nhận nhận được hàng',
            'processed_by_user_id' => Auth::id(),
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
}
