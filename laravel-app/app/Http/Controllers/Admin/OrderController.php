<?php

namespace App\Http\Controllers\Admin;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\OrderHistory;
use App\Models\CartItem;
use App\Models\ShippingAddress;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function updateStatus(Request $request, $id)
{
    $order = Order::with('details.variant')->findOrFail($id);

    $request->validate([
        'status' => ['required', Rule::in(['new', 'processing','confirmed', 'preparing', 'packed', 'shipping', 'delivered', 'cancelled'])],
        'note' => 'nullable|string|max:500'
    ]);

    $currentStatus = $order->order_status;
    $newStatus = $request->status;

    $allowedTransitions = [
        'new' => ['processing', 'cancelled'],
        'processing' => ['confirmed', 'cancelled'],
        'confirmed' => ['preparing', 'cancelled'],
        'preparing' => ['packed', 'cancelled'],
        'packed' => ['shipping', 'cancelled'],
        'shipping' => ['delivered', 'cancelled'],
        'delivered' => [],
        'cancelled' => []
    ];

    if (!in_array($newStatus, $allowedTransitions[$currentStatus] ?? [])) {
        return response()->json([
            'status' => 'error',
            'message' => "Cannot change status from '$currentStatus' to '$newStatus'"
        ], 400);
    }

    try {
        DB::beginTransaction();

        if ($newStatus === 'cancelled' && $currentStatus !== 'cancelled') {
            foreach ($order->details as $detail) {
                $variant = $detail->variant;
                if ($variant) {
                    $variant->stock_quantity += $detail->quantity;
                    $variant->save();
                }
            }
        }

        $order->update([
            'order_status' => $newStatus
        ]);

        $statusVietnamese = $this->getVietnameseOrderStatus($newStatus);
        $currentStatusVietnamese = $this->getVietnameseOrderStatus($currentStatus);

        OrderHistory::create([
            'order_id' => $order->order_id,
            'status' => $newStatus,
            'note' => $request->note ?? "Trạng thái đơn hàng đã thay đổi từ {$currentStatusVietnamese} sang {$statusVietnamese}",
            'processed_by_user_id' => Auth::id(),
            'shipped_by_user_id' => $newStatus === 'shipping' ? Auth::id() : null
        ]);

        DB::commit();

        return response()->json([
            'status' => 'success',
            'message' => 'Order status updated successfully',
            'data' => $order
        ]);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'status' => 'error',
            'message' => 'Failed to update order status: ' . $e->getMessage()
        ], 500);
    }
}

    public function updatePaymentStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'status' => ['required', Rule::in(['pending', 'paid', 'refunded', 'failed'])],
            'note' => 'nullable|string|max:500'
        ]);

        $currentStatus = $order->payment_status;
        $newStatus = $request->status;

        $allowedTransitions = [
            'pending' => ['paid', 'failed'],
            'paid' => ['refunded'],
            'refunded' => [],
            'failed' => []
        ];

        if (!in_array($newStatus, $allowedTransitions[$currentStatus] ?? [])) {
            return response()->json([
                'status' => 'error',
                'message' => "Cannot change payment status from '$currentStatus' to '$newStatus'"
            ], 400);
        }

        try {
            DB::beginTransaction();

            $order->update([
                'payment_status' => $newStatus
            ]);

            $statusVietnamese = $this->getVietnamesePaymentStatus($newStatus);
            $currentStatusVietnamese = $this->getVietnamesePaymentStatus($currentStatus);

            OrderHistory::create([
                'order_id' => $order->order_id,
                'status' => 'payment_' . $newStatus,
                'note' => $request->note ?? "Trạng thái thanh toán đã thay đổi từ {$currentStatusVietnamese} sang {$statusVietnamese}",
                'processed_by_user_id' => Auth::id(),
                'shipped_by_user_id' => null
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Payment status updated successfully',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update order status: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getVietnameseOrderStatus($status)
    {
        $statusMap = [
            'new' => 'Mới',
            'processing' => 'Đang xử lý',
            'confirmed'=>'Đã xác nhận',
            'preparing' => 'Đang chuẩn bị hàng',
            'packed' => 'Đã đóng hàng',
            'shipping' => 'Đang giao hàng',
            'delivered' => 'Đã giao hàng',
            'cancelled' => 'Đã hủy'
        ];

        return $statusMap[$status] ?? $status;
    }

    private function getVietnamesePaymentStatus($status)
    {
        $statusMap = [
            'pending' => 'Chờ thanh toán',
            'paid' => 'Đã thanh toán',
            'refunded' => 'Đã hoàn tiền',
            'failed' => 'Thanh toán thất bại'
        ];

        return $statusMap[$status] ?? $status;
    }
}
