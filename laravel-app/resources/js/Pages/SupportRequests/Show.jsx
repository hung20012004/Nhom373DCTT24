import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    MessageCircle,
    ClipboardCheck,
    AlertCircle,
    Clock,
    CheckCircle,
    ShoppingBag
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const SupportRequestShow = ({ supportRequest }) => {
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const { toast } = useToast();

    // Get status badge properties
    const getStatusBadge = (status) => {
        switch(status) {
            case 'new':
                return { label: 'Mới tạo', color: 'bg-blue-500' };
            case 'in_progress':
                return { label: 'Đang xử lý', color: 'bg-yellow-500' };
            case 'resolved':
                return { label: 'Đã giải quyết', color: 'bg-green-500' };
            case 'closed':
                return { label: 'Đã đóng', color: 'bg-gray-500' };
            default:
                return { label: 'Không xác định', color: 'bg-gray-500' };
        }
    };

    // Get issue type label
    const getIssueTypeLabel = (issueType) => {
        switch(issueType) {
            case 'shipping':
                return 'Vấn đề vận chuyển';
            case 'product':
                return 'Vấn đề sản phẩm';
            case 'payment':
                return 'Vấn đề thanh toán';
            case 'other':
                return 'Vấn đề khác';
            default:
                return 'Không xác định';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'new':
                return <MessageCircle className="h-6 w-6" />;
            case 'in_progress':
                return <Clock className="h-6 w-6" />;
            case 'resolved':
                return <CheckCircle className="h-6 w-6" />;
            case 'closed':
                return <ClipboardCheck className="h-6 w-6" />;
            default:
                return <AlertCircle className="h-6 w-6" />;
        }
    };

    const handleCancel = () => {
        setProcessing(true);

        router.post(`/support-requests/${supportRequest.id}/cancel`, {}, {
            onSuccess: () => {
                setProcessing(false);
                setCancelDialogOpen(false);
                toast({
                    title: "Thành công",
                    description: "Yêu cầu hỗ trợ đã được hủy thành công.",
                });
                router.reload();
            },
            onError: (errors) => {
                setProcessing(false);
                toast({
                    title: "Lỗi",
                    description: errors.error || "Đã xảy ra lỗi khi hủy yêu cầu",
                    variant: "destructive",
                });
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    // Check if support request can be cancelled
    const canBeCancelled = ['new', 'in_progress'].includes(supportRequest.status);

    return (
        <Layout>
            <Head title={`Chi tiết yêu cầu hỗ trợ #${supportRequest.id}`} />

            <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Button asChild variant="ghost" className="p-0 mb-2">
                        <Link href="/support-requests">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại danh sách yêu cầu hỗ trợ
                        </Link>
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <h1 className="text-2xl font-bold flex items-center">
                            Yêu cầu hỗ trợ #{supportRequest.id}
                            <Badge className={`ml-3 ${getStatusBadge(supportRequest.status).color} text-white`}>
                                {getStatusBadge(supportRequest.status).label}
                            </Badge>
                        </h1>
                        <p className="text-gray-600 mt-1 md:mt-0">
                            Ngày tạo: {formatDate(supportRequest.created_at)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cột nội dung yêu cầu */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Nội dung yêu cầu */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Nội dung yêu cầu</CardTitle>
                                <CardDescription>
                                    Loại vấn đề: {getIssueTypeLabel(supportRequest.issue_type)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-gray-50 p-4 rounded-md text-gray-700 whitespace-pre-wrap">
                                    {supportRequest.description}
                                </div>

                                {supportRequest.resolved_at && (
                                    <div className="mt-6">
                                        <h3 className="font-semibold text-gray-700 mb-2">Thời gian giải quyết:</h3>
                                        <p className="text-gray-600">{formatDate(supportRequest.resolved_at)}</p>
                                    </div>
                                )}

                                {supportRequest.admin_notes && (
                                    <div className="mt-6">
                                        <h3 className="font-semibold text-gray-700 mb-2">Ghi chú từ nhân viên hỗ trợ:</h3>
                                        <div className="bg-blue-50 p-4 rounded-md text-gray-700 whitespace-pre-wrap">
                                            {supportRequest.admin_notes}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cột thông tin chi tiết */}
                    <div className="space-y-6">
                        {/* Thông tin chi tiết */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Thông tin chi tiết</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Trạng thái:</p>
                                        <p className="font-medium flex items-center">
                                            {getStatusIcon(supportRequest.status)}
                                            <span className="ml-2">{getStatusBadge(supportRequest.status).label}</span>
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Loại vấn đề:</p>
                                        <p className="font-medium">{getIssueTypeLabel(supportRequest.issue_type)}</p>
                                    </div>

                                    <Separator />

                                    {supportRequest.order_id && (
                                        <div>
                                            <p className="text-sm text-gray-500">Đơn hàng liên quan:</p>
                                            <Link
                                                href={`/order/${supportRequest.order_id}`}
                                                className="font-medium text-blue-600 hover:text-blue-800 flex items-center"
                                            >
                                                <ShoppingBag className="h-4 w-4 mr-2" />
                                                Đơn hàng #{supportRequest.order_id}
                                            </Link>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-sm text-gray-500">Ngày tạo:</p>
                                        <p className="font-medium">{formatDate(supportRequest.created_at)}</p>
                                    </div>

                                    {supportRequest.resolver && (
                                        <div>
                                            <p className="text-sm text-gray-500">Nhân viên hỗ trợ:</p>
                                            <p className="font-medium">{supportRequest.resolver.name}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hành động */}
                        {canBeCancelled && (
                            <div className="flex flex-col space-y-3">
                                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" className="w-full">Hủy yêu cầu</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Xác nhận hủy yêu cầu hỗ trợ</DialogTitle>
                                            <DialogDescription>
                                                Bạn có chắc chắn muốn hủy yêu cầu hỗ trợ này? Hành động này không thể hoàn tác.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setCancelDialogOpen(false)}
                                                disabled={processing}
                                            >
                                                Đóng
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleCancel}
                                                disabled={processing}
                                            >
                                                {processing ? 'Đang hủy...' : 'Xác nhận hủy'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SupportRequestShow;
