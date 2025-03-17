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
import axios from 'axios';
import { Eye, Calendar, Search, LockIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function KanbanOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 30,
        total: 0,
        last_page: 1
    });

    // Trạng thái có thể cập nhật trong Kanban
    const kanbanStatuses = {
        'packed': 'Đã đóng gói',
        'shipping': 'Đang giao hàng',
        'delivered': 'Giao hàng thành công',
        'shipping_failed': 'Giao không thành công'
    };

    // Trạng thái chỉ xem, không thể cập nhật qua Kanban
    const readOnlyStatuses = {

    };

    // Tất cả các trạng thái để hiển thị
    const allStatuses = { ...kanbanStatuses, ...readOnlyStatuses };

    const statusClasses = {
        'new': 'bg-blue-100 text-blue-800',
        'processing': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800',
        'preparing': 'bg-yellow-100 text-yellow-800',
        'packed': 'bg-purple-100 text-purple-800',
        'shipping': 'bg-indigo-100 text-indigo-800',
        'delivered': 'bg-emerald-100 text-emerald-800',
        'shipping_failed': 'bg-rose-100 text-rose-800'
    };

    const paymentStatusLabels = {
        'pending': 'Chờ thanh toán',
        'paid': 'Đã thanh toán',
        'refunded': 'Đã hoàn tiền',
        'failed': 'Thanh toán thất bại',
        'awaiting_payment': 'Đang chờ thanh toán'
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
            const params = {};

            if (search && search.trim() !== '') {
                params.search = search.trim();
            }

            if (fromDate) {
                params.from_date = fromDate;
            }

            if (toDate) {
                params.to_date = toDate;
            }

            params.page = pagination.current_page;
            params.per_page = pagination.per_page;

            // Lấy tất cả các trạng thái, bao gồm cả chỉ đọc
            params.order_status = Object.keys(allStatuses).join(',');

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
    }, [search, fromDate, toDate, pagination.current_page]);

    const handleStatusChange = async (orderId, newStatus, originalStatus) => {
        try {
            const response = await axios.put(`/admin/orders/${orderId}/status`, {
                status: newStatus
            });

            if (response.data.status === 'success') {
                fetchOrders(); // Refresh all orders to ensure consistency
                alert('Trạng thái đơn hàng đã được cập nhật thành công');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
            alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng');

            // Revert UI change on failure
            const updatedOrders = [...orders];
            const orderIndex = updatedOrders.findIndex(order => order.order_id.toString() === orderId);

            if (orderIndex !== -1) {
                updatedOrders[orderIndex] = {
                    ...updatedOrders[orderIndex],
                    order_status: originalStatus
                };
                setOrders(updatedOrders);
            }

            return false;
        }
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        // Existing validation checks...
        if (!destination ||
            (destination.droppableId === source.droppableId &&
             destination.index === source.index)) {
            return;
        }

        // Other existing checks...

        if (destination.droppableId !== source.droppableId) {
            const orderId = draggableId;
            const newStatus = destination.droppableId;
            const originalStatus = source.droppableId;

            // Add special confirmation for shipping -> delivered
            if (originalStatus === 'shipping' && newStatus === 'delivered') {
                // Find the order to check if it's COD
                const order = orders.find(o => o.order_id.toString() === orderId);

                let confirmMessage = 'Bạn có xác nhận đã giao hàng thành công?';

                // Add payment confirmation for COD orders
                if (order && order.payment_method === 'cod') {
                    confirmMessage = `Bạn có xác nhận đã giao hàng thành công và đã nhận đủ ${formatCurrency(order.total_amount)} từ khách hàng?`;
                }

                if (!window.confirm(confirmMessage)) {
                    return; // Cancel the status update if user doesn't confirm
                }
            }

            // Optimistic update
            const updatedOrders = [...orders];
            const orderIndex = updatedOrders.findIndex(order => order.order_id.toString() === orderId);

            if (orderIndex !== -1) {
                updatedOrders[orderIndex] = {
                    ...updatedOrders[orderIndex],
                    order_status: newStatus
                };
                setOrders(updatedOrders);
            }

            const success = await handleStatusChange(orderId, newStatus, originalStatus);
        }
    };

    const breadcrumbItems = [
        { label: 'Giao hàng', href: '/admin/orders' }
    ];

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Nhóm các đơn hàng theo trạng thái
    const groupedOrders = orders.reduce((acc, order) => {
        const status = order.order_status;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(order);
        return acc;
    }, Object.keys(allStatuses).reduce((obj, status) => ({ ...obj, [status]: [] }), {}));

    const OrderCard = ({ order, index, isReadOnly }) => (
        <Draggable
            draggableId={order.order_id.toString()}
            index={index}
            key={order.order_id}
            isDragDisabled={isReadOnly}
        >
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-4 ${snapshot.isDragging ? 'opacity-75' : ''}`}
                >
                    <Card className={`hover:shadow-md transition-shadow ${isReadOnly ? 'border-l-4 border-l-gray-400' : ''}`}>
                        <CardHeader className="pb-2 flex flex-row justify-between items-center">
                            <CardTitle className="text-sm font-semibold flex items-center">
                                #{order.order_id}
                                {isReadOnly && <LockIcon className="h-3 w-3 ml-1 text-gray-500" />}
                            </CardTitle>
                            <Badge className={paymentStatusClasses[order.payment_status] || 'bg-gray-100'}>
                                {paymentStatusLabels[order.payment_status] || order.payment_status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-sm mb-2">
                                <div className="font-medium">{order.user?.name || 'Khách hàng'}</div>
                                <div className="text-gray-500">{formatDate(order.order_date)}</div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700"
                                    onClick={() => window.location.href = `/admin/orders/${order.order_id}`}
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
            <Head title="Giao hàng" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Giao hàng</h1>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-gray-500" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm đơn hàng..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                            />
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
                            {/* Các cột trạng thái có thể cập nhật */}
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
                                                    groupedOrders[status].map((order, index) => (
                                                        <OrderCard
                                                            key={order.order_id}
                                                            order={order}
                                                            index={index}
                                                            isReadOnly={false}
                                                        />
                                                    ))
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}

                            {/* Các cột trạng thái chỉ đọc */}
                            {Object.keys(readOnlyStatuses).map((status) => (
                                <div key={status} className="bg-gray-50 rounded-lg p-4 relative">
                                    {/* Dấu hiệu chỉ đọc */}
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="outline" className="bg-gray-200 text-gray-700 flex items-center gap-1">
                                            <LockIcon className="h-3 w-3" /> Chỉ xem
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-semibold text-gray-700">
                                            <span className={`px-2 py-1 rounded-full ${statusClasses[status]}`}>
                                                {readOnlyStatuses[status]}
                                            </span>
                                        </h2>
                                        <Badge variant="outline" className="bg-white">
                                            {groupedOrders[status]?.length || 0}
                                        </Badge>
                                    </div>
                                    <Droppable droppableId={status} isDropDisabled={true}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`space-y-2 overflow-y-auto max-h-[calc(100vh-250px)] min-h-64 p-2 rounded-lg bg-gray-100 opacity-90`}
                                            >
                                                {groupedOrders[status]?.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                                        Không có đơn hàng nào
                                                    </div>
                                                ) : (
                                                    groupedOrders[status].map((order, index) => (
                                                        <OrderCard
                                                            key={order.order_id}
                                                            order={order}
                                                            index={index}
                                                            isReadOnly={true}
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
            </div>
        </AdminLayout>
    );
}
