<?php

namespace App\Http\Controllers\Admin;

use App\Models\Order;
use App\Models\OrderDetail;
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
            'status' => ['required', Rule::in(['new', 'processing', 'shipping', 'delivered', 'cancelled'])]
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
            // Update the status
            $order->update([
                'order_status' => $newStatus
            ]);

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
            'status' => ['required', Rule::in(['pending', 'paid', 'refunded', 'failed'])]
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
            // Update the status
            $order->update([
                'payment_status' => $newStatus
            ]);

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
}
