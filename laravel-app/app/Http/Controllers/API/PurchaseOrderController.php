<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderDetail;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of purchase orders
     */
    public function index(Request $request): JsonResponse
    {
        $query = PurchaseOrder::with(['supplier', 'createdByUser', 'details.product']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by supplier if provided
        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Date range filter
        if ($request->has('from_date')) {
            $query->whereDate('order_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('order_date', '<=', $request->to_date);
        }

        $perPage = $request->input('per_page', 15);
        $purchaseOrders = $query->orderBy('order_date', 'desc')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $purchaseOrders
        ]);
    }

    /**
     * Display the specified purchase order
     */
    public function show($id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::with(['supplier', 'createdByUser', 'details.product'])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $purchaseOrder
        ]);
    }
}
