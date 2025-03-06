<?php

namespace App\Http\Controllers\Admin;

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
     * Store a newly created inventory check
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'check_date' => 'required|date',
            'status' => ['required', Rule::in(['draft', 'completed'])],
            'note' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,product_id',
            'details.*.system_quantity' => 'required|integer|min:0',
            'details.*.actual_quantity' => 'required|integer|min:0',
            'details.*.note' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            // Create inventory check
            $inventoryCheck = InventoryCheck::create([
                'create_by' => Auth::id(),
                'check_date' => $request->check_date,
                'status' => $request->status,
                'note' => $request->note
            ]);

            // Create inventory check details
            foreach ($request->details as $detail) {
                $difference = $detail['actual_quantity'] - $detail['system_quantity'];

                InventoryCheckDetail::create([
                    'check_id' => $inventoryCheck->check_id,
                    'product_id' => $detail['product_id'],
                    'system_quantity' => $detail['system_quantity'],
                    'actual_quantity' => $detail['actual_quantity'],
                    'difference' => $difference,
                    'note' => $detail['note'] ?? null
                ]);
            }

            DB::commit();

            // Return the created inventory check with details
            $inventoryCheck->load(['createdByUser', 'details.product']);

            return response()->json([
                'status' => 'success',
                'message' => 'Inventory check created successfully',
                'data' => $inventoryCheck
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create inventory check: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified inventory check
     */
    public function update(Request $request, $id): JsonResponse
    {
        $inventoryCheck = InventoryCheck::findOrFail($id);

        // Don't allow updating if status is not draft
        if ($inventoryCheck->status !== 'draft') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only draft inventory checks can be updated'
            ], 400);
        }

        $request->validate([
            'check_date' => 'sometimes|required|date',
            'status' => ['sometimes', 'required', Rule::in(['draft', 'completed'])],
            'note' => 'nullable|string',
            'details' => 'sometimes|required|array|min:1',
            'details.*.product_id' => 'required|exists:products,product_id',
            'details.*.system_quantity' => 'required|integer|min:0',
            'details.*.actual_quantity' => 'required|integer|min:0',
            'details.*.note' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            // Update inventory check
            $inventoryCheck->update($request->only([
                'check_date', 'status', 'note'
            ]));

            // Update details if provided
            if ($request->has('details')) {
                // Delete existing details
                $inventoryCheck->details()->delete();

                // Create new details
                foreach ($request->details as $detail) {
                    $difference = $detail['actual_quantity'] - $detail['system_quantity'];

                    InventoryCheckDetail::create([
                        'check_id' => $inventoryCheck->check_id,
                        'product_id' => $detail['product_id'],
                        'system_quantity' => $detail['system_quantity'],
                        'actual_quantity' => $detail['actual_quantity'],
                        'difference' => $difference,
                        'note' => $detail['note'] ?? null
                    ]);
                }
            }

            DB::commit();

            // Return the updated inventory check with details
            $inventoryCheck->load(['createdByUser', 'details.product']);

            return response()->json([
                'status' => 'success',
                'message' => 'Inventory check updated successfully',
                'data' => $inventoryCheck
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update inventory check: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified inventory check
     */
    public function destroy($id): JsonResponse
    {
        $inventoryCheck = InventoryCheck::findOrFail($id);

        // Only allow deleting if status is draft
        if ($inventoryCheck->status !== 'draft') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only draft inventory checks can be deleted'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Delete associated details first (should happen automatically due to cascade)
            $inventoryCheck->details()->delete();

            // Delete the inventory check
            $inventoryCheck->delete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Inventory check deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete inventory check: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update inventory check status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $inventoryCheck = InventoryCheck::findOrFail($id);

        $request->validate([
            'status' => ['required', Rule::in(['draft', 'completed'])]
        ]);

        $currentStatus = $inventoryCheck->status;
        $newStatus = $request->status;

        // Validate status transitions
        $allowedTransitions = [
            'draft' => ['completed'],
            'completed' => ['draft']
        ];

        if (!in_array($newStatus, $allowedTransitions[$currentStatus])) {
            return response()->json([
                'status' => 'error',
                'message' => "Cannot change status from '$currentStatus' to '$newStatus'"
            ], 400);
        }

        try {
            $inventoryCheck->update(['status' => $newStatus]);

            return response()->json([
                'status' => 'success',
                'message' => 'Inventory check status updated successfully',
                'data' => $inventoryCheck
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update inventory check status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory check details
     */
    public function getDetails($id): JsonResponse
    {
        $inventoryCheck = InventoryCheck::findOrFail($id);
        $details = $inventoryCheck->details()->with('product')->get();

        return response()->json([
            'status' => 'success',
            'data' => $details
        ]);
    }

    /**
     * Add a detail to the inventory check
     */
    public function addDetail(Request $request, $id): JsonResponse
    {
        $inventoryCheck = InventoryCheck::findOrFail($id);

        // Only allow adding details if status is draft
        if ($inventoryCheck->status !== 'draft') {
            return response()->json([
                'status' => 'error',
                'message' => 'Details can only be added to draft inventory checks'
            ], 400);
        }

        $request->validate([
            'product_id' => 'required|exists:products,product_id',
            'system_quantity' => 'required|integer|min:0',
            'actual_quantity' => 'required|integer|min:0',
            'note' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $difference = $request->actual_quantity - $request->system_quantity;

            // Check if the product already exists in the check
            $existing = InventoryCheckDetail::where([
                'check_id' => $inventoryCheck->check_id,
                'product_id' => $request->product_id
            ])->first();

            if ($existing) {
                // Update existing detail
                $existing->update([
                    'system_quantity' => $request->system_quantity,
                    'actual_quantity' => $request->actual_quantity,
                    'difference' => $difference,
                    'note' => $request->note
                ]);
                $detail = $existing;
            } else {
                // Create new detail
                $detail = InventoryCheckDetail::create([
                    'check_id' => $inventoryCheck->check_id,
                    'product_id' => $request->product_id,
                    'system_quantity' => $request->system_quantity,
                    'actual_quantity' => $request->actual_quantity,
                    'difference' => $difference,
                    'note' => $request->note
                ]);
            }

            DB::commit();

            // Load product data
            $detail->load('product');

            return response()->json([
                'status' => 'success',
                'message' => 'Detail added to inventory check',
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
     * Update an inventory check detail
     */
    public function updateDetail(Request $request, $id, $productId): JsonResponse
    {
        $inventoryCheck = InventoryCheck::findOrFail($id);

        // Only allow updating details if status is draft
        if ($inventoryCheck->status !== 'draft') {
            return response()->json([
                'status' => 'error',
                'message' => 'Details can only be updated for draft inventory checks'
            ], 400);
        }

        $request->validate([
            'system_quantity' => 'sometimes|required|integer|min:0',
            'actual_quantity' => 'sometimes|required|integer|min:0',
            'note' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $detail = InventoryCheckDetail::where([
                'check_id' => $inventoryCheck->check_id,
                'product_id' => $productId
            ])->firstOrFail();

            // Update the detail
            $data = $request->only(['system_quantity', 'actual_quantity', 'note']);

            // Calculate difference if either quantity is updated
            if (isset($data['system_quantity']) || isset($data['actual_quantity'])) {
                $systemQty = $data['system_quantity'] ?? $detail->system_quantity;
                $actualQty = $data['actual_quantity'] ?? $detail->actual_quantity;
                $data['difference'] = $actualQty - $systemQty;
            }

            $detail->update($data);

            DB::commit();

            // Load product data
            $detail->load('product');

            return response()->json([
                'status' => 'success',
                'message' => 'Inventory check detail updated',
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
     * Remove a detail from the inventory check
     */
    public function removeDetail($id, $productId): JsonResponse
    {
        $inventoryCheck = InventoryCheck::findOrFail($id);

        // Only allow removing details if status is draft
        if ($inventoryCheck->status !== 'draft') {
            return response()->json([
                'status' => 'error',
                'message' => 'Details can only be removed from draft inventory checks'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $detail = InventoryCheckDetail::where([
                'check_id' => $inventoryCheck->check_id,
                'product_id' => $productId
            ])->firstOrFail();

            // Delete the detail
            $detail->delete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Detail removed from inventory check'
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
