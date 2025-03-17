<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportRequest;
use App\Models\SupportRequestReply;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class SupportRequestController extends Controller
{
    /**
     * Create a new support request
     */
    public function store(Request $request, $orderId)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'issue_type' => 'required|in:shipping,product,payment,other',
            'description' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        // Check if the order exists and belongs to the authenticated user
        $order = Order::where('order_id', $orderId)
            ->where('user_id', Auth::id())
            ->first();

        if (!$order) {
            return back()->withErrors(['error' => 'Đơn hàng không tồn tại hoặc không thuộc về bạn.']);
        }

        // Create the support request
        $supportRequest = SupportRequest::create([
            'user_id' => Auth::id(),
            'order_id' => $orderId,
            'issue_type' => $request->issue_type,
            'description' => $request->description,
            'status' => SupportRequest::STATUS_NEW,
        ]);

        // Send notification to admin if needed
        // $this->notifyAdmins($supportRequest);

        return response()->json($supportRequest, 201);
    }

    /**
     * Update support request status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $supportRequest = SupportRequest::findOrFail($id);

        $request->validate([
            'status' => ['required', Rule::in([
                SupportRequest::STATUS_NEW,
                SupportRequest::STATUS_IN_PROGRESS,
                SupportRequest::STATUS_RESOLVED,
                SupportRequest::STATUS_CLOSED
            ])]
        ]);

        $currentStatus = $supportRequest->status;
        $newStatus = $request->status;

        // Validate status transitions
        $allowedTransitions = [
            SupportRequest::STATUS_NEW => [
                SupportRequest::STATUS_IN_PROGRESS,
                SupportRequest::STATUS_CLOSED
            ],
            SupportRequest::STATUS_IN_PROGRESS => [
                SupportRequest::STATUS_RESOLVED,
                SupportRequest::STATUS_CLOSED
            ],
            SupportRequest::STATUS_RESOLVED => [],
            SupportRequest::STATUS_CLOSED => []
        ];

        if (!in_array($newStatus, $allowedTransitions[$currentStatus])) {
            return response()->json([
                'status' => 'error',
                'message' => "Không thể chuyển trạng thái từ '$currentStatus' thành '$newStatus'"
            ], 400);
        }

        try {
            // Update the status
            $updateData = ['status' => $newStatus, 'assigned_to' => Auth::id()];

            // Set resolved_at timestamp if status is being changed to resolved
            if ($newStatus === SupportRequest::STATUS_RESOLVED && $supportRequest->resolved_at === null) {
                $updateData['resolved_at'] = now();
            }

            $supportRequest->update($updateData);

            return response()->json([
                'status' => 'success',
                'message' => 'Support request status updated successfully',
                'data' => $supportRequest
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update support request status: ' . $e->getMessage()
            ], 500);
        }
    }

    public function close($id)
    {
        // Find the support request
        $supportRequest = SupportRequest::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Check if the support request can be closed
        if ($supportRequest->status === SupportRequest::STATUS_CLOSED) {
            return back()->withErrors(['error' => 'Yêu cầu hỗ trợ đã đóng.']);
        }

        // Close the support request
        $supportRequest->update([
            'status' => SupportRequest::STATUS_CLOSED,
        ]);

        return back()->with('success', 'Yêu cầu hỗ trợ đã được gửi.');
    }

    /**
     * Remove the specified support request
     */
    public function destroy($id): JsonResponse
    {
        $supportRequest = SupportRequest::findOrFail($id);

        try {
            DB::beginTransaction();

            // Delete associated replies first
            $supportRequest->replies()->delete();

            // Delete the support request
            $supportRequest->delete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Support request deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete support request: ' . $e->getMessage()
            ], 500);
        }
    }
}
