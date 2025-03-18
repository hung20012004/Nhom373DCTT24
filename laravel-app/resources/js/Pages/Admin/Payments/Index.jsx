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
import OrderDialog from '@/Pages/Admin/Orders/OrderDialog';

export default function Index({ payments, summary, filters }) {
    const { flash } = usePage().props;
    const [filterForm, setFilterForm] = useState({
        type: filters?.type || 'cod',
        status: filters?.status || '',
        start_date: filters?.start_date || '',
        end_date: filters?.end_date || '',
        search: filters?.search || '',
    });
    const [loading, setLoading] = useState(false);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');

    // Add state for the dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

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
        router.get(route('admin.payments.index'), {
            ...filterForm,
            sort_field: sortField,
            sort_direction: sortDirection
        });
    };

    const handleSort = (field) => {
        if (sortField === field) {
            const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            setSortDirection(newDirection);
            router.get(route('admin.payments.index'), {
                ...filterForm,
                sort_field: field,
                sort_direction: newDirection
            });
        } else {
            setSortField(field);
            setSortDirection('asc');
            router.get(route('admin.payments.index'), {
                ...filterForm,
                sort_field: field,
                sort_direction: 'asc'
            });
        }
    };

    const handleConfirmPayment = (paymentId) => {
        const note = prompt('Nhập ghi chú xác nhận thanh toán (nếu có):');
        router.post(route('admin.payments.confirm-cod', { paymentId: paymentId }), {
            note: note || '',
        });
    };

    const handleRejectPayment = (paymentId) => {
        const note = prompt('Nhập lý do từ chối thanh toán:');
        if (note) {
            router.post(route('admin.payments.reject-cod', paymentId), {
                note: note,
            });
        }
    };

    const handleVerifyVnpay = (paymentId) => {
        if (confirm('Bạn có chắc chắn muốn xác minh thanh toán VNPay này?')) {
            router.post(route('admin.payments.verify-vnpay', paymentId));
        }
    };

    // Add function to open the dialog
    const handleOpenOrderDetails = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDialogOpen(true);
    };

    // Add function to close the dialog
    const handleCloseOrderDetails = () => {
        setIsDialogOpen(false);
    };

    const breadcrumbItems = [
        { label: 'Thanh toán', href: '/admin/payments' }
    ];

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-blue-100 text-blue-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'paid':
                return 'Đã thu tiền';
            case 'confirmed':
                return 'Đã xác nhận';
            case 'pending':
                return 'Chờ thanh toán';
            case 'rejected':
                return 'Đã từ chối';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const SortableHeader = ({ field, children }) => (
        <TableHead
            className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center space-x-1">
                <span>{children}</span>
                <ArrowUpDown className="w-4 h-4" />
            </div>
        </TableHead>
    );

    const renderPagination = () => {
        if (!payments.links || payments.links.length <= 3) return null;

        return payments.links.map((link, index) => {
            if (index === 0 || index === payments.links.length - 1) {
                // Skip "Previous" and "Next" links
                return null;
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
            <Head title="Quản lý thanh toán" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý thanh toán</h1>
                    <div className="flex space-x-2">
                        <Link href={route('admin.payments.reconcile-vnpay')}>
                            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                                Đối soát VNPay
                            </Button>
                        </Link>
                        <Link href={route('admin.payments.report')}>
                            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                                Báo cáo
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Tổng số tiền</h3>
                        <p className="mt-1 text-2xl font-semibold text-indigo-600">
                            {formatCurrency(summary.total_amount)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Không bao gồm đã hủy</p>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Đã xác nhận</h3>
                        <p className="mt-1 text-2xl font-semibold text-green-600">
                            {formatCurrency(summary.confirmed_amount)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Kế toán đã xác nhận</p>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Chờ xác nhận</h3>
                        <p className="mt-1 text-2xl font-semibold text-yellow-600">
                            {formatCurrency(summary.pending_amount)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Shipper đã thu tiền</p>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">Hôm nay</h3>
                        <p className="mt-1 text-2xl font-semibold text-blue-600">
                            {formatCurrency(summary.today_amount)}
                        </p>
                    </div>
                </div>

                {/* Filter Form */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6 mb-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loại thanh toán</label>
                                <select
                                    name="type"
                                    value={filterForm.type}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                >
                                    <option value="cod">COD</option>
                                    <option value="vnpay">VNPay</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select
                                    name="status"
                                    value={filterForm.status}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="pending">Chờ thanh toán</option>
                                    <option value="paid">Đã thu tiền</option>
                                    <option value="confirmed">Đã xác nhận</option>
                                    <option value="rejected">Đã từ chối</option>
                                    <option value="cancelled">Đã hủy</option>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                                <div className="flex rounded-md shadow-sm">
                                    <Input
                                        type="text"
                                        name="search"
                                        value={filterForm.search}
                                        onChange={handleFilterChange}
                                        placeholder="Mã đơn hàng..."
                                        className="rounded-l-md"
                                    />
                                    <Button
                                        type="submit"
                                        className="rounded-l-none"
                                    >
                                        Tìm
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex">
                            <Link
                                href={route('admin.payments.index', { type: 'cod' })}
                                className={`${
                                    filterForm.type === 'cod'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                            >
                                COD
                            </Link>
                            <Link
                                href={route('admin.payments.index', { type: 'vnpay' })}
                                className={`${
                                    filterForm.type === 'vnpay'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                            >
                                VNPay
                            </Link>
                        </nav>
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

                {/* Payment Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <SortableHeader field="order_id">Mã đơn hàng</SortableHeader>
                                    <SortableHeader field="customer_name">Khách hàng</SortableHeader>
                                    <SortableHeader field="amount">Số tiền</SortableHeader>
                                    <SortableHeader field="payment_status">Trạng thái</SortableHeader>
                                    <SortableHeader field="confirmed_by">Người xác nhận</SortableHeader>
                                    <SortableHeader field="created_at">Thời gian</SortableHeader>
                                    <TableHead className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-4">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (!payments.data || payments.data.length === 0) ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                                            Không tìm thấy thanh toán nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.data.map((payment) => (
                                        <TableRow key={payment.payment_id} className="hover:bg-gray-50 transition-colors">
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {payment.order.order_id}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {payment.order.user?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium">
                                                {formatCurrency(payment.amount)}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(payment.payment_status)}`}>
                                                    {getStatusText(payment.payment_status)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {payment.confirmed_by?.name || '-'}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-500">
                                                {new Date(payment.created_at).toLocaleDateString('vi-VN')}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                <div className="flex justify-center gap-2">
                                                    {payment.payment_method === 'cod' && payment.payment_status === 'paid' && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                className="text-green-600 border-green-600 hover:bg-green-50"
                                                                onClick={() => handleConfirmPayment(payment.payment_id)}
                                                            >
                                                                Xác nhận
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                                onClick={() => handleRejectPayment(payment.payment_id)}
                                                            >
                                                                Từ chối
                                                            </Button>
                                                        </>
                                                    )}
                                                    {payment.payment_method === 'vnpay' && payment.payment_status === 'pending' && (
                                                        <Button
                                                            variant="outline"
                                                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                                            onClick={() => handleVerifyVnpay(payment.payment_id)}
                                                        >
                                                            Xác minh VNPay
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="outline"
                                                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                                                        onClick={() => handleOpenOrderDetails(payment.order.order_id)}
                                                    >
                                                        Chi tiết
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {payments.links && (
                        <div className="flex justify-between items-center p-4 border-t">
                            <div className="text-sm text-gray-600">
                                Hiển thị {payments.from || 0} đến {payments.to || 0} trên {payments.total} kết quả
                            </div>
                            <div className="flex gap-2">
                                {renderPagination()}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Dialog */}
            {isDialogOpen && (
                <OrderDialog
                    orderId={selectedOrderId}
                    isOpen={isDialogOpen}
                    onClose={handleCloseOrderDetails}
                />
            )}
        </AdminLayout>
    );
}
