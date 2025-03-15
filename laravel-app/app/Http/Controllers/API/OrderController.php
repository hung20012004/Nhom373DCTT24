<?php

namespace App\Http\Controllers\API;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\CartItem;
use App\Models\ShippingAddress;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with([
            'details' => function ($detail) {
                $detail->with('variant.product', 'variant.color', 'variant.size');
            },
            'shippingAddress','user'
        ]);

        if ($request->has('order_status')) {
            $query->where('order_status', $request->status);
        }

        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->supplier_id);
        }

        // Date range filter
        if ($request->has('from_date')) {
            $query->whereDate('order_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('order_date', '<=', $request->to_date);
        }

        $perPage = $request->input('per_page', 15);
        $orders = $query->orderBy('order_id', 'asc')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    public function show($orderId)
    {
        $order = Order::with([
            'details' => function ($query) {
                $query->with('variant.product', 'variant.color', 'variant.size');
            },
            'shippingAddress', 'user'
        ])
            ->where('order_id', $orderId)
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $order
        ]);
    }
}
