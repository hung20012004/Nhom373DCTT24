<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     */
    public function index(Request $request)
    {
        // Validate and sanitize input parameters
        $search = $request->input('search', '');
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $perPage = $request->input('per_page', 10);
        $status = $request->input('status', null);

        // Build the query
        $query = Order::with(['user', 'orderDetails.product'])
            ->when($search, function ($query) use ($search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($subQuery) use ($search) {
                          $subQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            })
            ->when($status, function ($query) use ($status) {
                return $query->where('status', $status);
            });

        // Apply sorting
        $query->orderBy($sortField, $sortDirection);

        // Paginate results
        $orders = $query->paginate($perPage);

        // Return data for Inertia
        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
            ]
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, $orderId)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled'
        ]);

        $order = Order::findOrFail($orderId);
        $order->status = $request->input('status');
        $order->save();

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order
        ]);
    }

    /**
     * Delete an order.
     */
    public function destroy($orderId)
    {
        $order = Order::findOrFail($orderId);

        // Optional: Add authorization check
        // $this->authorize('delete', $order);

        $order->delete();

        return response()->json([
            'message' => 'Order deleted successfully'
        ]);
    }

    /**
     * Show order details.
     */
    public function show($orderId)
    {
        $order = Order::with([
            'user',
            'orderDetails.product',
            'orderDetails.product.images',
            'shippingAddress'
        ])->findOrFail($orderId);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order
        ]);
    }
}
