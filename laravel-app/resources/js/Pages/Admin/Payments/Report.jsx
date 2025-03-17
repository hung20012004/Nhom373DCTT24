// resources/js/Pages/Payments/Report.jsx
import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
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
import { formatCurrency } from '@/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Report({ reportData, filters }) {
    const [filterForm, setFilterForm] = useState({
        period: filters.period || 'day',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });

    const handleFilterChange = (e) => {
        setFilterForm({
            ...filterForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        Inertia.get(route('admin.payments.report'), filterForm);
    };

    const breadcrumbItems = [
        { label: 'Quản lý', href: '/admin' },
        { label: 'Thanh toán', href: '/admin/payments' },
        { label: 'Báo cáo', href: '/admin/payments/report' }
    ];

    // Transform data for chart
    const chartData = [];

    // Logic to transform data for chart here
    // This would need to be adjusted based on your actual data structure

    return (
        <AdminLayout>
            <Head title="Báo cáo thanh toán" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Báo cáo thanh toán</h1>
                </div>

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
                                <Button type="submit" className="w-full">
                                    Tìm kiếm
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
                            {formatCurrency(reportData.summary.cod_total)}
                        </p>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Tổng VNPay</h3>
                        <p className="mt-1 text-2xl font-semibold text-blue-600">
                            {formatCurrency(reportData.summary.vnpay_total)}
                        </p>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Tổng doanh thu</h3>
                        <p className="mt-1 text-2xl font-semibold text-green-600">
                            {formatCurrency(reportData.summary.grand_total)}
                        </p>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Biểu đồ doanh thu</h2>
                    <div style={{ width: '100%', height: 400 }}>
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
                                <Line type="monotone" dataKey="cod" name="COD" stroke="#F97316" activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="vnpay" name="VNPay" stroke="#2563EB" />
                                <Line type="monotone" dataKey="total" name="Tổng" stroke="#10B981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kỳ báo cáo</TableHead>
                                    <TableHead>COD</TableHead>
                                    <TableHead>VNPay</TableHead>
                                    <TableHead>Tổng</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {chartData.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{formatCurrency(item.cod)}</TableCell>
                                        <TableCell>{formatCurrency(item.vnpay)}</TableCell>
                                        <TableCell className="font-medium">{formatCurrency(item.total)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
