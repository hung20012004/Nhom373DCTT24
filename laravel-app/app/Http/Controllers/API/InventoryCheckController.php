<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\InventoryCheck;
use App\Models\InventoryCheckDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class InventoryCheckController extends Controller
{
    /**
     * Display a listing of inventory checks
     */
    public function index(Request $request): JsonResponse
    {
        $query = InventoryCheck::with(['createdByUser', 'details.product']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by creator if provided
        if ($request->has('create_by')) {
            $query->where('create_by', $request->create_by);
        }

        // Date range filter
        if ($request->has('from_date')) {
            $query->whereDate('check_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('check_date', '<=', $request->to_date);
        }

        $perPage = $request->input('per_page', 15);
        $inventoryChecks = $query->orderBy('check_date', 'desc')->paginate($perPage);

        $inventoryChecks->getCollection()->transform(function ($check) {
            // Load details with count for better performance
            $details = $check->details()->with('product')->get();

            // Calculate summary statistics
            $check->total_products = $details->count();
            $check->total_difference = $details->sum('difference');
            $check->products_with_discrepancy = $details->filter(function ($detail) {
                return $detail->difference != 0;
            })->count();

            return $check;
        });

        return response()->json([
            'status' => 'success',
            'data' => $inventoryChecks
        ]);
    }

    /**
     * Display the specified inventory check
     */
    public function show($id): JsonResponse
    {
        $inventoryCheck = InventoryCheck::with(['createdByUser', 'details.product'])
            ->findOrFail($id);

        $details = $inventoryCheck->details()->with('product')->get();

        // Process details to add calculated fields
        $processedDetails = $details->map(function ($detail) {
            // Calculate discrepancy percentage
            if ($detail->system_quantity == 0) {
                $detail->discrepancy_percentage = $detail->actual_quantity > 0 ? 100 : 0;
            } else {
                $detail->discrepancy_percentage = round(($detail->difference / $detail->system_quantity) * 100, 2);
            }

            return $detail;
        });

        // Add details to inventory check
        $inventoryCheck->details = $processedDetails;

        // Add calculated summary fields
        $inventoryCheck->total_products = $details->count();
        $inventoryCheck->total_difference = $details->sum('difference');
        $inventoryCheck->products_with_discrepancy = $details->filter(function ($detail) {
            return $detail->difference != 0;
        })->count();

        return response()->json([
            'status' => 'success',
            'data' => $inventoryCheck
        ]);
    }
}
