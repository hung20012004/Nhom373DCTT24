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

        // Xử lý lọc theo nhiều trạng thái đơn hàng
        if ($request->has('order_status')) {
            // Nếu order_status chứa dấu phẩy, xử lý như một danh sách các trạng thái
            if (strpos($request->order_status, ',') !== false) {
                $statuses = explode(',', $request->order_status);
                $query->whereIn('order_status', $statuses);
            } else {
                // Xử lý như trước nếu chỉ có một giá trị
                $query->where('order_status', $request->order_status);
            }
        }

        // Lọc theo trạng thái thanh toán
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Tìm kiếm theo mã đơn hàng hoặc thông tin khách hàng
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_id', 'like', "%{$search}%")
                  ->orWhereHas('user', function($query) use ($search) {
                      $query->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Date range filter
        if ($request->has('from_date')) {
            $query->whereDate('order_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('order_date', '<=', $request->to_date);
        }

        // Sắp xếp kết quả
        $sortField = $request->input('sort_field', 'order_date');
        $sortDirection = $request->input('sort_direction', 'desc');

        // Đảm bảo sortField là một trường hợp lệ để tránh lỗi SQL
        $allowedSortFields = ['order_id', 'order_date', 'payment_status', 'order_status', 'total_amount'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'order_date';
        }

        $query->orderBy($sortField, $sortDirection);

        $perPage = $request->input('per_page', 15);
        $orders = $query->paginate($perPage);

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
