import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
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
import { Eye, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function KanbanPurchaseOrders() {
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
        per_page: 30,
        total: 0,
        last_page: 1
    });

    // Trạng thái có thể kéo thả trong Kanban
    const kanbanStatuses = {
        'pending': 'Đang xử lý',
        'processing': 'Đã đặt hàng',
        'completed': 'Đã nhận hàng',
        'cancelled': 'Đã hủy'
    };

    const statusClasses = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'processing': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
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
            const params = {};

            if (search && search.trim() !== '') {
                params.search = search.trim();
            }

            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            if (supplierFilter !== 'all') {
                params.supplier_id = supplierFilter;
            }

            if (fromDate) {
                params.from_date = fromDate;
            }

            if (toDate) {
                params.to_date = toDate;
            }

            params.page = pagination.current_page;
            params.per_page = pagination.per_page;

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
    }, [search, statusFilter, supplierFilter, fromDate, toDate, pagination.current_page]);

    const handleStatusChange = async (poId, newStatus, originalStatus) => {
        try {
            const response = await axios.put(`/admin/purchase-orders/${poId}/status`, {
                status: newStatus
            });

            if (response.data.status === 'success') {
                fetchPurchaseOrders();
                alert('Trạng thái đơn đặt hàng đã được cập nhật thành công');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn đặt hàng:', error);
            alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn đặt hàng');

            const updatedOrders = [...purchaseOrders];
            const orderIndex = updatedOrders.findIndex(po => po.po_id.toString() === poId);

            if (orderIndex !== -1) {
                updatedOrders[orderIndex] = {
                    ...updatedOrders[orderIndex],
                    status: originalStatus
                };
                setPurchaseOrders(updatedOrders);
            }

            return false;
        }
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination ||
            (destination.droppableId === source.droppableId &&
             destination.index === source.index)) {
            return;
        }

        if (destination.droppableId !== source.droppableId) {
            const poId = draggableId;
            const newStatus = destination.droppableId;
            const originalStatus = source.droppableId;

            const updatedOrders = [...purchaseOrders];
            const orderIndex = updatedOrders.findIndex(po => po.po_id.toString() === poId);

            if (orderIndex !== -1) {
                updatedOrders[orderIndex] = {
                    ...updatedOrders[orderIndex],
                    status: newStatus
                };
                setPurchaseOrders(updatedOrders);
            }

            const success = await handleStatusChange(poId, newStatus, originalStatus);
        }
    };

    const breadcrumbItems = [
        { label: 'Đơn đặt hàng', href: '/admin/purchase-orders' }
    ];

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Nhóm đơn hàng theo trạng thái
    const groupedOrders = purchaseOrders.reduce((acc, po) => {
        const status = po.status;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(po);
        return acc;
    }, Object.keys(kanbanStatuses).reduce((obj, status) => ({ ...obj, [status]: [] }), {}));

    const PurchaseOrderCard = ({ po, index }) => (
        <Draggable
            draggableId={po.po_id.toString()}
            index={index}
            key={po.po_id}
        >
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-4 ${snapshot.isDragging ? 'opacity-75' : ''}`}
                >
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2 flex flex-row justify-between items-center">
                            <CardTitle className="text-sm font-semibold">
                                #{po.po_id}
                            </CardTitle>
                            <Badge className={statusClasses[po.status] || 'bg-gray-100'}>
                                {kanbanStatuses[po.status] || po.status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-sm mb-2">
                                <div className="font-medium">{po.supplier?.name || 'N/A'}</div>
                                <div className="text-gray-500">{formatDate(po.order_date)}</div>
                                <div className="text-gray-500">Dự kiến: {formatDate(po.expected_date)}</div>
                                <div className="font-medium mt-1">{formatCurrency(po.total_amount)}</div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700"
                                    onClick={() => window.location.href = `/admin/purchase-orders/${po.po_id}`}
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Chi tiết
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Draggable>
    );

    return (
        <AdminLayout>
            <Head title="Quản lý đơn đặt hàng" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn đặt hàng</h1>
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
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-gray-500" />
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
                                    {Object.entries(kanbanStatuses).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
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
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full"
                                placeholder="Từ ngày"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
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

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
                            {Object.keys(kanbanStatuses).map((status) => (
                                <div key={status} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-semibold text-gray-700">
                                            <span className={`px-2 py-1 rounded-full ${statusClasses[status]}`}>
                                                {kanbanStatuses[status]}
                                            </span>
                                        </h2>
                                        <Badge variant="outline" className="bg-white">
                                            {groupedOrders[status]?.length || 0}
                                        </Badge>
                                    </div>
                                    <Droppable droppableId={status}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`space-y-2 overflow-y-auto max-h-[calc(100vh-250px)] min-h-64 p-2 rounded-lg ${
                                                    snapshot.isDraggingOver ? 'bg-gray-100' : 'bg-gray-50'
                                                }`}
                                            >
                                                {groupedOrders[status]?.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                                        Không có đơn hàng nào
                                                    </div>
                                                ) : (
                                                    groupedOrders[status].map((po, index) => (
                                                        <PurchaseOrderCard
                                                            key={po.po_id}
                                                            po={po}
                                                            index={index}
                                                        />
                                                    ))
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                        </div>
                    </DragDropContext>
                )}

                {!loading && pagination.last_page > 1 && (
                    <div className="flex justify-center mt-6">
                        <div className="flex gap-2">
                            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={pagination.current_page === page ? "default" : "outline"}
                                    className="w-10 h-10"
                                    onClick={() => setPagination(prev => ({ ...prev, current_page: page }))}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

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