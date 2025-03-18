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
import { Search, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const OrderIndex = ({ orders }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeStatus, setActiveStatus] = useState('all');

    // Filter orders based on search term and active status
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.order_id.toString().includes(searchTerm) ||
                             (order.shipping_address && order.shipping_address.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()));

        if (activeStatus === 'all') return matchesSearch;
        return matchesSearch && order.order_status === activeStatus;
    });

    const getStatusBadge = (status) => {
        switch(status) {
            case 'new':
                return { label: 'Mới', color: 'bg-blue-500' };
            case 'processing':
                return { label: 'Đang xử lý', color: 'bg-orange-500' };
            case 'confirmed':
                return { label: 'Đã xác nhận', color: 'bg-teal-500' };
            case 'preparing':
                return { label: 'Đang chuẩn bị hàng', color: 'bg-yellow-500' };
            case 'packed':
                return { label: 'Đã đóng hàng', color: 'bg-indigo-500' };
            case 'shipping':
                return { label: 'Đang giao hàng', color: 'bg-purple-500' };
            case 'delivered':
                return { label: 'Đã giao hàng', color: 'bg-green-500' };
            case 'cancelled':
                return { label: 'Đã hủy', color: 'bg-red-500' };
            case 'completed':
                return { label: 'Đã nhận hàng', color: 'bg-green-500' };
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const statusOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'new', label: 'Mới' },
        { value: 'processing', label: 'Đang xử lý' },
        { value: 'confirmed', label: 'Đã xác nhận' },
        { value: 'preparing', label: 'Đang chuẩn bị hàng' },
        { value: 'packed', label: 'Đã đóng hàng' },
        { value: 'shipping', label: 'Đang giao' },
        { value: 'delivered', label: 'Đã giao' },
        { value: 'completed', label: 'Đã nhận hàng' },
        { value: 'cancelled', label: 'Đã hủy' }
    ];

    return (
        <Layout>
            <Head title="Đơn hàng của tôi" />

            <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                        <div>
                            <CardTitle className="text-2xl font-bold mb-1">Đơn hàng của tôi</CardTitle>
                            <p className="text-gray-600">Quản lý và theo dõi đơn hàng của bạn</p>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Tìm kiếm đơn hàng..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Status filter buttons */}
                        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
                            {statusOptions.map(status => (
                                <Button
                                    key={status.value}
                                    variant={activeStatus === status.value ? "default" : "outline"}
                                    onClick={() => setActiveStatus(status.value)}
                                    className={activeStatus === status.value ? "text-white" : ""}
                                >
                                    {status.label}
                                </Button>
                            ))}
                        </div>

                        {filteredOrders.length > 0 ? (
                            <div className="space-y-4">
                                {filteredOrders.map((order) => (
                                    <Card key={order.order_id} className="overflow-hidden">
                                        <div className="bg-gray-50 p-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b">
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <ShoppingBag className="h-5 w-5 text-gray-600" />
                                                    <h3 className="font-semibold">Đơn hàng #{order.order_id}</h3>
                                                    <Badge className={getStatusBadge(order.order_status).color + " text-white"}>
                                                        {getStatusBadge(order.order_status).label}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Ngày đặt: {formatDate(order.order_date)}
                                                </p>
                                            </div>
                                            <div className="mt-2 md:mt-0 text-right">
                                                <p className="text-lg font-medium">{formatCurrency(order.total_amount)}</p>
                                                <Badge className={getPaymentBadge(order.payment_status).color + " text-white mt-1"}>
                                                    {getPaymentBadge(order.payment_status).label}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="space-y-3">
                                                {order.details && order.details.length > 0 ? (
                                                    order.details.slice(0, 2).map((detail) => (
                                                        <div key={detail.order_detail_id} className="flex items-center space-x-3">
                                                            <img
                                                                src={detail.variant && detail.variant.image_url ? detail.variant.image_url : '/placeholder.png'}
                                                                alt={detail.variant ? detail.variant.name : 'Sản phẩm'}
                                                                className="w-16 h-16 object-cover rounded"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="font-medium">{detail.variant ? detail.variant.product.name : 'Sản phẩm'}</p>
                                                                <p className="text-xs text-gray-500 mb-2">
                                                                    {detail.variant.color.name} - {detail.variant.size.name}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {formatCurrency(detail.unit_price)} x {detail.quantity}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 text-center py-2">Chi tiết đơn hàng đang được tải...</p>
                                                )}

                                                {order.details && order.details.length > 2 && (
                                                    <p className="text-gray-500 text-sm">
                                                        +{order.details.length - 2} sản phẩm khác
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center mt-4 pt-3 border-t">
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        {order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'VNPAY'}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {order.shipping_address ? order.shipping_address.recipient_name : 'Đang tải thông tin...'}
                                                    </p>
                                                </div>
                                                <Button asChild variant="outline">
                                                    <Link href={`/order/${order.order_id}`}>Chi tiết</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">Không tìm thấy đơn hàng</h3>
                                <p className="mt-1 text-gray-500">
                                    {searchTerm ? 'Không tìm thấy đơn hàng phù hợp với tìm kiếm của bạn.' : 'Bạn chưa có đơn hàng nào.'}
                                </p>
                                {!searchTerm && (
                                    <div className="mt-6">
                                        <Button asChild>
                                            <Link href="/products">Mua sắm ngay</Link>
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

export default OrderIndex;
