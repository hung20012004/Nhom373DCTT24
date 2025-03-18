<?php

namespace App\Http\Controllers\Customer;

use App\Models\SupportRequest;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SupportRequestController extends Controller
{
    public function index()
    {
        $supportRequests = SupportRequest::with(['user', 'order', 'resolver'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('SupportRequests/Index', [
            'supportRequests' => $supportRequests,
        ]);
    }

    public function show($id)
    {
        $supportRequest = SupportRequest::with(['user', 'order', 'resolver'])
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return Inertia::render('SupportRequests/Show', [
            'supportRequest' => $supportRequest,
        ]);
    }

    public function create()
    {
        $orders = Order::where('user_id', Auth::id())
            ->orderBy('order_date', 'desc')
            ->get();

        return Inertia::render('SupportRequests/Create', [
            'orders' => $orders,
            'issueTypes' => [
                SupportRequest::ISSUE_SHIPPING => 'Vấn đề vận chuyển',
                SupportRequest::ISSUE_PRODUCT => 'Vấn đề sản phẩm',
                SupportRequest::ISSUE_PAYMENT => 'Vấn đề thanh toán',
                SupportRequest::ISSUE_OTHER => 'Khác',
            ]
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'order_id' => 'nullable|exists:orders,order_id',
                'issue_type' => 'required|in:' . implode(',', [
                    SupportRequest::ISSUE_SHIPPING,
                    SupportRequest::ISSUE_PRODUCT,
                    SupportRequest::ISSUE_PAYMENT,
                    SupportRequest::ISSUE_OTHER
                ]),
                'description' => 'required|string|max:1000',
            ]);

            DB::beginTransaction();

            $supportRequest = SupportRequest::create([
                'user_id' => Auth::id(),
                'order_id' => $validated['order_id'],
                'issue_type' => $validated['issue_type'],
                'description' => $validated['description'],
                'status' => SupportRequest::STATUS_NEW,
            ]);

            DB::commit();

            return redirect()->route('support.show', ['id' => $supportRequest->id])
                ->with('success', 'Yêu cầu hỗ trợ đã được gửi thành công.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'errors' => $e->validator->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Đã có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $supportRequest = SupportRequest::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            if ($supportRequest->status === SupportRequest::STATUS_CLOSED) {
                return back()->with('error', 'Không thể cập nhật yêu cầu hỗ trợ đã đóng.');
            }

            $validated = $request->validate([
                'description' => 'required|string|max:1000',
            ]);

            DB::beginTransaction();

            $supportRequest->update([
                'description' => $validated['description'],
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Yêu cầu hỗ trợ đã được cập nhật thành công.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Đã có lỗi xảy ra: ' . $e->getMessage());
        }
    }

    public function cancel(Request $request, $id)
    {
        try {
            $supportRequest = SupportRequest::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            if (!in_array($supportRequest->status, [SupportRequest::STATUS_NEW, SupportRequest::STATUS_IN_PROGRESS])) {
                return back()->with('error', 'Không thể hủy yêu cầu hỗ trợ ở trạng thái hiện tại.');
            }

            DB::beginTransaction();

            $supportRequest->update([
                'status' => SupportRequest::STATUS_CLOSED,
                'admin_notes' => ($supportRequest->admin_notes ? $supportRequest->admin_notes . "\n" : '') .
                                'Đã đóng bởi khách hàng: ' . ($request->reason ?? 'Không có lý do'),
                'resolved_at' => now(),
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Yêu cầu hỗ trợ đã được đóng thành công.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Đã có lỗi xảy ra: ' . $e->getMessage());
        }
    }

    public function byOrder($orderId)
    {
        $order = Order::where('order_id', $orderId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $supportRequests = SupportRequest::where('order_id', $orderId)
            ->where('user_id', Auth::id())
            ->with(['resolver'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('SupportRequests/ByOrder', [
            'order' => $order,
            'supportRequests' => $supportRequests,
        ]);
    }

    public function createForOrder($orderId)
    {
        $order = Order::where('order_id', $orderId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return Inertia::render('SupportRequest/Create', [
            'selectedOrder' => $order,
            'issueTypes' => [
                SupportRequest::ISSUE_SHIPPING => 'Vấn đề vận chuyển',
                SupportRequest::ISSUE_PRODUCT => 'Vấn đề sản phẩm',
                SupportRequest::ISSUE_PAYMENT => 'Vấn đề thanh toán',
                SupportRequest::ISSUE_OTHER => 'Khác',
            ]
        ]);
    }

    public function markAsResolved(Request $request, $id)
    {
        try {
            $supportRequest = SupportRequest::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            if (!in_array($supportRequest->status, [SupportRequest::STATUS_RESOLVED])) {
                return back()->with('error', 'Chỉ có thể xác nhận giải quyết cho yêu cầu có trạng thái "Đã giải quyết".');
            }

            DB::beginTransaction();

            $supportRequest->update([
                'status' => SupportRequest::STATUS_CLOSED,
                'admin_notes' => ($supportRequest->admin_notes ? $supportRequest->admin_notes . "\n" : '') .
                                'Khách hàng đã xác nhận giải quyết: ' . ($request->feedback ?? 'Không có phản hồi'),
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Yêu cầu hỗ trợ đã được xác nhận giải quyết thành công.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Đã có lỗi xảy ra: ' . $e->getMessage());
        }
    }

    public function reopenRequest(Request $request, $id)
    {
        try {
            $supportRequest = SupportRequest::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            if (!in_array($supportRequest->status, [SupportRequest::STATUS_RESOLVED])) {
                return back()->with('error', 'Chỉ có thể mở lại yêu cầu có trạng thái "Đã giải quyết".');
            }

            $validated = $request->validate([
                'reason' => 'required|string|max:500',
            ]);

            DB::beginTransaction();

            $supportRequest->update([
                'status' => SupportRequest::STATUS_IN_PROGRESS,
                'admin_notes' => ($supportRequest->admin_notes ? $supportRequest->admin_notes . "\n" : '') .
                                'Yêu cầu được mở lại: ' . $validated['reason'],
                'resolved_at' => null,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Yêu cầu hỗ trợ đã được mở lại thành công.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Đã có lỗi xảy ra: ' . $e->getMessage());
        }
    }
}
