<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SupportRequest;
use App\Models\SupportRequestReply;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SupportRequestController extends Controller
{
    /**
     * Display a listing of support requests
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = SupportRequest::with(['user', 'order', 'resolver']);

            // Filter by status if provided and different from "all"
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by issue type if provided and different from "all"
            if ($request->has('issue_type') && $request->issue_type !== 'all') {
                $query->where('issue_type', $request->issue_type);
            }

            // Filter by user if provided
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            // Filter by order if provided
            if ($request->has('order_id')) {
                $query->where('order_id', $request->order_id);
            }

            // Search in description
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('description', 'like', "%{$searchTerm}%")
                      ->orWhereHas('user', function($uq) use ($searchTerm) {
                          $uq->where('name', 'like', "%{$searchTerm}%");
                      })
                      ->orWhere('id', 'like', "%{$searchTerm}%");
                });
            }

            // Date range filter
            if ($request->filled('from_date')) {
                $query->whereDate('created_at', '>=', $request->from_date);
            }

            if ($request->filled('to_date')) {
                $query->whereDate('created_at', '<=', $request->to_date);
            }

            // Ensure user can only see their own requests unless they're admin
            // Sửa lỗi ở đây - $user->role là string nên không dùng === '1'
            if (Auth::check() && Auth::user()->role != '1') {
                $query->where('user_id', Auth::id());
            }

            // Handle sorting
            $sortField = $request->input('sort_field', 'created_at');
            $sortDirection = $request->input('sort_direction', 'desc');

            $allowedSortFields = [
                'issue_type' => 'issue_type',
                'status' => 'status',
                'created_at' => 'created_at'
            ];

            if (array_key_exists($sortField, $allowedSortFields)) {
                $dbField = $allowedSortFields[$sortField];
                $query->orderBy($dbField, $sortDirection);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            $perPage = (int)$request->input('per_page', 15);
            $supportRequests = $query->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'data' => $supportRequests
            ]);
        } catch (\Exception $e) {
            // Ghi log và trả về thông báo lỗi
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi tải dữ liệu yêu cầu hỗ trợ.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified support request
     */
    public function show($id): JsonResponse
    {
        $supportRequest = SupportRequest::with([
            'user',
            'order',
            'resolver',
        ])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $supportRequest
        ]);
    }

}
