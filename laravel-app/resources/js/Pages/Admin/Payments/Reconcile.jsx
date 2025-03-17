// resources/js/Pages/Payments/Reconcile.jsx
import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
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

export default function Reconcile({ matched, unmatched, missingInSystem, missingInVnpay, summary, date_range }) {
    const { data, setData, post, processing, errors } = useForm({
        start_date: date_range?.start_date || '',
        end_date: date_range?.end_date || '',
    });

    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.payments.reconcile-vnpay.process'));
    };

    const breadcrumbItems = [
        { label: 'Quản lý', href: '/admin' },
        { label: 'Thanh toán', href: '/admin/payments' },
        { label: 'Đối soát VNPay', href: '/admin/payments/reconcile-vnpay' }
    ];

    return (
        <AdminLayout>
            <Head title="Đối soát VNPay" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Đối soát VNPay</h1>
                </div>

                {/* Filter Form */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                                <Input
                                    type="date"
                                    name="start_date"
                                    value={data.start_date}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                                <Input
                                    type="date"
                                    name="end_date"
                                    value={data.end_date}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Đang xử lý...' : 'Đối soát'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900">Khớp</h3>
                            <p className="mt-1 text-2xl font-semibold text-green-600">
                                {summary.matched_count}
                            </p>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900">Không khớp</h3>
                            <p className="mt-1 text-2xl font-semibold text-red-600">
                                {summary.unmatched_count}
                            </p>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900">Thiếu trong hệ thống</h3>
                            <p className="mt-1 text-2xl font-semibold text-yellow-600">
                                {summary.missing_in_system_count}
                            </p>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900">Thiếu trong VNPay</h3>
                            <p className="mt-1 text-2xl font-semibold text-blue-600">
                                {summary.missing_in_vnpay_count}
                            </p>
                        </div>
                    </div>
                )}

                {/* Matched Transactions */}
                {matched && matched.length > 0 && (
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg mb-6">
                       <div className="p-4 border-b">
                            <h2 className="text-xl font-medium text-gray-900">Giao dịch khớp ({matched.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã giao dịch</TableHead>
                                        <TableHead>Mã đơn hàng</TableHead>
                                        <TableHead>Số tiền</TableHead>
                                        <TableHead>Thời gian</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {matched.map((item, index) => (
                                        <TableRow key={index} className="bg-green-50">
                                            <TableCell>{item.transaction_id}</TableCell>
                                            <TableCell>{item.order_id}</TableCell>
                                            <TableCell>{formatCurrency(item.amount)}</TableCell>
                                            <TableCell>{item.time}</TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {item.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Unmatched Transactions */}
                {unmatched && unmatched.length > 0 && (
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg mb-6">
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-medium text-gray-900">Giao dịch không khớp ({unmatched.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã giao dịch</TableHead>
                                        <TableHead>Mã đơn hàng</TableHead>
                                        <TableHead>Số tiền VNPay</TableHead>
                                        <TableHead>Số tiền hệ thống</TableHead>
                                        <TableHead>Chênh lệch</TableHead>
                                        <TableHead>Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {unmatched.map((item, index) => (
                                        <TableRow key={index} className="bg-red-50">
                                            <TableCell>{item.vnpay.transaction_id}</TableCell>
                                            <TableCell>{item.vnpay.order_id}</TableCell>
                                            <TableCell>{formatCurrency(item.vnpay.amount)}</TableCell>
                                            <TableCell>{formatCurrency(item.system.amount)}</TableCell>
                                            <TableCell className={item.difference > 0 ? "text-red-600" : "text-green-600"}>
                                                {formatCurrency(item.difference)}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" className="text-blue-600 border-blue-600">
                                                    Cập nhật
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Missing in System */}
                {missingInSystem && missingInSystem.length > 0 && (
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg mb-6">
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-medium text-gray-900">Giao dịch thiếu trong hệ thống ({missingInSystem.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã giao dịch</TableHead>
                                        <TableHead>Mã đơn hàng</TableHead>
                                        <TableHead>Số tiền</TableHead>
                                        <TableHead>Thời gian</TableHead>
                                        <TableHead>Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {missingInSystem.map((item, index) => (
                                        <TableRow key={index} className="bg-yellow-50">
                                            <TableCell>{item.transaction_id}</TableCell>
                                            <TableCell>{item.order_id}</TableCell>
                                            <TableCell>{formatCurrency(item.amount)}</TableCell>
                                            <TableCell>{item.time}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" className="text-green-600 border-green-600">
                                                    Thêm vào hệ thống
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Missing in VNPay */}
                {missingInVnpay && missingInVnpay.length > 0 && (
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-medium text-gray-900">Giao dịch thiếu trong VNPay ({missingInVnpay.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã giao dịch</TableHead>
                                        <TableHead>Mã đơn hàng</TableHead>
                                        <TableHead>Số tiền</TableHead>
                                        <TableHead>Thời gian</TableHead>
                                        <TableHead>Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {missingInVnpay.map((item, index) => (
                                        <TableRow key={index} className="bg-blue-50">
                                            <TableCell>{item.transaction_id}</TableCell>
                                            <TableCell>{item.order?.order_id || 'N/A'}</TableCell>
                                            <TableCell>{formatCurrency(item.amount)}</TableCell>
                                            <TableCell>{new Date(item.created_at).toLocaleString('vi-VN')}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                                                    Kiểm tra
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {!matched && !unmatched && !missingInSystem && !missingInVnpay && (
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6 text-center">
                        <p className="text-gray-500">Vui lòng chọn khoảng thời gian và nhấn "Đối soát" để bắt đầu.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
