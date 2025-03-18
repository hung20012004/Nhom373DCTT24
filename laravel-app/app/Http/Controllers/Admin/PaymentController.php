<?php

namespace App\Http\Controllers\Admin;

use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $paymentType = $request->query('type', 'cod');
        $status = $request->query('status', null);
        $startDate = $request->query('start_date', null);
        $endDate = $request->query('end_date', null);
        $search = $request->query('search', '');

        $query = Payment::with(['order', 'order.shippingAddress','order.user', 'confirmedBy'])
            ->where('payment_method', $paymentType);

        if ($status) {
            $query->where('payment_status', $status);
        }

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        if ($search) {
            $query->whereHas('order', function($q) use ($search) {
                $q->where('order_id', 'like', "%{$search}%");
            });
        }

        $payments = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->appends($request->query());

        // Tổng kết số liệu - không tính các thanh toán đã hủy (cancelled)
        $summaryQuery = clone $query;
        $summaryQuery->where('payment_status', '!=', 'cancelled');

        // Tổng số tiền đã xác nhận (confirmed)
        $confirmedQuery = clone $summaryQuery;
        $confirmedAmount = $confirmedQuery->where('payment_status', 'confirmed')->sum('amount');

        // Tổng số tiền đang chờ (paid - chờ kế toán xác nhận)
        $pendingQuery = clone $summaryQuery;
        $pendingAmount = $pendingQuery->where('payment_status', 'paid')->sum('amount');

        // Tổng số tiền hôm nay (không bao gồm cancelled)
        $todayQuery = clone $summaryQuery;
        $todayAmount = $todayQuery->whereDate('created_at', today())->sum('amount');

        $summary = [
            'total_amount' => $summaryQuery->sum('amount'),
            'confirmed_amount' => $confirmedAmount,
            'pending_amount' => $pendingAmount,
            'today_amount' => $todayAmount
        ];

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'summary' => $summary,
            'filters' => [
                'type' => $paymentType,
                'status' => $status,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'search' => $search
            ]
        ]);
    }

    public function confirmCodPayment(Request $request, $paymentId)
    {
        $request->validate([
            'note' => 'nullable|string|max:255'
        ]);

        $payment = Payment::findOrFail($paymentId);

        if ($payment->payment_method !== 'cod') {
            return back()->with('error', 'Chỉ có thể xác nhận thanh toán COD');
        }

        // Chỉ có thể xác nhận các thanh toán có trạng thái là "paid" (shipper đã thu tiền)
        if ($payment->payment_status !== 'paid') {
            return back()->with('error', 'Chỉ có thể xác nhận thanh toán có trạng thái "Đã thanh toán"');
        }

        $payment->payment_status = 'confirmed';
        $payment->confirmation_date = now();
        $payment->confirmed_by_user_id = Auth::id();
        $payment->note = $request->note;
        $payment->save();

        return back()->with('success', 'Đã xác nhận thanh toán COD thành công');
    }

    public function rejectCodPayment(Request $request, $paymentId)
    {
        $request->validate([
            'note' => 'required|string|max:255'
        ]);

        $payment = Payment::findOrFail($paymentId);

        if ($payment->payment_method !== 'cod') {
            return back()->with('error', 'Chỉ có thể từ chối thanh toán COD');
        }

        // Chỉ có thể từ chối các thanh toán có trạng thái là "paid"
        if ($payment->payment_status !== 'paid') {
            return back()->with('error', 'Chỉ có thể từ chối thanh toán có trạng thái "Đã thanh toán"');
        }

        $payment->payment_status = 'rejected';
        $payment->confirmation_date = now();
        $payment->confirmed_by_user_id = Auth::id();
        $payment->note = $request->note;
        $payment->save();

        return back()->with('success', 'Đã từ chối thanh toán COD');
    }

    public function verifyVnpayPayment($paymentId)
    {
        $payment = Payment::with('order')->findOrFail($paymentId);

        if ($payment->payment_method !== 'vnpay') {
            return back()->with('error', 'Chỉ có thể xác minh thanh toán VNPay');
        }

        // Ở đây sẽ gọi API của VNPay để xác minh giao dịch
        // Giả lập cho ví dụ
        $vnpayResponse = $this->checkVnpayTransaction($payment->transaction_id);

        if ($vnpayResponse['status'] === 'success') {
            $payment->payment_status = 'confirmed';
            $payment->confirmation_date = now();
            $payment->confirmed_by_user_id = Auth::id();
            $payment->save();

            return back()->with('success', 'Đã xác minh thanh toán VNPay thành công');
        } else {
            return back()->with('error', 'Không thể xác minh thanh toán VNPay: ' . $vnpayResponse['message']);
        }
    }

    public function reconcileVnpay(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Đối soát VNPay - giả lập
        $vnpayTransactions = $this->getVnpayTransactions($request->start_date, $request->end_date);
        $systemTransactions = Payment::where('payment_method', 'vnpay')
            ->whereBetween('created_at', [$request->start_date, $request->end_date])
            ->get()
            ->keyBy('transaction_id')
            ->toArray();

        $matched = [];
        $unmatched = [];
        $missingInSystem = [];

        foreach ($vnpayTransactions as $transaction) {
            if (isset($systemTransactions[$transaction['transaction_id']])) {
                $systemTrans = $systemTransactions[$transaction['transaction_id']];
                if ($systemTrans['amount'] == $transaction['amount']) {
                    $matched[] = $transaction;
                } else {
                    $unmatched[] = [
                        'vnpay' => $transaction,
                        'system' => $systemTrans,
                        'difference' => $transaction['amount'] - $systemTrans['amount']
                    ];
                }
            } else {
                $missingInSystem[] = $transaction;
            }
        }

        // Tìm các giao dịch trong hệ thống nhưng không có trong VNPay
        $missingInVnpay = array_diff_key($systemTransactions, array_flip(array_column($vnpayTransactions, 'transaction_id')));

        return Inertia::render('Payments/Reconcile', [
            'matched' => $matched,
            'unmatched' => $unmatched,
            'missingInSystem' => $missingInSystem,
            'missingInVnpay' => array_values($missingInVnpay),
            'summary' => [
                'matched_count' => count($matched),
                'unmatched_count' => count($unmatched),
                'missing_in_system_count' => count($missingInSystem),
                'missing_in_vnpay_count' => count($missingInVnpay),
                'vnpay_total' => array_sum(array_column($vnpayTransactions, 'amount')),
                'system_total' => array_sum(array_column($systemTransactions, 'amount'))
            ],
            'date_range' => [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date
            ]
        ]);
    }

    public function report(Request $request)
    {
        $period = $request->query('period', 'day');
        $startDate = $request->query('start_date', now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->query('end_date', now()->format('Y-m-d'));

        // Lấy dữ liệu báo cáo theo khoảng thời gian
        $reportData = $this->getReportData($period, $startDate, $endDate);

        return Inertia::render('Admin/Payments/Report', [
            'reportData' => $reportData,
            'filters' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate
            ]
        ]);
    }

    // Các hàm phụ trợ (helpers)
    private function checkVnpayTransaction($transactionId)
    {
        // Giả lập gọi API VNPay
        // Trong thực tế sẽ gọi API của VNPay
        return [
            'status' => 'success',
            'transaction_id' => $transactionId,
            'amount' => 1000000,
            'time' => now()->format('Y-m-d H:i:s')
        ];
    }

    private function getVnpayTransactions($startDate, $endDate)
    {
        // Giả lập dữ liệu từ VNPay API
        // Trong thực tế sẽ gọi API của VNPay
        return [
            [
                'transaction_id' => 'VNPAY123456',
                'order_id' => '100001',
                'amount' => 1000000,
                'time' => now()->subDays(1)->format('Y-m-d H:i:s'),
                'status' => 'success'
            ],
            [
                'transaction_id' => 'VNPAY123457',
                'order_id' => '100002',
                'amount' => 1500000,
                'time' => now()->subDays(2)->format('Y-m-d H:i:s'),
                'status' => 'success'
            ]
        ];
    }

    private function getReportData($period, $startDate, $endDate)
{
    $groupBy = match($period) {
        'day' => 'date(created_at)',
        'week' => 'YEARWEEK(created_at)',
        'month' => 'YEAR(created_at), MONTH(created_at)',
        default => 'date(created_at)'
    };

    $formatPeriod = match($period) {
        'day' => "DATE_FORMAT(created_at, '%Y-%m-%d')",
        'week' => "CONCAT('Tuần ', WEEK(created_at), ' năm ', YEAR(created_at))",
        'month' => "DATE_FORMAT(created_at, '%m-%Y')",
        default => "DATE_FORMAT(created_at, '%Y-%m-%d')"
    };

    $codData = Payment::where('payment_method', 'cod')
        ->where('payment_status', 'confirmed')
        ->whereBetween('created_at', [$startDate, $endDate])
        ->selectRaw("$formatPeriod as period, SUM(amount) as total")
        ->groupBy('period')
        ->orderBy('period')
        ->get();

    $vnpayData = Payment::where('payment_method', 'vnpay')
        ->where('payment_status', 'confirmed')
        ->whereBetween('created_at', [$startDate, $endDate])
        ->selectRaw("$formatPeriod as period, SUM(amount) as total")
        ->groupBy('period')
        ->orderBy('period')
        ->get();

    // Tính toán dữ liệu cho bảng và biểu đồ
    $data = [];
    $periods = array_unique(array_merge(
        $codData->pluck('period')->toArray(),
        $vnpayData->pluck('period')->toArray()
    ));
    sort($periods);

    foreach ($periods as $p) {
        $codTotal = $codData->firstWhere('period', $p)['total'] ?? 0;
        $vnpayTotal = $vnpayData->firstWhere('period', $p)['total'] ?? 0;

        $data[] = [
            'period' => $p,
            'cod_total' => $codTotal,
            'vnpay_total' => $vnpayTotal,
            'grand_total' => $codTotal + $vnpayTotal
        ];
    }

    return [
        'cod' => $codData,
        'vnpay' => $vnpayData,
        'data' => $data,
        'summary' => [
            'cod_total' => $codData->sum('total'),
            'vnpay_total' => $vnpayData->sum('total'),
            'grand_total' => $codData->sum('total') + $vnpayData->sum('total')
        ]
    ];
}
}
