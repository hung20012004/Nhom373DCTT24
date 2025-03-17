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
import { Eye, Calendar, Search, LockIcon, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function KanbanSupportRequests() {
    const [supportRequests, setSupportRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [issueType, setIssueType] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 30,
        total: 0,
        last_page: 1
    });

    // All statuses for support requests
    const statuses = {
        'new': 'Mới',
        'in_progress': 'Đang xử lý',
        'resolved': 'Đã giải quyết',
        'closed': 'Đã đóng'
    };

    // Define status classes for visual styling
    const statusClasses = {
        'new': 'bg-blue-100 text-blue-800',
        'in_progress': 'bg-yellow-100 text-yellow-800',
        'resolved': 'bg-green-100 text-green-800',
        'closed': 'bg-gray-100 text-gray-800'
    };

    // Issue type labels and classes
    const issueTypeLabels = {
        'shipping': 'Vấn đề vận chuyển',
        'product': 'Vấn đề sản phẩm',
        'payment': 'Vấn đề thanh toán',
        'other': 'Khác'
    };

    const issueTypeClasses = {
        'shipping': 'bg-indigo-100 text-indigo-800',
        'product': 'bg-purple-100 text-purple-800',
        'payment': 'bg-cyan-100 text-cyan-800',
        'other': 'bg-rose-100 text-rose-800'
    };

    const fetchSupportRequests = async () => {
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

            if (issueType && issueType !== 'all') {
                params.issue_type = issueType;
            }

            params.page = pagination.current_page;
            params.per_page = pagination.per_page;

            const response = await axios.get('/api/v1/support-requests', { params });

            if (response.data && response.data.data) {
                setSupportRequests(response.data.data.data);
                setPagination({
                    current_page: response.data.data.current_page,
                    per_page: response.data.data.per_page,
                    total: response.data.data.total,
                    last_page: response.data.data.last_page
                });
            }
            console.log('Yêu cầu hỗ trợ:', response.data.data.data);
        } catch (error) {
            console.error('Chi tiết lỗi:', error.response?.data || error.message || error);
            // Hiển thị thông báo lỗi cho người dùng
            alert('Không thể tải dữ liệu. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
            setSupportRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchSupportRequests();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, fromDate, toDate, issueType, pagination.current_page]);

    const handleStatusChange = async (supportRequestId, newStatus, originalStatus) => {
        try {
            const response = await axios.put(`/admin/support-requests/${supportRequestId}/status`, {
                status: newStatus
            });

            if (response.data.status === 'success') {
                fetchSupportRequests(); // Refresh all support requests to ensure consistency
                alert('Trạng thái yêu cầu hỗ trợ đã được cập nhật thành công');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái yêu cầu hỗ trợ:', error);
            alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái yêu cầu hỗ trợ');

            // Revert UI change on failure
            const updatedRequests = [...supportRequests];
            const requestIndex = updatedRequests.findIndex(req => req.id.toString() === supportRequestId);

            if (requestIndex !== -1) {
                updatedRequests[requestIndex] = {
                    ...updatedRequests[requestIndex],
                    status: originalStatus
                };
                setSupportRequests(updatedRequests);
            }

            return false;
        }
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        // If no destination or dropped at the same place
        if (!destination ||
            (destination.droppableId === source.droppableId &&
             destination.index === source.index)) {
            return;
        }

        if (destination.droppableId !== source.droppableId) {
            const supportRequestId = draggableId;
            const newStatus = destination.droppableId;
            const originalStatus = source.droppableId;

            // Update UI optimistically
            const updatedRequests = [...supportRequests];
            const requestIndex = updatedRequests.findIndex(req => req.id.toString() === supportRequestId);

            if (requestIndex !== -1) {
                updatedRequests[requestIndex] = {
                    ...updatedRequests[requestIndex],
                    status: newStatus
                };
                setSupportRequests(updatedRequests);
            }

            // Submit the change to the server
            const success = await handleStatusChange(supportRequestId, newStatus, originalStatus);
        }
    };

    const breadcrumbItems = [
        { label: 'Yêu cầu hỗ trợ', href: '/admin/support-requests' }
    ];

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    };

    // Group support requests by status
    const groupedRequests = supportRequests.reduce((acc, request) => {
        const status = request.status;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(request);
        return acc;
    }, Object.keys(statuses).reduce((obj, status) => ({ ...obj, [status]: [] }), {}));

    const SupportRequestCard = ({ request, index }) => (
        <Draggable
            draggableId={request.id.toString()}
            index={index}
            key={request.id}
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
                            <CardTitle className="text-sm font-semibold flex items-center">
                                #{request.id}
                            </CardTitle>
                            <Badge className={issueTypeClasses[request.issue_type] || 'bg-gray-100'}>
                                {issueTypeLabels[request.issue_type] || request.issue_type}
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-sm mb-2">
                                <div className="font-medium truncate">{request.user?.name || 'Khách hàng'}</div>
                                {request.order_id && (
                                    <div className="text-gray-500">
                                        <span className="font-medium">Đơn hàng:</span> #{request.order_id}
                                    </div>
                                )}
                                <div className="text-gray-500">{formatDate(request.created_at)}</div>
                            </div>
                            <div className="text-xs mt-2 max-h-12 overflow-hidden text-gray-600 line-clamp-2">
                                {request.description}
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700"
                                    onClick={() => window.location.href = `/admin/support-requests/${request.id}`}
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Chi tiết
                                </Button>
                                <div className="flex items-center text-gray-500 text-xs">
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    {request.replies_count || 0}
                                </div>
                            </div>
                            {request.resolved_at && (
                                <div className="mt-2 text-xs text-gray-500">
                                    Giải quyết: {formatDate(request.resolved_at)}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </Draggable>
    );

    return (
        <AdminLayout>
            <Head title="Quản lý yêu cầu hỗ trợ" />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý yêu cầu hỗ trợ</h1>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-gray-500" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm yêu cầu hỗ trợ..."
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
                                max={toDate}
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
                                min={fromDate}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Select
                                value={issueType}
                                onValueChange={setIssueType}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Loại vấn đề" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="shipping">Vấn đề vận chuyển</SelectItem>
                                    <SelectItem value="product">Vấn đề sản phẩm</SelectItem>
                                    <SelectItem value="payment">Vấn đề thanh toán</SelectItem>
                                    <SelectItem value="other">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {Object.keys(statuses).map((status) => (
                                <div key={status} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-semibold text-gray-700">
                                            <span className={`px-2 py-1 rounded-full ${statusClasses[status]}`}>
                                                {statuses[status]}
                                            </span>
                                        </h2>
                                        <Badge variant="outline" className="bg-white">
                                            {groupedRequests[status]?.length || 0}
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
                                                {groupedRequests[status]?.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                                        <p>Không có yêu cầu nào</p>
                                                    </div>
                                                ) : (
                                                    groupedRequests[status].map((request, index) => (
                                                        <SupportRequestCard
                                                            key={request.id}
                                                            request={request}
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

                {!loading && supportRequests.length > 0 && pagination.last_page > 1 && (
                    <div className="flex justify-center mt-6">
                        <div className="flex space-x-1">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.current_page <= 1}
                                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
                            >
                                Trước
                            </Button>
                            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={pagination.current_page === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setPagination({ ...pagination, current_page: page })}
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.current_page >= pagination.last_page}
                                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
                            >
                                Tiếp
                            </Button>
                        </div>
                    </div>
                )}

                {!loading && supportRequests.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <LockIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Không tìm thấy yêu cầu hỗ trợ</h3>
                        <p className="mt-1 text-sm text-gray-500">Không có yêu cầu hỗ trợ nào phù hợp với các tiêu chí tìm kiếm.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
