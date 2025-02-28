<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Process VNPAY payment creation
     */
    public function createVnpayPayment(Request $request)
    {
        // Validate the request
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000',
            'shipping_address_id' => 'required|exists:shipping_addresses,id',
            'items' => 'required|array',
            'shipping_fee' => 'required|numeric|min:0',
            'note' => 'nullable|string',
        ]);

        // Store cart data in session to use after redirect back from VNPAY
        session(['checkout_data' => $request->all()]);

        // VNPAY configuration (should be moved to config file in production)
        $vnp_TmnCode = env('VNPAY_TMN_CODE', 'your_tmn_code');
        $vnp_HashSecret = env('VNPAY_HASH_SECRET', 'your_hash_secret');
        $vnp_Url = env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
        $vnp_Returnurl = route('payment.vnpay.return');

        // Payment parameters
        $vnp_TxnRef = Str::random(10); // Order ID in your system
        $vnp_OrderInfo = 'Thanh toán đơn hàng #' . $vnp_TxnRef;
        $vnp_OrderType = 'billpayment';
        $vnp_Amount = $validated['amount'] * 100; // Convert to smallest currency unit (e.g., from VND to cents)
        $vnp_Locale = 'vn';
        $vnp_IpAddr = request()->ip();
        $vnp_CreateDate = date('YmdHis');

        // Build query parameters
        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => $vnp_CreateDate,
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $vnp_TxnRef,
        ];

        // Sort alphabetically before signing
        ksort($inputData);
        $query = "";
        $i = 0;
        $hashdata = "";

        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        // Remove last '&' character
        $query = substr($query, 0, -1);

        // Create signature
        $vnp_SecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
        $query .= '&vnp_SecureHash=' . $vnp_SecureHash;

        // Redirect to VNPAY
        $paymentUrl = $vnp_Url . "?" . $query;

        // Store the reference for validation later
        session(['vnpay_txn_ref' => $vnp_TxnRef]);

        return redirect($paymentUrl);
    }

    /**
     * Handle VNPAY return
     */
    public function handleVnpayReturn(Request $request)
    {
        // VNPAY configuration
        $vnp_HashSecret = env('VNPAY_HASH_SECRET', 'your_hash_secret');

        // Get and validate the input data from VNPAY
        $inputData = $request->all();
        $vnp_SecureHash = $inputData['vnp_SecureHash'] ?? '';

        // Remove the secure hash from the data to verify
        unset($inputData['vnp_SecureHash']);

        // Sort the data alphabetically
        ksort($inputData);

        // Build the hash data
        $hashData = '';
        $i = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        // Create the secure hash for verification
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        // Verify the secure hash
        if ($secureHash != $vnp_SecureHash) {
            return redirect()->route('checkout')->with('error', 'Chữ ký không hợp lệ!');
        }

        // Check transaction status
        $vnp_ResponseCode = $inputData['vnp_ResponseCode'] ?? '';
        $vnp_TransactionStatus = $inputData['vnp_TransactionStatus'] ?? '';
        $vnp_TxnRef = $inputData['vnp_TxnRef'] ?? '';

        // Verify transaction reference
        if ($vnp_TxnRef != session('vnpay_txn_ref')) {
            return redirect()->route('checkout')->with('error', 'Mã giao dịch không hợp lệ!');
        }

        // Process based on transaction status
        if ($vnp_ResponseCode == '00' && $vnp_TransactionStatus == '00') {
            // Payment successful
            // Retrieve checkout data from session
            $checkoutData = session('checkout_data');

            if (!$checkoutData) {
                return redirect()->route('checkout')->with('error', 'Không tìm thấy dữ liệu thanh toán!');
            }

            // Call checkout method to create order
            $orderController = app(OrderController::class);
            return $orderController->checkout(new Request($checkoutData));
        } else {
            // Payment failed or cancelled
            return redirect()->route('checkout')->with('error', 'Thanh toán không thành công hoặc đã bị hủy!');
        }
    }

    /**
     * Process VNPAY payment for an existing order
     */
    public function processVnpayForOrder($orderId)
    {
        $order = Order::where('order_id', $orderId)
            ->where('user_id', Auth::id())
            ->where('payment_status', 'awaiting_payment')
            ->firstOrFail();

        // VNPAY configuration
        $vnp_TmnCode = env('VNPAY_TMN_CODE', 'your_tmn_code');
        $vnp_HashSecret = env('VNPAY_HASH_SECRET', 'your_hash_secret');
        $vnp_Url = env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
        $vnp_Returnurl = route('payment.vnpay.order.return', ['order' => $order->order_id]);

        // Payment parameters
        $vnp_TxnRef = $order->order_id . '_' . time(); // Unique reference
        $vnp_OrderInfo = 'Thanh toán đơn hàng #' . $order->order_id;
        $vnp_OrderType = 'billpayment';
        $vnp_Amount = $order->total_amount * 100; // Convert to smallest currency unit
        $vnp_Locale = 'vn';
        $vnp_IpAddr = request()->ip();
        $vnp_CreateDate = date('YmdHis');

        // Build query parameters
        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => $vnp_CreateDate,
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $vnp_TxnRef,
        ];

        // Sort alphabetically before signing
        ksort($inputData);
        $query = "";
        $i = 0;
        $hashdata = "";

        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        // Remove last '&' character
        $query = substr($query, 0, -1);

        // Create signature
        $vnp_SecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
        $query .= '&vnp_SecureHash=' . $vnp_SecureHash;

        // Store the order ID and txn ref in session for validation
        session(['vnpay_order_id' => $order->order_id]);
        session(['vnpay_txn_ref' => $vnp_TxnRef]);

        // Redirect to VNPAY
        $paymentUrl = $vnp_Url . "?" . $query;
        return redirect($paymentUrl);
    }

    /**
     * Handle VNPAY return for existing order
     */
    public function handleVnpayOrderReturn(Request $request, $orderId)
    {
        // VNPAY configuration
        $vnp_HashSecret = env('VNPAY_HASH_SECRET', 'your_hash_secret');

        // Get and validate the input data
        $inputData = $request->all();
        $vnp_SecureHash = $inputData['vnp_SecureHash'] ?? '';

        // Remove secure hash from data to verify
        unset($inputData['vnp_SecureHash']);

        // Sort the data
        ksort($inputData);

        // Build hash data
        $hashData = '';
        $i = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        // Create secure hash
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        // Verify secure hash
        if ($secureHash != $vnp_SecureHash) {
            return redirect()->route('orders.show', $orderId)->with('error', 'Chữ ký không hợp lệ!');
        }

        // Check transaction status
        $vnp_ResponseCode = $inputData['vnp_ResponseCode'] ?? '';
        $vnp_TransactionStatus = $inputData['vnp_TransactionStatus'] ?? '';

        // Verify order ID from session
        if ($orderId != session('vnpay_order_id')) {
            return redirect()->route('orders.show', $orderId)->with('error', 'Mã đơn hàng không hợp lệ!');
        }

        // Get the order
        $order = Order::where('order_id', $orderId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Process based on transaction status
        if ($vnp_ResponseCode == '00' && $vnp_TransactionStatus == '00') {
            // Payment successful
            $order->payment_status = 'paid';
            $order->save();

            // Add to order history
            $order->history()->create([
                'status' => 'payment_completed',
                'comment' => 'Thanh toán thành công qua VNPAY',
                'updated_by' => Auth::id()
            ]);

            return redirect()->route('orders.show', $orderId)->with('success', 'Thanh toán thành công!');
        } else {
            // Payment failed
            return redirect()->route('orders.show', $orderId)->with('error', 'Thanh toán không thành công!');
        }
    }
}
