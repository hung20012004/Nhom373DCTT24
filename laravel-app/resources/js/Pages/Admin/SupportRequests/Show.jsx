import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowLeft, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

export default function Show({ requestId }) {
    const [supportRequest, setSupportRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    const statuses = {
        'new': 'Mới',
        'in_progress': 'Đang xử lý',
        'resolved': 'Đã giải quyết',
        'closed': 'Đã đóng'
    };

    const statusClasses = {
        'new': 'bg-blue-100 text-blue-800',
        'in_progress': 'bg-yellow-100 text-yellow-800',
        'resolved': 'bg-green-100 text-green-800',
        'closed': 'bg-gray-100 text-gray-800'
    };

    // Issue type definitions
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

    const fetchSupportRequest = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/support-requests/${requestId}`);
            if (response.data && response.data.data) {
                setSupportRequest(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải yêu cầu hỗ trợ:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupportRequest();
    }, [requestId]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await axios.put(`/admin/support-requests/${requestId}/status`, {
                status: newStatus
            });

            if (response.data.status === 'success') {
                fetchSupportRequest();
                alert('Trạng thái yêu cầu hỗ trợ đã được cập nhật thành công');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái yêu cầu hỗ trợ:', error);
            alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái yêu cầu hỗ trợ');
        }
    };

    const breadcrumbItems = [
        { label: 'Yêu cầu hỗ trợ', href: '/admin/support-requests' },
        { label: `Chi tiết yêu cầu #${requestId}`, href: `/admin/support-requests/${requestId}` }
    ];

    if (loading) {
        return (
            <AdminLayout>
                <Head title="Đang tải..." />
                <div className="container mx-auto py-6 px-4">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!supportRequest) {
        return (
            <AdminLayout>
                <Head title="Không tìm thấy yêu cầu hỗ trợ" />
                <div className="container mx-auto py-6 px-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy yêu cầu hỗ trợ</h2>
                        <p className="mt-2 text-gray-600">Yêu cầu hỗ trợ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                        <Button className="mt-4" onClick={() => window.location.href = '/admin/support-requests'}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại danh sách
                        </Button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Head title={`Yêu cầu hỗ trợ #${supportRequest.id}`} />

            <div className="container mx-auto py-6 px-4">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Yêu cầu hỗ trợ #{supportRequest.id}
                    </h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.location.href = '/admin/support-requests'}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>

                        {supportRequest.status === 'new' && (
                            <Button className="bg-yellow-600 hover:bg-yellow-700" onClick={() => handleStatusChange('in_progress')}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Bắt đầu xử lý
                            </Button>
                        )}

                        {supportRequest.status === 'in_progress' && (
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('resolved')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Đánh dấu đã giải quyết
                            </Button>
                        )}

                        {(supportRequest.status === 'new' || supportRequest.status === 'in_progress') && (
                            <Button variant="destructive" onClick={() => handleStatusChange('closed')}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Đóng yêu cầu
                            </Button>
                        )}
                    </div>
                </div>

                {supportRequest.status === 'in_progress' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin yêu cầu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mã yêu cầu:</span>
                                        <span className="font-medium">#{supportRequest.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ngày tạo:</span>
                                        <span>{formatDate(supportRequest.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[supportRequest.status]}`}>
                                            {statuses[supportRequest.status] || supportRequest.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Loại vấn đề:</span>
                                        <Badge className={issueTypeClasses[supportRequest.issue_type] || 'bg-gray-100'}>
                                            {issueTypeLabels[supportRequest.issue_type] || supportRequest.issue_type}
                                        </Badge>
                                    </div>
                                    {supportRequest.order_id && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Đơn hàng:</span>
                                            <a href={`/admin/orders/${supportRequest.order_id}`} className="text-blue-600 hover:underline">
                                                #{supportRequest.order_id}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin người phụ trách</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Người phụ trách:</span>
                                        <span className="font-medium">{supportRequest.resolver?.name}</span>
                                    </div>
                                    {supportRequest.resolved_at && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ngày giải quyết:</span>
                                            <span>{formatDate(supportRequest.resolved_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin khách hàng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tên khách hàng:</span>
                                        <span className="font-medium">{supportRequest.user?.name || 'Không có'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span>{supportRequest.user?.email || 'Không có'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Điện thoại:</span>
                                        <span>{supportRequest.user?.phone || 'Không có'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin yêu cầu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mã yêu cầu:</span>
                                        <span className="font-medium">#{supportRequest.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ngày tạo:</span>
                                        <span>{formatDate(supportRequest.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[supportRequest.status]}`}>
                                            {statuses[supportRequest.status] || supportRequest.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Loại vấn đề:</span>
                                        <Badge className={issueTypeClasses[supportRequest.issue_type] || 'bg-gray-100'}>
                                            {issueTypeLabels[supportRequest.issue_type] || supportRequest.issue_type}
                                        </Badge>
                                    </div>
                                    {supportRequest.order_id && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Đơn hàng:</span>
                                            <a href={`/admin/orders/${supportRequest.order_id}`} className="text-blue-600 hover:underline">
                                                #{supportRequest.order_id}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin khách hàng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tên khách hàng:</span>
                                        <span className="font-medium">{supportRequest.user?.name || 'Không có'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span>{supportRequest.user?.email || 'Không có'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Điện thoại:</span>
                                        <span>{supportRequest.user?.phone || 'Không có'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Mô tả vấn đề</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                            {supportRequest.description}
                        </div>
                    </CardContent>
                </Card>

                {supportRequest.status === 'closed' && (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                        <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-gray-800">Yêu cầu hỗ trợ đã đóng</h3>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
