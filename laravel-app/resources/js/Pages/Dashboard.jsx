import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import Breadcrumb from "@/Components/Breadcrumb";
import { Download } from "lucide-react";
import { Button } from "@/Components/ui/button";

import FilterControls from "@/Components/Admin/Dashboard/FilterControls";
import StatsSummary from "@/Components/Admin/Dashboard/StatsSummary";
import RevenueChart from "@/Components/Admin/Dashboard/RevenueChart";
import OrderStatusChart from "@/Components/Admin/Dashboard/OrderStatusChart";
import TopProductsChart from "@/Components/Admin/Dashboard/TopProductsChart";
import LowStockTable from "@/Components/Admin/Dashboard/LowStockTable";
import RecentOrdersTable from "@/Components/Admin/Dashboard/RecentOrdersTable";

export default function Dashboard({ stats }) {
    const [timeFilter, setTimeFilter] = useState("week");
    const [selectedReport, setSelectedReport] = useState("sales");

    // Ensure stats object exists with default values
    const safeStats = stats || {
        totalOrders: 0,
        revenue: 0,
        totalCustomers: 0,
        avgOrderValue: 0,
        orderChange: 0,
        revenueChange: 0,
        customerChange: 0,
        avgOrderChange: 0,
        revenueData: [],
        orderStatusData: [],
        topProducts: [],
        lowStockProducts: [],
        recentOrders: [],
    };

    const filterOptions = [
        { value: "week", label: "Tuần này" },
        { value: "month", label: "Tháng này" },
        { value: "quarter", label: "Quý này" },
        { value: "year", label: "Năm nay" },
    ];

    const reportOptions = [
        { value: "sales", label: "Tổng quan bán hàng" },
        { value: "products", label: "Hiệu suất sản phẩm" },
        { value: "inventory", label: "Trạng thái tồn kho" },
        { value: "customers", label: "Phân tích khách hàng" },
    ];

    const breadcrumbItems = [{ label: "Dashboard", href: "/admin/dashboard" }];

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="container mx-auto py-4 px-2 sm:px-4 w-full max-w-full overflow-hidden">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Admin Dashboard
                    </h1>

                    <FilterControls
                        timeFilter={timeFilter}
                        setTimeFilter={setTimeFilter}
                        selectedReport={selectedReport}
                        setSelectedReport={setSelectedReport}
                        filterOptions={filterOptions}
                        reportOptions={reportOptions}
                    />
                </div>

                {/* Stats Summary Cards */}
                <StatsSummary stats={safeStats} />

                {/* Main Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow w-full overflow-hidden">
                        <RevenueChart revenueData={safeStats.revenueData || []} />
                    </div>
                    <div className="bg-white rounded-lg shadow w-full overflow-hidden">
                        <OrderStatusChart orderStatusData={safeStats.orderStatusData || []} />
                    </div>
                </div>

                {/* Product Performance & Inventory */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow w-full overflow-hidden">
                        <TopProductsChart topProducts={safeStats.topProducts || []} />
                    </div>
                    <div className="bg-white rounded-lg shadow w-full overflow-hidden">
                        <LowStockTable lowStockProducts={safeStats.lowStockProducts || []} />
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow w-full overflow-x-auto">
                    <RecentOrdersTable recentOrders={safeStats.recentOrders || []} />
                </div>
            </div>
        </AdminLayout>
    );
}
