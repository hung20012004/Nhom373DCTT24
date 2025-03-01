<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\CartItem;
use App\Models\ShippingAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Xử lý trang thanh toán và tạo đơn hàng
     */
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

            // Lấy các mục trong giỏ hàng của người dùng
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

            // Tính tổng tiền tạm tính
            $subtotal = 0;
            foreach ($cartItems as $item) {
                $subtotal += $item->variant->price * $item->quantity;
            }

            $total = $subtotal + $validated['shipping_fee'];

            // Tạo đơn hàng
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

            // Tạo chi tiết đơn hàng
            foreach ($cartItems as $item) {
                OrderDetail::create([
                    'order_id' => $order->order_id,
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->variant->price,
                    'subtotal' => $item->variant->price * $item->quantity,
                ]);
            }

            // Xóa các mục trong giỏ hàng
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
        // Giả sử bạn đã cài đặt package VNPAY (ví dụ: laravel-vnpay)
        // Cấu hình thông tin VNPAY (cần thay đổi theo môi trường thực tế)
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

        // Sắp xếp dữ liệu theo thứ tự bảng chữ cái
        ksort($inputData);
        $query = http_build_query($inputData);
        $hash = hash_hmac('sha512', $query, $vnp_HashSecret);
        $vnp_Url .= '?' . $query . '&vnp_SecureHash=' . $hash;

        return $vnp_Url;
    }

    /**
     * Xử lý callback từ VNPAY sau khi thanh toán
     */
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
                $order->update([
                    'payment_status' => 'paid',
                ]);

                $order->history()->create([
                    'status' => 'paid',
                    'comment' => 'Thanh toán thành công qua VNPAY, Mã giao dịch: ' . $inputData['vnp_TransactionNo'],
                    'updated_by' => Auth::id() ?? $order->user_id,
                ]);

                return response()->json([
                    'message' => 'Thanh toán thành công!',
                    'redirect' => route('orders.confirmation', ['order' => $orderId]),
                ], 200);
            }

            return response()->json([
                'error' => 'Thanh toán thất bại hoặc đơn hàng không hợp lệ.',
            ], 400);
        }

        return response()->json([
            'error' => 'Chữ ký không hợp lệ, thanh toán thất bại.',
        ], 400);
    }

    /**
     * Hiển thị trang xác nhận đơn hàng
     */
    public function confirmation($orderId)
    {
        // Lấy đơn hàng nhưng tải thêm dữ liệu từ ShippingAddress
        $order = Order::with([
            'details.variant',  // Eager load chi tiết đơn hàng và variant
            'shippingAddress',  // Eager load địa chỉ giao hàng
        ])
        ->where('order_id', $orderId)
        ->where('user_id', Auth::id())
        ->firstOrFail();

        // Lấy địa chỉ giao hàng nếu không có trong eager load
        if (!$order->shippingAddress && $order->shipping_address_id) {
            $shippingAddress = ShippingAddress::find($order->shipping_address_id);
            $order->setRelation('shippingAddress', $shippingAddress);
        }

        // Lấy chi tiết đơn hàng nếu details là rỗng
        if ($order->details->isEmpty()) {
            $details = OrderDetail::with('variant')
                ->where('order_id', $order->order_id)
                ->get();
            $order->setRelation('details', $details);
        }

        // dd($order->toArray()); // Uncomment để debug

        return Inertia::render('Order/Confirmation', [
            'order' => $order,
        ]);
    }
}
