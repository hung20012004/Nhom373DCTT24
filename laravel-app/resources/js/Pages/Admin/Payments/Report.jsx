import React, { useState, useEffect } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import Breadcrumb from '@/Components/Breadcrumb';
import { ArrowUpDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Report({ reportData, filters }) {
    const { flash } = usePage().props;
    const [filterForm, setFilterForm] = useState({
        period: filters?.period || 'day',
        start_date: filters?.start_date || '',
        end_date: filters?.end_date || '',
    });
    const [loading, setLoading] = useState(false);

    const formatCurrency = (amount, locale = 'vi-VN', currency = 'VND') => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleFilterChange = (e) => {
        setFilterForm({
            ...filterForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        router.get(route('admin.payments.report'), filterForm);
    };

    const breadcrumbItems = [
        { label: 'Quản lý', href: '/admin' },
        { label: 'Thanh toán', href: '/admin/payments' },
        { label: 'Báo cáo', href: '/admin/payments/report' }
    ];

    // Chuyển đổi dữ liệu để hiển thị trên biểu đồ
    const processDataForChart = () => {
        if (!reportData || !reportData.cod || !reportData.vnpay) {
            return [];
        }

        // Tạo một đối tượng để lưu trữ dữ liệu theo kỳ báo cáo
        const periodData = {};

        // Xử lý dữ liệu COD
        reportData.cod.forEach(item => {
            if (!periodData[item.period]) {
                periodData[item.period] = { name: formatPeriodLabel(item.period), cod: 0, vnpay: 0, total: 0 };
            }
            periodData[item.period].cod = parseFloat(item.total || 0);
            periodData[item.period].total += parseFloat(item.total || 0);
        });

        // Xử lý dữ liệu VNPay
        reportData.vnpay.forEach(item => {
            if (!periodData[item.period]) {
                periodData[item.period] = { name: formatPeriodLabel(item.period), cod: 0, vnpay: 0, total: 0 };
            }
            periodData[item.period].vnpay = parseFloat(item.total || 0);
            periodData[item.period].total += parseFloat(item.total || 0);
        });

        // Chuyển đổi đối tượng thành mảng để hiển thị trên biểu đồ
        return Object.values(periodData).sort((a, b) => a.name.localeCompare(b.name));
    };

    // Hàm định dạng nhãn kỳ báo cáo
    const formatPeriodLabel = (period) => {
        // Tùy thuộc vào định dạng của period từ backend, bạn có thể cần điều chỉnh hàm này
        // Ví dụ nếu period là "2023-03-15" thì có thể để nguyên
        // Nếu period là "202303" (năm-tháng) thì có thể định dạng thành "03/2023"
        return period;
    };

    const chartData = processDataForChart();

    const SortableHeader = ({ field, children }) => (
        <TableHead
            className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
            <div className="flex items-center space-x-1">
                <span>{children}</span>
            </div>
        </TableHead>
    );

    const renderPagination = () => {
        if (!reportData?.links || reportData.links.length <= 3) return null;

        return reportData.links.map((link, index) => {
            if (index === 0 || index === reportData.links.length - 1) {
                // Skip "Previous" and "Next" links if they're disabled, otherwise render them
                if (!link.url) return null;

                return (
                    <Button
                        key={index}
                        variant="outline"
                        className="w-auto h-10"
                        onClick={() => router.get(link.url)}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            }

            return (
                <div key={index}>
                    {link.url ? (
                        <Button
                            variant={link.active ? "default" : "outline"}
                            className="w-auto h-10"
                            onClick={() => router.get(link.url)}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            className="px-3 py-2 text-gray-400"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )}
                </div>
            );
        });
    };

    return (
        <AdminLayout>
            <Head title="Báo cáo thanh toán" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Báo cáo thanh toán</h1>
                    <div className="flex space-x-2">
                        <Link href={route('admin.payments.index')}>
                            <Button variant="outline" className="border-gray-600 text-gray-600 hover:bg-gray-50">
                                Quay lại
                            </Button>
                        </Link>
                    </div>
                </div>

                {flash && flash.success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {flash.success}
                    </div>
                )}
                {flash && flash.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {flash.error}
                    </div>
                )}

                {/* Filter Form */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6 mb-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ báo cáo</label>
                                <select
                                    name="period"
                                    value={filterForm.period}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                >
                                    <option value="day">Theo ngày</option>
                                    <option value="week">Theo tuần</option>
                                    <option value="month">Theo tháng</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                                <Input
                                    type="date"
                                    name="start_date"
                                    value={filterForm.start_date}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                                <Input
                                    type="date"
                                    name="end_date"
                                    value={filterForm.end_date}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Đang tìm...
                                        </div>
                                    ) : 'Tìm kiếm'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Tổng COD</h3>
                        <p className="mt-1 text-2xl font-semibold text-orange-600">
                            {formatCurrency(reportData?.summary?.cod_total || 0)}
                        </p>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Tổng VNPay</h3>
                        <p className="mt-1 text-2xl font-semibold text-blue-600">
                            {formatCurrency(reportData?.summary?.vnpay_total || 0)}
                        </p>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Tổng doanh thu</h3>
                        <p className="mt-1 text-2xl font-semibold text-green-600">
                            {formatCurrency(reportData?.summary?.grand_total || 0)}
                        </p>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Biểu đồ doanh thu</h2>
                    <div style={{ width: '100%', height: 400 }}>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer>
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="cod"
                                        name="COD"
                                        stroke="#F97316"
                                        activeDot={{ r: 8 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="vnpay"
                                        name="VNPay"
                                        stroke="#2563EB"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        name="Tổng"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <SortableHeader field="period">Kỳ báo cáo</SortableHeader>
                                    <SortableHeader field="cod">COD</SortableHeader>
                                    <SortableHeader field="vnpay">VNPay</SortableHeader>
                                    <SortableHeader field="total">Tổng</SortableHeader>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (!chartData || chartData.length === 0) ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                                            Không có dữ liệu báo cáo
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    chartData.map((item, index) => (
                                        <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {item.name}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {formatCurrency(item.cod)}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {formatCurrency(item.vnpay)}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium">
                                                {formatCurrency(item.total)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {reportData?.links && reportData.links.length > 3 && (
                        <div className="flex justify-between items-center p-4 border-t">
                            <div className="text-sm text-gray-600">
                                Hiển thị {reportData.from || 0} đến {reportData.to || 0} trên {reportData.total} kết quả
                            </div>
                            <div className="flex gap-2">
                                {renderPagination()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
