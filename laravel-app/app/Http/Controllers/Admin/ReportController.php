<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;

class ReportController extends Controller
{
    public function index()
    {
        $reportTypes = [
            ['value' => 'sales', 'label' => 'Sales Report'],
            ['value' => 'revenue', 'label' => 'Revenue Report'],
            ['value' => 'products', 'label' => 'Product Performance'],
            ['value' => 'categories', 'label' => 'Category Analysis'],
            ['value' => 'customers', 'label' => 'Customer Analysis'],
            ['value' => 'inventory', 'label' => 'Inventory Status'],
        ];

        // Get initial data
        $initialData = $this->getSalesReportData('month', 'day');

        return Inertia::render('Admin/Reports', [
            'reportTypes' => $reportTypes,
            'initialData' => $initialData,
        ]);
    }

    public function getReportData(Request $request)
    {
        $type = $request->input('type', 'sales');
        $range = $request->input('range', 'month');
        $groupBy = $request->input('groupBy', 'day');
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');

        switch ($type) {
            case 'sales':
                return $this->getSalesReportData($range, $groupBy, $startDate, $endDate);
            case 'revenue':
                return $this->getRevenueReportData($range, $groupBy, $startDate, $endDate);
            case 'products':
                return $this->getProductReportData($range, $groupBy, $startDate, $endDate);
            case 'categories':
                return $this->getCategoryReportData($range, $groupBy, $startDate, $endDate);
            case 'customers':
                return $this->getCustomerReportData($range, $groupBy, $startDate, $endDate);
            case 'inventory':
                return $this->getInventoryReportData();
            default:
                return [];
        }
    }

    public function downloadReport(Request $request)
    {
        $type = $request->input('type', 'sales');
        $range = $request->input('range', 'month');
        $groupBy = $request->input('groupBy', 'day');
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');
        $format = $request->input('format', 'csv');

        $data = $this->getReportData($request);

        if ($format === 'csv') {
            return $this->generateCsv($data, $type);
        } else {
            return $this->generatePdf($data, $type);
        }
    }

    private function getDateRange($range, $startDate = null, $endDate = null)
    {
        if ($range === 'custom' && $startDate && $endDate) {
            return [Carbon::parse($startDate), Carbon::parse($endDate)];
        }

        switch ($range) {
            case 'today':
                return [Carbon::today(), Carbon::today()];
            case 'yesterday':
                return [Carbon::yesterday(), Carbon::yesterday()];
            case 'week':
                return [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()];
            case 'month':
                return [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];
            case 'quarter':
                return [Carbon::now()->startOfQuarter(), Carbon::now()->endOfQuarter()];
            case 'year':
                return [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()];
            default:
                return [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];
        }
    }

    private function getDateFormat($groupBy)
    {
        switch ($groupBy) {
            case 'day':
                return '%Y-%m-%d';
            case 'week':
                return '%x-W%v';
            case 'month':
                return '%Y-%m';
            case 'quarter':
                return '%Y-Q%q';
            case 'year':
                return '%Y';
            default:
                return '%Y-%m-%d';
        }
    }

    private function getPhpDateFormat($groupBy)
    {
        switch ($groupBy) {
            case 'day':
                return 'Y-m-d';
            case 'week':
                return 'Y-\WW';
            case 'month':
                return 'Y-m';
            case 'quarter':
                return 'Y-\QQ';
            case 'year':
                return 'Y';
            default:
                return 'Y-m-d';
        }
    }

    private function getGroupByInterval($groupBy)
    {
        switch ($groupBy) {
            case 'day':
                return new \DateInterval('P1D');
            case 'week':
                return new \DateInterval('P1W');
            case 'month':
                return new \DateInterval('P1M');
            case 'quarter':
                return new \DateInterval('P3M');
            case 'year':
                return new \DateInterval('P1Y');
            default:
                return new \DateInterval('P1D');
        }
    }

    private function getSalesReportData($range, $groupBy, $startDate = null, $endDate = null)
    {
        [$start, $end] = $this->getDateRange($range, $startDate, $endDate);

        $dateFormat = $this->getDateFormat($groupBy);
        $interval = $this->getGroupByInterval($groupBy);

        $results = Order::whereBetween('order_date', [$start, $end])
            ->select(
                DB::raw("DATE_FORMAT(order_date, '{$dateFormat}') as label"),
                DB::raw('COUNT(*) as value')
            )
            ->groupBy('label')
            ->orderBy('order_date')
            ->get()
            ->toArray();

        // Fill in missing dates
        $completeResults = [];
        $current = clone $start;

        while ($current <= $end) {
            $formattedDate = $current->format($this->getPhpDateFormat($groupBy));
            $found = false;

            foreach ($results as $result) {
                if ($result['label'] === $formattedDate) {
                    $completeResults[] = $result;
                    $found = true;
                    break;
                }
            }

            if (!$found) {
                $completeResults[] = [
                    'label' => $formattedDate,
                    'value' => 0
                ];
            }

            $current->add($interval);
        }

        return $completeResults;
    }

    private function getRevenueReportData($range, $groupBy, $startDate = null, $endDate = null)
    {
        [$start, $end] = $this->getDateRange($range, $startDate, $endDate);

        $dateFormat = $this->getDateFormat($groupBy);
        $interval = $this->getGroupByInterval($groupBy);

        $results = Payment::whereBetween('payment_date', [$start, $end])
            ->select(
                DB::raw("DATE_FORMAT(payment_date, '{$dateFormat}') as label"),
                DB::raw('SUM(amount) as value')
            )
            ->groupBy('label')
            ->orderBy('payment_date')
            ->get()
            ->toArray();

        // Fill in missing dates
        $completeResults = [];
        $current = clone $start;

        while ($current <= $end) {
            $formattedDate = $current->format($this->getPhpDateFormat($groupBy));
            $found = false;

            foreach ($results as $result) {
                if ($result['label'] === $formattedDate) {
                    $completeResults[] = $result;
                    $found = true;
                    break;
                }
            }

            if (!$found) {
                $completeResults[] = [
                    'label' => $formattedDate,
                    'value' => 0
                ];
            }

            $current->add($interval);
        }

        return $completeResults;
    }

    private function getProductReportData($range, $groupBy, $startDate = null, $endDate = null)
    {
        [$start, $end] = $this->getDateRange($range, $startDate, $endDate);

        return OrderDetail::join('orders', 'order_details.order_id', '=', 'orders.order_id')
            ->join('products', 'order_details.product_id', '=', 'products.product_id')
            ->whereBetween('orders.order_date', [$start, $end])
            ->select(
                'products.name as label',
                DB::raw('SUM(order_details.quantity) as value')
            )
            ->groupBy('products.product_id', 'products.name')
            ->orderByDesc('value')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function getCategoryReportData($range, $groupBy, $startDate = null, $endDate = null)
    {
        [$start, $end] = $this->getDateRange($range, $startDate, $endDate);

        return OrderDetail::join('orders', 'order_details.order_id', '=', 'orders.order_id')
            ->join('products', 'order_details.product_id', '=', 'products.product_id')
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->whereBetween('orders.order_date', [$start, $end])
            ->select(
                'categories.name as label',
                DB::raw('SUM(order_details.quantity) as value')
            )
            ->groupBy('categories.category_id', 'categories.name')
            ->orderByDesc('value')
            ->get()
            ->toArray();
    }

    private function getCustomerReportData($range, $groupBy, $startDate = null, $endDate = null)
    {
        [$start, $end] = $this->getDateRange($range, $startDate, $endDate);

        return Order::join('users', 'orders.user_id', '=', 'users.user_id')
            ->whereBetween('orders.order_date', [$start, $end])
            ->select(
                DB::raw("CONCAT(users.first_name, ' ', users.last_name) as label"),
                DB::raw('COUNT(orders.order_id) as value')
            )
            ->groupBy('users.user_id', 'users.first_name', 'users.last_name')
            ->orderByDesc('value')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function getInventoryReportData()
    {
        return Product::join('categories', 'products.category_id', '=', 'categories.category_id')
            ->select(
                'products.name as name',
                'products.sku as sku',
                'categories.name as category',
                'products.stock_quantity as stock',
                'products.min_purchase_quantity as min_stock',
                DB::raw('(products.stock_quantity - products.min_purchase_quantity) as margin')
            )
            ->orderBy('margin')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'sku' => $item->sku,
                    'category' => $item->category,
                    'stock' => $item->stock,
                    'min_stock' => $item->min_stock,
                    'margin' => $item->margin,
                    'status' => $item->margin <= 0 ? 'Critical' : ($item->margin <= 5 ? 'Low' : 'Good')
                ];
            })
            ->toArray();
    }

    private function generateCsv($data, $reportType)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $reportType . '_report_' . date('Y-m-d') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');

            // Add headers
            if (!empty($data)) {
                fputcsv($file, array_keys($data[0]));
            }

            // Add rows
            foreach ($data as $row) {
                fputcsv($file, $row);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    private function generatePdf($data, $reportType)
    {
        // Implementation would depend on your PDF library
        // This is a placeholder for the PDF generation logic
        $pdf = app('dompdf.wrapper');

        $html = '<html><body>';
        $html .= '<h1>' . ucfirst($reportType) . ' Report</h1>';
        $html .= '<p>Generated on: ' . date('Y-m-d H:i:s') . '</p>';

        $html .= '<table border="1" cellpadding="5" cellspacing="0" width="100%">';

        // Add headers
        if (!empty($data)) {
            $html .= '<tr>';
            foreach (array_keys($data[0]) as $header) {
                $html .= '<th>' . ucfirst($header) . '</th>';
            }
            $html .= '</tr>';
        }

        // Add rows
        foreach ($data as $row) {
            $html .= '<tr>';
            foreach ($row as $value) {
                $html .= '<td>' . $value . '</td>';
            }
            $html .= '</tr>';
        }

        $html .= '</table>';
        $html .= '</body></html>';

        $pdf->loadHTML($html);

        return $pdf->download($reportType . '_report_' . date('Y-m-d') . '.pdf');
    }
}
