import React, { useState } from 'react';
import { Head, Link, useForm, router  } from '@inertiajs/react';
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
    Package,
    Truck,
    ShoppingBag,
    MapPin,
    Calendar,
    CreditCard,
    ClipboardList,
    AlertCircle,
    Box,
    PackageCheck,
    CheckCircle
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const OrderShow = ({ order }) => {
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const { toast } = useToast();

    const form = useForm({
        reason: '',
    });

    // Get status badge properties
    const getStatusBadge = (status) => {
        switch(status) {
            case 'new':
                return { label: 'Mới tạo', color: 'bg-blue-500' };
            case 'confirmed':
                return { label: 'Đã xác nhận', color: 'bg-green-700' };
            case 'processing':
                return { label: 'Đang xử lý', color: 'bg-orange-500' };
            case 'preparing':
                return { label: 'Đang chuẩn bị hàng', color: 'bg-yellow-500' };
            case 'packed':
                return { label: 'Đã đóng gói', color: 'bg-purple-500' };
            case 'shipping':
                return { label: 'Đang giao hàng', color: 'bg-indigo-500' };
            case 'delivered':
                return { label: 'Đã giao hàng', color: 'bg-green-500' };
            case 'cancelled':
                return { label: 'Đã hủy', color: 'bg-red-500' };
            default:
                return { label: 'Khác', color: 'bg-gray-500' };
        }
    };

    // Get payment status badge properties
    const getPaymentBadge = (status) => {
        switch(status) {
            case 'paid':
                return { label: 'Đã thanh toán', color: 'bg-green-500' };
            case 'pending':
                return { label: 'Chờ thanh toán', color: 'bg-yellow-500' };
            case 'awaiting_payment':
                return { label: 'Chờ thanh toán', color: 'bg-yellow-500' };
            default:
                return { label: 'Chưa thanh toán', color: 'bg-red-500' };
        }
    };

    // Format date to local Vietnamese format
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'new':
                return <ShoppingBag className="h-6 w-6" />;
            case 'confirmed':
                return <CheckCircle className="h-6 w-6" />;
            case 'processing':
                return <Package className="h-6 w-6" />;
            case 'preparing':
                return <Box className="h-6 w-6" />;
            case 'packed':
                return <PackageCheck className="h-6 w-6" />;
            case 'shipping':
                return <Truck className="h-6 w-6" />;
            case 'delivered':
                return <ClipboardList className="h-6 w-6" />;
            case 'cancelled':
                return <AlertCircle className="h-6 w-6" />;
            default:
                return <ShoppingBag className="h-6 w-6" />;
        }
    };

    const handleCancelOrder = () => {
        setCancelling(true);

        router.post(`/order/${order.order_id}/cancel`, {
            reason: form.data.reason,
        }, {
            onSuccess: () => {
                setCancelling(false);
                setCancelDialogOpen(false);
                toast({
                    title: "Thành công",
                    description: "Đơn hàng đã được hủy thành công.",
                });
                // Reload the page to reflect changes
                router.reload();
            },
            onError: (errors) => {
                setCancelling(false);
                toast({
                    title: "Lỗi",
                    description: errors.error || "Đã xảy ra lỗi khi hủy đơn hàng",
                    variant: "destructive",
                });
            },
            onFinish: () => {
                setCancelling(false);
            }
        });
    };

    const renderOrderHistory = () => {
        if (!order.history || order.history.length === 0) {
            return (
                <div className="text-center py-4">
                    <p className="text-gray-500">Chưa có lịch sử trạng thái đơn hàng.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {order.history.map((historyItem, index) => (
                    <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                            <div className="bg-gray-100 rounded-full p-2">
                                {getStatusIcon(historyItem.status)}
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">
                                {getStatusBadge(historyItem.status).label}
                            </p>
                            <p className="text-sm text-gray-600">
                                {historyItem.comment}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {formatDate(historyItem.created_at)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };


    // Check if order can be cancelled
    const canBeCancelled = ['new', 'processing', 'preparing', 'packed'].includes(order.order_status);

    return (
        <Layout>
            <Head title={`Chi tiết đơn hàng #${order.order_id}`} />

            <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Button asChild variant="ghost" className="p-0 mb-2">
                        <Link href="/order">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại danh sách đơn hàng
                        </Link>
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <h1 className="text-2xl font-bold flex items-center">
                            Chi tiết đơn hàng #{order.order_id}
                            <Badge className={`ml-3 ${getStatusBadge(order.order_status).color} text-white`}>
                                {getStatusBadge(order.order_status).label}
                            </Badge>
                        </h1>
                        <p className="text-gray-600 mt-1 md:mt-0">
                            Ngày đặt: {formatDate(order.order_date)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cột chi tiết sản phẩm */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Sản phẩm đã đặt */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Sản phẩm đã đặt</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.details && order.details.length > 0 ? (
                                        order.details.map((detail) => (
                                            <div key={detail.order_detail_id} className="flex items-center space-x-4 py-3 border-b last:border-0">
                                                <img
                                                    src={detail.variant && detail.variant.image_url ? detail.variant.image_url : '/placeholder.png'}
                                                    alt={detail.variant ? detail.variant.name : 'Sản phẩm'}
                                                    className="w-20 h-24 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{detail.variant ? detail.variant.product.name : 'Sản phẩm'}</h3>
                                                    <p className="text-xs text-gray-500 mb-2">
                                                        {detail.variant.color.name} - {detail.variant.size.name}
                                                    </p>
                                                    {detail.variant && detail.variant.attributes && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {Object.entries(detail.variant.attributes).map(([key, value]) =>
                                                                `${key}: ${value}`
                                                            ).join(', ')}
                                                        </p>
                                                    )}
                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="text-gray-600">
                                                        {formatCurrency(detail.unit_price)} x {detail.quantity}</p>
                                                        <p className="font-medium"> {formatCurrency(detail.subtotal)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-3">Không có thông tin sản phẩm.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lịch sử đơn hàng */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Lịch sử đơn hàng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {renderOrderHistory()}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cột thông tin đơn hàng */}
                    <div className="space-y-6">
                        {/* Tóm tắt đơn hàng */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Tóm tắt đơn hàng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tạm tính:</span>
                                        <span> {formatCurrency(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phí vận chuyển:</span>
                                        <span> {formatCurrency(order.shipping_fee)}</span>
                                    </div>
                                    {order.discount_amount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Giảm giá:</span>
                                            <span>- {formatCurrency(order.discount_amount)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between font-medium">
                                        <span>Tổng cộng:</span>
                                        <span className="text-lg"> {formatCurrency(order.total_amount)}</span>
                                    </div>

                                    <div className="mt-3 pt-3 border-t">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Trạng thái thanh toán:</span>
                                            <Badge className={getPaymentBadge(order.payment_status).color + " text-white"}>
                                                {getPaymentBadge(order.payment_status).label}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2 flex items-center">
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            {order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'VNPAY'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin giao hàng */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Thông tin giao hàng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {order.shipping_address ? (
                                    <div className="space-y-3">
                                        <p className="font-medium">{order.shipping_address.recipient_name}</p>
                                        <p className="text-gray-600">{order.shipping_address.phone}</p>
                                        <p className="text-gray-600 flex items-start">
                                            <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                                            <span>
                                                {order.shipping_address.address}, {order.shipping_address.ward}, {order.shipping_address.district}, {order.shipping_address.province}
                                            </span>
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-3">Không có thông tin giao hàng.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Ghi chú */}
                        {order.note && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">Ghi chú</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">{order.note}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Hành động */}
                        <div className="flex space-x-3">
                            <Button variant="outline" className="flex-1">Liên hệ hỗ trợ</Button>
                            {canBeCancelled && (
                                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" className="flex-1">Hủy đơn hàng</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
                                            <DialogDescription>
                                                Bạn có chắc chắn muốn hủy đơn hàng #{order.order_id}? Hành động này không thể hoàn tác.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">Lý do hủy đơn hàng (tùy chọn):</p>
                                                <Textarea
                                                    placeholder="Nhập lý do hủy đơn hàng..."
                                                    value={form.data.reason}
                                                    onChange={(e) => form.setData('reason', e.target.value)}
                                                    className="w-full"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setCancelDialogOpen(false)}
                                                disabled={cancelling}
                                            >
                                                Đóng
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleCancelOrder}
                                                disabled={cancelling}
                                            >
                                                {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default OrderShow;
