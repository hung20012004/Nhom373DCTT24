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
        $order = Order::findOrFail($id);

        $request->validate([
            'status' => ['required', Rule::in(['new', 'processing', 'shipping', 'delivered', 'cancelled'])],
            'note' => 'nullable|string|max:500'
        ]);

        $currentStatus = $order->order_status;
        $newStatus = $request->status;

        // Validate status transitions
        $allowedTransitions = [
            'new' => ['processing', 'cancelled'],
            'processing' => ['shipping', 'cancelled'],
            'shipping' => ['delivered', 'cancelled'],
            'delivered' => [],
            'cancelled' => []
        ];

        if (!in_array($newStatus, $allowedTransitions[$currentStatus])) {
            return response()->json([
                'status' => 'error',
                'message' => "Cannot change status from '$currentStatus' to '$newStatus'"
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Update the status
            $order->update([
                'order_status' => $newStatus
            ]);

            // Create order history record with Vietnamese note
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

        // Validate status transitions
        $allowedTransitions = [
            'pending' => ['paid', 'failed'],
            'paid' => ['refunded'],
            'refunded' => [],
            'failed' => []
        ];

        if (!in_array($newStatus, $allowedTransitions[$currentStatus])) {
            return response()->json([
                'status' => 'error',
                'message' => "Cannot change payment status from '$currentStatus' to '$newStatus'"
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Update the status
            $order->update([
                'payment_status' => $newStatus
            ]);

            // Create order history record for payment status change with Vietnamese note
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

    /**
     * Convert order status to Vietnamese
     */
    private function getVietnameseOrderStatus($status)
    {
        $statusMap = [
            'new' => 'Mới',
            'processing' => 'Đang xử lý',
            'shipping' => 'Đang giao hàng',
            'delivered' => 'Đã giao hàng',
            'cancelled' => 'Đã hủy'
        ];

        return $statusMap[$status] ?? $status;
    }

    /**
     * Convert payment status to Vietnamese
     */
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
