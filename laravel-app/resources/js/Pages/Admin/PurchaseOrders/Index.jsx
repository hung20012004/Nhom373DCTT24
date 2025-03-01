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
import PurchaseOrderForm from './PurchaseOrderForm.jsx';
import axios from 'axios';
import { ArrowUpDown, Eye, Edit, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Index() {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [suppliers, setSuppliers] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editPurchaseOrder, setEditPurchaseOrder] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1
    });
    const [sortField, setSortField] = useState('order_date');
    const [sortDirection, setSortDirection] = useState('desc');

    const statusLabels = {
        'draft': 'Nháp',
        'ordered': 'Đã đặt hàng',
        'received': 'Đã nhận hàng',
        'cancelled': 'Đã hủy'
    };

    const statusClasses = {
        'draft': 'bg-gray-100 text-gray-800',
        'ordered': 'bg-blue-100 text-blue-800',
        'received': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('/api/v1/suppliers');
            if (response.data && response.data.data) {
                setSuppliers(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải nhà cung cấp:', error);
        }
    };

    const fetchPurchaseOrders = async () => {
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
                params.status = statusFilter;
            }

            // Chỉ thêm supplier_id nếu không phải 'all'
            if (supplierFilter !== 'all') {
                params.supplier_id = supplierFilter;
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

            const response = await axios.get('/api/v1/purchase-orders', { params });

            if (response.data && response.data.data) {
                setPurchaseOrders(response.data.data.data);
                setPagination({
                    current_page: response.data.data.current_page,
                    per_page: response.data.data.per_page,
                    total: response.data.data.total,
                    last_page: response.data.data.last_page
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải đơn đặt hàng:', error);
            setPurchaseOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchPurchaseOrders();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, statusFilter, supplierFilter, fromDate, toDate, pagination.current_page, sortField, sortDirection]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleDelete = async (poId) => {
        if (confirm('Bạn có chắc chắn muốn xóa đơn đặt hàng này không?')) {
            try {
                const response = await axios.delete(`/admin/api/purchase-orders/${poId}`);
                if (response.data.status === 'success') {
                    fetchPurchaseOrders();
                    alert('Đơn đặt hàng đã được xóa thành công');
                }
            } catch (error) {
                console.error('Lỗi khi xóa đơn đặt hàng:', error);
                alert(error.response?.data?.message || `Lỗi khi xóa đơn đặt hàng ${poId}`);
            }
        }
    };

    const handleStatusChange = async (poId, newStatus) => {
        try {
            const response = await axios.put(`/admin/api/purchase-orders/${poId}/status`, {
                status: newStatus
            });

            if (response.data.status === 'success') {
                fetchPurchaseOrders();
                alert('Trạng thái đơn đặt hàng đã được cập nhật thành công');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn đặt hàng:', error);
            alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn đặt hàng');
        }
    };

    const breadcrumbItems = [
        { label: 'Đơn đặt hàng', href: '/admin/purchase-orders' }
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd/MM/yyyy');
    };
    console.log("purchaseOrders typeof: ", typeof purchaseOrders.supplier_id);
    return (
        <AdminLayout>
            <Head title="Quản lý đơn đặt hàng" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Đơn đặt hàng</h1>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Button
                            onClick={() => {
                                setEditPurchaseOrder(null);
                                setShowForm(true);
                            }}
                        >
                            Thêm đơn đặt hàng mới
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                    <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <Input
                                type="text"
                                placeholder="Tìm kiếm đơn đặt hàng..."
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
                                    <SelectItem value="draft">Nháp</SelectItem>
                                    <SelectItem value="ordered">Đã đặt hàng</SelectItem>
                                    <SelectItem value="received">Đã nhận hàng</SelectItem>
                                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Lọc theo nhà cung cấp" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
                                    {suppliers.map(supplier => (
                                        <SelectItem key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </SelectItem>
                                    ))}
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
                                    <SortableHeader field="po_id">Mã đơn</SortableHeader>
                                    <SortableHeader field="supplier_id">Nhà cung cấp</SortableHeader>
                                    <SortableHeader field="order_date">Ngày đặt</SortableHeader>
                                    <SortableHeader field="expected_date">Ngày dự kiến</SortableHeader>
                                    <SortableHeader field="total_amount">Tổng tiền</SortableHeader>
                                    <SortableHeader field="status">Trạng thái</SortableHeader>
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
                                ) : !purchaseOrders || purchaseOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                                            Không có đơn đặt hàng nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    purchaseOrders.map((po) => (
                                        <TableRow
                                            key={po.po_id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium">
                                                #{po.po_id}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {po.supplier?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {formatDate(po.order_date)}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                {formatDate(po.expected_date)}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium">
                                                {formatCurrency(po.total_amount)}
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[po.status]}`}>
                                                    {statusLabels[po.status] || po.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-blue-600 hover:text-blue-700"
                                                        onClick={() => window.location.href = `/admin/purchase-orders/${po.po_id}`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    {po.status === 'draft' && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-amber-600 hover:text-amber-700"
                                                                onClick={() => {
                                                                    console.log("Setting edit purchase order:", po);
                                                                    setEditPurchaseOrder(po);
                                                                    setShowForm(true);
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                                onClick={() => handleDelete(po.po_id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}

                                                    {po.status === 'draft' && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                                            onClick={() => handleStatusChange(po.po_id, 'ordered')}
                                                        >
                                                            Đặt hàng
                                                        </Button>
                                                    )}

                                                    {po.status === 'ordered' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                                onClick={() => handleStatusChange(po.po_id, 'received')}
                                                            >
                                                                Nhận hàng
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleStatusChange(po.po_id, 'cancelled')}
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
                            Hiển thị {purchaseOrders.length} trên {pagination.total} đơn đặt hàng
                        </div>
                        <div className="flex gap-2">
                            {renderPagination()}
                        </div>
                    </div>
                </div>

                {showForm && (
                    <PurchaseOrderForm
                        purchaseOrder={editPurchaseOrder}
                        onClose={() => {
                            setShowForm(false);
                            setEditPurchaseOrder(null);
                        }}
                        onSuccess={() => {
                            setShowForm(false);
                            setEditPurchaseOrder(null);
                            fetchPurchaseOrders();
                        }}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
