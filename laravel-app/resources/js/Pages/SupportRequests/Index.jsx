import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, LifeBuoy, Calendar, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SupportRequestIndex = ({ supportRequests }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeStatus, setActiveStatus] = useState('all');
    const [activeIssueType, setActiveIssueType] = useState('all');

    // Filter support requests based on search term, active status and issue type
    const filteredRequests = supportRequests.filter(request => {
        const matchesSearch =
            request.id.toString().includes(searchTerm) ||
            request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (request.order && request.order.id.toString().includes(searchTerm));

        const matchesStatus = activeStatus === 'all' || request.status === activeStatus;
        const matchesIssueType = activeIssueType === 'all' || request.issue_type === activeIssueType;

        return matchesSearch && matchesStatus && matchesIssueType;
    });

    // Get status badge properties
    const getStatusBadge = (status) => {
        switch(status) {
            case 'new':
                return { label: 'Mới', color: 'bg-blue-500' };
            case 'in_progress':
                return { label: 'Đang xử lý', color: 'bg-yellow-500' };
            case 'resolved':
                return { label: 'Đã giải quyết', color: 'bg-green-500' };
            case 'closed':
                return { label: 'Đã đóng', color: 'bg-gray-500' };
            default:
                return { label: 'Không xác định', color: 'bg-gray-400' };
        }
    };

    // Get issue type badge properties
    const getIssueTypeBadge = (type) => {
        switch(type) {
            case 'shipping':
                return { label: 'Vấn đề vận chuyển', color: 'bg-purple-500' };
            case 'product':
                return { label: 'Vấn đề sản phẩm', color: 'bg-indigo-500' };
            case 'payment':
                return { label: 'Vấn đề thanh toán', color: 'bg-orange-500' };
            case 'other':
                return { label: 'Khác', color: 'bg-teal-500' };
            default:
                return { label: 'Không xác định', color: 'bg-gray-400' };
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    const statusOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'new', label: 'Mới' },
        { value: 'in_progress', label: 'Đang xử lý' },
        { value: 'resolved', label: 'Đã giải quyết' },
        { value: 'closed', label: 'Đã đóng' }
    ];

    const issueTypeOptions = [
        { value: 'all', label: 'Tất cả các vấn đề' },
        { value: 'shipping', label: 'Vấn đề vận chuyển' },
        { value: 'product', label: 'Vấn đề sản phẩm' },
        { value: 'payment', label: 'Vấn đề thanh toán' },
        { value: 'other', label: 'Khác' }
    ];

    return (
        <Layout>
            <Head title="Yêu cầu hỗ trợ của tôi" />

            <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                        <div>
                            <CardTitle className="text-2xl font-bold mb-1">Yêu cầu hỗ trợ của tôi</CardTitle>
                            <p className="text-gray-600">Theo dõi và quản lý các yêu cầu hỗ trợ của bạn</p>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Tìm kiếm yêu cầu..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Filter area */}
                        <div className="mb-6 space-y-4">
                            <div>
                                <h3 className="text-sm font-medium mb-2">Trạng thái:</h3>
                                <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                                    {statusOptions.map(status => (
                                        <Button
                                            key={status.value}
                                            variant={activeStatus === status.value ? "default" : "outline"}
                                            onClick={() => setActiveStatus(status.value)}
                                            className={activeStatus === status.value ? "text-white" : ""}
                                            size="sm"
                                        >
                                            {status.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium mb-2">Loại vấn đề:</h3>
                                <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                                    {issueTypeOptions.map(type => (
                                        <Button
                                            key={type.value}
                                            variant={activeIssueType === type.value ? "default" : "outline"}
                                            onClick={() => setActiveIssueType(type.value)}
                                            className={activeIssueType === type.value ? "text-white" : ""}
                                            size="sm"
                                        >
                                            {type.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {filteredRequests.length > 0 ? (
                            <div className="space-y-4">
                                {filteredRequests.map((request) => (
                                    <Card key={request.id} className="overflow-hidden">
                                        <div className="bg-gray-50 p-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b">
                                            <div>
                                                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                                                    <LifeBuoy className="h-5 w-5 text-gray-600" />
                                                    <h3 className="font-semibold">Yêu cầu hỗ trợ #{request.id}</h3>
                                                    <Badge className={getStatusBadge(request.status).color + " text-white"}>
                                                        {getStatusBadge(request.status).label}
                                                    </Badge>
                                                    <Badge className={getIssueTypeBadge(request.issue_type).color + " text-white"}>
                                                        {getIssueTypeBadge(request.issue_type).label}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(request.created_at)}</span>
                                                </div>
                                            </div>

                                            {request.order && (
                                                <div className="mt-2 md:mt-0 text-right">
                                                    <p className="text-sm font-medium">Liên quan đến đơn hàng:</p>
                                                    <Link
                                                        href={`/order/${request.order.id}`}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        #{request.order.id}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <h4 className="font-medium mb-2">Nội dung yêu cầu:</h4>
                                            <p className="text-gray-700 mb-4">{truncateText(request.description)}</p>

                                            {request.status === 'resolved' && request.resolved_at && (
                                                <div className="flex items-center text-sm text-gray-600 mb-4">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    <span>Đã giải quyết vào: {formatDate(request.resolved_at)}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-end mt-2">
                                                <Button asChild variant="outline">
                                                    <Link href={`/support-requests/${request.id}`}>Xem chi tiết</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <LifeBuoy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">Không tìm thấy yêu cầu hỗ trợ</h3>
                                <p className="mt-1 text-gray-500">
                                    {searchTerm || activeStatus !== 'all' || activeIssueType !== 'all'
                                        ? 'Không tìm thấy yêu cầu hỗ trợ phù hợp với tìm kiếm của bạn.'
                                        : 'Bạn chưa có yêu cầu hỗ trợ nào.'}
                                </p>
                                {searchTerm === '' && activeStatus === 'all' && activeIssueType === 'all' && (
                                    <div className="mt-6">
                                        <Button asChild>
                                            <Link href="/support-requests/create">Tạo yêu cầu hỗ trợ mới</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default SupportRequestIndex;
