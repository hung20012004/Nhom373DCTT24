import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import Breadcrumb from '@/Components/Breadcrumb';
import axios from 'axios';
import { ArrowUpDown, Eye, Edit, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Index() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1
    });
    const [sortField, setSortField] = useState('order_date');
    const [sortDirection, setSortDirection] = useState('desc');

    const statusLabels = {
        'new': 'Mới',
        'processing': 'Đang xử lý',
        'shipping': 'Đang vận chuyển',
        'delivered': 'Đã giao hàng',
        'cancelled': 'Đã hủy'
    };

    const paymentStatusLabels = {
        'pending': 'Chờ thanh toán',
        'paid': 'Đã thanh toán',
        'refunded': 'Đã hoàn tiền',
        'failed': 'Thanh toán thất bại',
        'awaiting_payment': 'Đang chờ thanh toán'
    };

    const statusClasses = {
        'new': 'bg-blue-100 text-blue-800',
        'processing': 'bg-purple-100 text-purple-800',
        'shipping': 'bg-indigo-100 text-indigo-800',
        'delivered': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };

    const paymentStatusClasses = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'paid': 'bg-green-100 text-green-800',
        'refunded': 'bg-purple-100 text-purple-800',
        'failed': 'bg-red-100 text-red-800',
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Tạo đối tượng params và chỉ thêm các tham số có giá trị
            const params = {};

            // Chỉ thêm search nếu không rỗng
            if (search && search.trim() !== '') {
                params.search = search.trim();
            }

            // Chỉ thêm status nếu không phải 'all'
            if (statusFilter !== 'all') {
                params.order_status = statusFilter;
            }

            // Chỉ thêm from_date nếu có giá trị
            if (fromDate) {
                params.from_date = fromDate;
            }

            // Chỉ thêm to_date nếu có giá trị
            if (toDate) {
                params.to_date = toDate;
            }

            // Luôn thêm các tham số phân trang và sắp xếp
            params.page = pagination.current_page;
            params.per_page = pagination.per_page;
            params.sort_field = sortField;
            params.sort_direction = sortDirection;

            const response = await axios.get('/api/v1/orders', { params });

            if (response.data && response.data.data) {
                setOrders(response.data.data.data);
                setPagination({
                    current_page: response.data.data.current_page,
                    per_page: response.data.data.per_page,
                    total: response.data.data.total,
                    last_page: response.data.data.last_page
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchOrders();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, statusFilter, fromDate, toDate, pagination.current_page, sortField, sortDirection]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await axios.put(`/admin/orders/${orderId}/status`, {
                status: newStatus
            });

            if (response.data.status === 'success') {
                fetchOrders();
                alert('Trạng thái đơn hàng đã được cập nhật thành công');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
            console.error('status: ', newStatus);
            alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
        }
    };

    const handleDelete = async (orderId) => {
        if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?')) {
            try {
                const response = await axios.delete(`/admin/orders/${orderId}`);
                if (response.data.status === 'success') {
                    fetchOrders();
                    alert('Đơn hàng đã được xóa thành công');
                }
            } catch (error) {
                console.error('Lỗi khi xóa đơn hàng:', error);
                alert(error.response?.data?.message || `Lỗi khi xóa đơn hàng ${orderId}`);
            }
        }
    };

    const breadcrumbItems = [
        { label: 'Đơn hàng', href: '/admin/orders' }
    ];

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= pagination.last_page; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={pagination.current_page === i ? "default" : "outline"}
                    className="w-10 h-10"
                    onClick={() => setPagination(prev => ({ ...prev, current_page: i }))}
                >
                    {i}
                </Button>
            );
        }
        return pages;
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <AdminLayout>
            <Head title="Quản lý đơn hàng" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Đơn hàng</h1>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Input
                                type="text"
                                placeholder="Tìm kiếm đơn hàng..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Lọc theo trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="new">Mới</SelectItem>
                                    <SelectItem value="processing">Đang xử lý</SelectItem>
                                    <SelectItem value="shipping">Đang vận chuyển</SelectItem>
                                    <SelectItem value="delivered">Đã giao hàng</SelectItem>
                                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <Input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full"
                                    placeholder="Từ ngày"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <Input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full"
                                    placeholder="Đến ngày"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <SortableHeader field="order_id">Mã đơn</SortableHeader>
                                    <SortableHeader field="user_id">Khách hàng</SortableHeader>
                                    <SortableHeader field="order_date">Ngày đặt</SortableHeader>
                                    <SortableHeader field="payment_status">Trạng thái thanh toán</SortableHeader>
                                    <SortableHeader field="order_status">Trạng thái đơn hàng</SortableHeader>
                                    <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : !orders || orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                                            Không có đơn hàng nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.map((order) => (
                                        <TableRow
                                            key={order.order_id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium">
                                                #{order.order_id}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {order.user?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {formatDate(order.order_date)}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusClasses[order.payment_status]}`}>
                                                    {paymentStatusLabels[order.payment_status] || order.payment_status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[order.order_status]}`}>
                                                    {statusLabels[order.order_status] || order.order_status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-blue-600 hover:text-blue-700"
                                                        onClick={() => window.location.href = `/admin/orders/${order.order_id}`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    {order.order_status === 'shipping' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                                onClick={() => handleStatusChange(order.order_id, 'delivered')}
                                                            >
                                                                Đã giao
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleStatusChange(order.order_id, 'cancelled')}
                                                            >
                                                                Hủy
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-between items-center p-4 border-t">
                        <div className="text-sm text-gray-600">
                            Hiển thị {orders.length} trên {pagination.total} đơn hàng
                        </div>
                        <div className="flex gap-2">
                            {renderPagination()}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
