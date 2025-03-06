<?php

namespace App\Http\Controllers\Admin;

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
     * Store a newly created purchase order
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,supplier_id',
            'order_date' => 'required|date',
            'expected_date' => 'nullable|date|after_or_equal:order_date',
            'status' => ['required', Rule::in(['pending', 'processing', 'completed', 'cancelled'])],
            'note' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,product_id',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0'
        ]);

        try {
            DB::beginTransaction();

            // Create purchase order
            $purchaseOrder = PurchaseOrder::create([
                'supplier_id' => $request->supplier_id,
                'create_by_user_id' => Auth::id(),
                'order_date' => $request->order_date,
                'expected_date' => $request->expected_date,
                'status' => $request->status,
                'note' => $request->note,
                'total_amount' => 0 // Will be calculated after details are added
            ]);

            // Create purchase order details
            $totalAmount = 0;

            foreach ($request->details as $detail) {
                $subtotal = $detail['quantity'] * $detail['unit_price'];
                $totalAmount += $subtotal;

                PurchaseOrderDetail::create([
                    'po_id' => $purchaseOrder->po_id,
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'unit_price' => $detail['unit_price'],
                    'subtotal' => $subtotal
                ]);
            }

            // Update total amount
            $purchaseOrder->update(['total_amount' => $totalAmount]);

            DB::commit();

            // Return the created purchase order with details
            $purchaseOrder->load(['supplier', 'createdByUser', 'details.product']);

            return response()->json([
                'status' => 'success',
                'message' => 'Purchase order created successfully',
                'data' => $purchaseOrder
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create purchase order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified purchase order
     */
    public function update(Request $request, $id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        // Don't allow updating if status is not pending
        if ($purchaseOrder->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pending purchase orders can be updated'
            ], 400);
        }

        $request->validate([
            'supplier_id' => 'sometimes|required|exists:suppliers,supplier_id',
            'order_date' => 'sometimes|required|date',
            'expected_date' => 'nullable|date|after_or_equal:order_date',
            'status' => ['sometimes', 'required', Rule::in(['pending', 'processing', 'completed', 'cancelled'])],
            'note' => 'nullable|string',
            'details' => 'sometimes|required|array|min:1',
            'details.*.product_id' => 'required|exists:products,product_id',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0'
        ]);

        try {
            DB::beginTransaction();

            // Update purchase order
            $purchaseOrder->update($request->only([
                'supplier_id', 'order_date', 'expected_date', 'status', 'note'
            ]));

            // Update details if provided
            if ($request->has('details')) {
                // Delete existing details
                $purchaseOrder->details()->delete();

                // Create new details
                $totalAmount = 0;

                foreach ($request->details as $detail) {
                    $subtotal = $detail['quantity'] * $detail['unit_price'];
                    $totalAmount += $subtotal;

                    PurchaseOrderDetail::create([
                        'po_id' => $purchaseOrder->po_id,
                        'product_id' => $detail['product_id'],
                        'quantity' => $detail['quantity'],
                        'unit_price' => $detail['unit_price'],
                        'subtotal' => $subtotal
                    ]);
                }

                // Update total amount
                $purchaseOrder->update(['total_amount' => $totalAmount]);
            }

            DB::commit();

            // Return the updated purchase order with details
            $purchaseOrder->load(['supplier', 'createdByUser', 'details.product']);

            return response()->json([
                'status' => 'success',
                'message' => 'Purchase order updated successfully',
                'data' => $purchaseOrder
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update purchase order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified purchase order
     */
    public function destroy($id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        // Only allow deleting if status is pending
        if ($purchaseOrder->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pending purchase orders can be deleted'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Delete associated details first (should happen automatically due to cascade)
            $purchaseOrder->details()->delete();

            // Delete the purchase order
            $purchaseOrder->delete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Purchase order deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete purchase order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update purchase order status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        $request->validate([
            'status' => ['required', Rule::in(['pending', 'processing', 'completed', 'cancelled'])]
        ]);

        $currentStatus = $purchaseOrder->status;
        $newStatus = $request->status;

        // Validate status transitions
        $allowedTransitions = [
            'pending' => ['processing', 'cancelled'],
            'processing' => ['completed', 'cancelled'],
            'completed' => [],
            'cancelled' => []
        ];

        if (!in_array($newStatus, $allowedTransitions[$currentStatus])) {
            return response()->json([
                'status' => 'error',
                'message' => "Cannot change status from '$currentStatus' to '$newStatus'"
            ], 400);
        }

        try {
            $purchaseOrder->update(['status' => $newStatus]);

            return response()->json([
                'status' => 'success',
                'message' => 'Purchase order status updated successfully',
                'data' => $purchaseOrder
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update purchase order status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get purchase order details
     */
    public function getDetails($id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);
        $details = $purchaseOrder->details()->with('product')->get();

        return response()->json([
            'status' => 'success',
            'data' => $details
        ]);
    }

    /**
     * Add a detail to the purchase order
     */
    public function addDetail(Request $request, $id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        // Only allow adding details if status is pending
        if ($purchaseOrder->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Details can only be added to pending purchase orders'
            ], 400);
        }

        $request->validate([
            'product_id' => 'required|exists:products,product_id',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0'
        ]);

        try {
            DB::beginTransaction();

            $subtotal = $request->quantity * $request->unit_price;

            // Check if the product already exists in the PO
            $existing = PurchaseOrderDetail::where([
                'po_id' => $purchaseOrder->po_id,
                'product_id' => $request->product_id
            ])->first();

            if ($existing) {
                // Update existing detail
                $existing->update([
                    'quantity' => $existing->quantity + $request->quantity,
                    'unit_price' => $request->unit_price,
                    'subtotal' => $existing->subtotal + $subtotal
                ]);
                $detail = $existing;
            } else {
                // Create new detail
                $detail = PurchaseOrderDetail::create([
                    'po_id' => $purchaseOrder->po_id,
                    'product_id' => $request->product_id,
                    'quantity' => $request->quantity,
                    'unit_price' => $request->unit_price,
                    'subtotal' => $subtotal
                ]);
            }

            // Update total amount
            $purchaseOrder->recalculateTotalAmount();

            DB::commit();

            // Load product data
            $detail->load('product');

            return response()->json([
                'status' => 'success',
                'message' => 'Detail added to purchase order',
                'data' => $detail
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to add detail: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a purchase order detail
     */
    public function updateDetail(Request $request, $id, $productId): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        // Only allow updating details if status is pending
        if ($purchaseOrder->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Details can only be updated for pending purchase orders'
            ], 400);
        }

        $request->validate([
            'quantity' => 'sometimes|required|integer|min:1',
            'unit_price' => 'sometimes|required|numeric|min:0'
        ]);

        try {
            DB::beginTransaction();

            $detail = PurchaseOrderDetail::where([
                'po_id' => $purchaseOrder->po_id,
                'product_id' => $productId
            ])->firstOrFail();

            // Update the detail
            $detail->update($request->only(['quantity', 'unit_price']));

            // Recalculate subtotal
            $detail->update([
                'subtotal' => $detail->quantity * $detail->unit_price
            ]);

            // Update total amount in purchase order
            $purchaseOrder->recalculateTotalAmount();

            DB::commit();

            // Load product data
            $detail->load('product');

            return response()->json([
                'status' => 'success',
                'message' => 'Purchase order detail updated',
                'data' => $detail
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update detail: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a detail from the purchase order
     */
    public function removeDetail($id, $productId): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        // Only allow removing details if status is pending
        if ($purchaseOrder->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Details can only be removed from pending purchase orders'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $detail = PurchaseOrderDetail::where([
                'po_id' => $purchaseOrder->po_id,
                'product_id' => $productId
            ])->firstOrFail();

            // Delete the detail
            $detail->delete();

            // Update total amount
            $purchaseOrder->recalculateTotalAmount();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Detail removed from purchase order'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove detail: ' . $e->getMessage()
            ], 500);
        }
    }
}
