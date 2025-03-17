<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\OrderDetail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Get dashboard statistics
        $stats = [
            'totalOrders' => $this->getTotalOrders(),
            'revenue' => $this->getRevenue(),
            'totalCustomers' => $this->getTotalCustomers(),
            'avgOrderValue' => $this->getAverageOrderValue(),
            'orderChange' => $this->getOrderChange(),
            'revenueChange' => $this->getRevenueChange(),
            'customerChange' => $this->getCustomerChange(),
            'avgOrderChange' => $this->getAvgOrderChange(),
            'revenueData' => $this->getRevenueData(),
            'orderStatusData' => $this->getOrderStatusData(),
            'topProducts' => $this->getTopProducts(),
            'lowStockProducts' => $this->getLowStockProducts(),
            'recentOrders' => $this->getRecentOrders(),
        ];
        return Inertia::render('Dashboard', [
            'stats' => $stats,
        ]);
    }

    private function getTotalOrders()
    {
        return Order::whereMonth('order_date', Carbon::now()->month)->count();
    }

    private function getRevenue()
    {
        return Order::whereMonth('order_date', Carbon::now()->month)
            ->sum('total_amount');
    }

    private function getTotalCustomers()
    {
        return User::whereMonth('created_at', Carbon::now()->month)->count();
    }

    private function getAverageOrderValue()
    {
        $totalOrders = $this->getTotalOrders();
        if ($totalOrders === 0) {
            return 0;
        }
        return round($this->getRevenue() / $totalOrders, 2);
    }

    private function getOrderChange()
    {
        $currentMonth = Order::whereMonth('order_date', Carbon::now()->month)->count();
        $lastMonth = Order::whereMonth('order_date', Carbon::now()->subMonth()->month)->count();

        if ($lastMonth === 0) {
            return 100;
        }

        return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 2);
    }

    private function getRevenueChange()
    {
        $currentMonth = Order::whereMonth('order_date', Carbon::now()->month)->sum('total_amount');
        $lastMonth = Order::whereMonth('order_date', Carbon::now()->subMonth()->month)->sum('total_amount');

        if ($lastMonth === 0) {
            return 100;
        }

        return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 2);
    }

    private function getCustomerChange()
    {
        $currentMonth = User::whereMonth('created_at', Carbon::now()->month)->count();
        $lastMonth = User::whereMonth('created_at', Carbon::now()->subMonth()->month)->count();

        if ($lastMonth === 0) {
            return 100;
        }

        return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 2);
    }

    private function getAvgOrderChange()
    {
        $currentAvg = $this->getAverageOrderValue();

        $lastMonthOrders = Order::whereMonth('order_date', Carbon::now()->subMonth()->month)->count();
        $lastMonthRevenue = Order::whereMonth('order_date', Carbon::now()->subMonth()->month)->sum('total_amount');

        if ($lastMonthOrders === 0) {
            return 100;
        }

        $lastMonthAvg = $lastMonthRevenue / $lastMonthOrders;

        return round((($currentAvg - $lastMonthAvg) / $lastMonthAvg) * 100, 2);
    }

    private function getRevenueData()
    {
        $days = [];
        $startDate = Carbon::now()->startOfMonth();
        $endDate = Carbon::now()->endOfMonth();

        for ($date = $startDate; $date->lte($endDate); $date->addDay()) {
            $days[] = $date->format('Y-m-d');
        }

        $revenueByDay = Order::whereMonth('order_date', Carbon::now()->month)
            ->select(DB::raw('DATE(order_date) as date'), DB::raw('SUM(total_amount) as value'))
            ->groupBy('date')
            ->pluck('value', 'date')
            ->toArray();

        $result = [];
        foreach ($days as $day) {
            $result[] = [
                'date' => Carbon::parse($day)->format('d M'),
                'value' => $revenueByDay[$day] ?? 0
            ];
        }

        return $result;
    }

    private function getOrderStatusData()
    {
        $statusCounts = Order::select('order_status as name', DB::raw('count(*) as value'))
            ->groupBy('order_status')
            ->get()
            ->toArray();

        return $statusCounts;
    }

    private function getTopProducts()
    {
        return OrderDetail::select('variant_id', DB::raw('SUM(quantity) as value'))
            ->with('variant.product')
            ->groupBy('variant_id')
            ->orderByDesc('value')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                $productName = $item->variant && $item->variant->product
                    ? $item->variant->product->name
                    : 'Unknown Product';

                return [
                    'name' => $productName,
                    'value' => $item->value
                ];
            })
            ->toArray();
    }

    private function getLowStockProducts()
    {
        return Product::select(
                'products.product_id',
                'products.name',
                'products.stock_quantity as stock',
                'categories.name as category'
            )
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->whereRaw('products.stock_quantity <= products.min_purchase_quantity')
            ->orderBy('products.stock_quantity')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function getRecentOrders()
    {
        return Order::with('user')
            ->orderByDesc('order_date')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->order_id,
                    'customer' => $order->user ? $order->user->name : 'Guest',
                    'date' => Carbon::parse($order->order_date)->format('d M Y'),
                    'total' => $order->total_amount,
                    'status' => $order->order_status
                ];
            })
            ->toArray();
    }
}
