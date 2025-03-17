import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import {
    BarChart,
    LineChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Bar,
    Line,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import Breadcrumb from "@/Components/Breadcrumb";
import { ArrowDownUp, Download } from "lucide-react";

export default function Dashboard({ stats }) {
    console.log("Dashboard stats:", stats);
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

    const colors = [
        "#0088FE",
        "#00C49F",
        "#FFBB28",
        "#FF8042",
        "#8884d8",
        "#82ca9d",
    ];

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
    function getStatusText(status) {
        const statusMap = {
            new: "Mới",
            processing: "Đang xử lý",
            confirmed: "Đã xác nhận",
            preparing: "Đang chuẩn bị",
            packed: "Đã đóng gói",
            shipping: "Đang giao hàng",
            delivered: "Đã giao hàng",
            cancelled: "Đã hủy",
        };

        return statusMap[status] || status;
    }
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Admin Dashboard
                    </h1>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="rounded-md border-gray-300 py-2 px-3 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            {filterOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedReport}
                            onChange={(e) => setSelectedReport(e.target.value)}
                            className="rounded-md border-gray-300 py-2 px-3 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            {reportOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <Button className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Xuất báo cáo
                        </Button>
                    </div>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <StatCard
                        title="Tổng đơn hàng"
                        value={safeStats.totalOrders || 0}
                        change={safeStats.orderChange || 0}
                        icon="📦"
                    />
                    <StatCard
                        title="Doanh thu"
                        value={`${(safeStats.revenue || 0).toLocaleString()} ₫`}
                        change={safeStats.revenueChange || 0}
                        icon="💰"
                    />
                    <StatCard
                        title="Khách hàng"
                        value={safeStats.totalCustomers || 0}
                        change={safeStats.customerChange || 0}
                        icon="👥"
                    />
                    <StatCard
                        title="Giá trị đơn hàng TB"
                        value={`${(
                            safeStats.avgOrderValue || 0
                        ).toLocaleString()} ₫`}
                        change={safeStats.avgOrderChange || 0}
                        icon="📊"
                    />
                </div>

                {/* Main Charts Section */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
                    {/* Revenue Over Time */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Doanh thu theo thời gian
                        </h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={safeStats.revenueData || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        name="Doanh thu"
                                        stroke="#8884d8"
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Order Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Trạng thái đơn hàng
                        </h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={safeStats.orderStatusData || []}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) =>
                                            `${name}: ${(percent * 100).toFixed(
                                                0
                                            )}%`
                                        }
                                    >
                                        {(safeStats.orderStatusData || []).map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        colors[
                                                            index %
                                                                colors.length
                                                        ]
                                                    }
                                                />
                                            )
                                        )}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Product Performance & Inventory */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
                    {/* Top Products */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Sản phẩm bán chạy
                        </h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={safeStats.topProducts || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        dataKey="value"
                                        name="Số lượng bán"
                                        fill="#82ca9d"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Inventory Alerts */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Cảnh báo hàng tồn kho thấp
                        </h2>
                        <div className="overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sản phẩm
                                        </TableHead>
                                        <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Danh mục
                                        </TableHead>
                                        <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tồn kho
                                        </TableHead>
                                        <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(safeStats.lowStockProducts || [])
                                        .length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center py-4 text-gray-500"
                                            >
                                                Không có sản phẩm nào sắp hết
                                                hàng
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (safeStats.lowStockProducts || []).map(
                                            (product, index) => (
                                                <TableRow
                                                    key={index}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                        {product.name}
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                        {product.category}
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                        {product.stock}
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6 text-sm">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                            Hàng sắp hết
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            Đơn hàng gần đây
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mã đơn hàng
                                    </TableHead>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Khách hàng
                                    </TableHead>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày đặt
                                    </TableHead>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng tiền
                                    </TableHead>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </TableHead>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hành động
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(safeStats.recentOrders || []).length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-4 text-gray-500"
                                        >
                                            Không có đơn hàng gần đây
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    (safeStats.recentOrders || []).map(
                                        (order, index) => (
                                            <TableRow
                                                key={index}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                    #{order.id}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                    {order.customer}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                    {order.date}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                    {order.total.toLocaleString()}{" "}
                                                    ₫
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-sm">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            order.status ===
                                                            "delivered"
                                                                ? "bg-green-100 text-green-800"
                                                                : order.status ===
                                                                      "processing" ||
                                                                  order.status ===
                                                                      "confirmed"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : order.status ===
                                                                  "shipping"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : order.status ===
                                                                  "cancelled"
                                                                ? "bg-red-100 text-red-800"
                                                                : order.status ===
                                                                  "new"
                                                                ? "bg-purple-100 text-purple-800"
                                                                : order.status ===
                                                                      "preparing" ||
                                                                  order.status ===
                                                                      "packed"
                                                                ? "bg-indigo-100 text-indigo-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        {getStatusText(
                                                            order.status
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-sm">
                                                    <Button
                                                        variant="outline"
                                                        className="text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700"
                                                    >
                                                        Xem
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// Helper function to translate status to Vietnamese
function getStatusText(status) {
    const statusMap = {
        completed: "Hoàn thành",
        processing: "Đang xử lý",
        shipped: "Đã giao hàng",
        pending: "Chờ xử lý",
        cancelled: "Đã hủy",
    };

    return statusMap[status] || status;
}

function StatCard({ title, value, change, icon }) {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="text-2xl">{icon}</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd>
                                <div className="text-lg font-medium text-gray-900">
                                    {value}
                                </div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                    <span
                        className={`font-medium ${
                            change > 0
                                ? "text-green-600"
                                : change < 0
                                ? "text-red-600"
                                : "text-gray-900"
                        }`}
                    >
                        {change > 0 ? "↑" : change < 0 ? "↓" : ""}{" "}
                        {Math.abs(change)}%
                    </span>
                    <span className="text-gray-500"> so với kỳ trước</span>
                </div>
            </div>
        </div>
    );
}
