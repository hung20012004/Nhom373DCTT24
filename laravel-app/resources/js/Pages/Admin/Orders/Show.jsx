import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import { Button } from '@/Components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowLeft, Printer, CheckCircle, XCircle, Edit, Truck } from 'lucide-react';
import axios from 'axios';

export default function Show({ orderId }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const paymentStatusLabels = {
        'pending': 'Chưa thanh toán',
        'paid': 'Đã thanh toán',
        'refunded': 'Đã hoàn tiền',
        'failed': 'Thanh toán thất bại'
    };

    const paymentStatusClasses = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'paid': 'bg-green-100 text-green-800',
        'refunded': 'bg-purple-100 text-purple-800',
        'failed': 'bg-red-100 text-red-800',
    };

    const orderStatusLabels = {
        'new': 'Mới tạo',
        'processing': 'Đang xử lý',
        'shipping': 'Đang giao hàng',
        'delivered': 'Đã giao hàng',
        'cancelled': 'Đã hủy',
    };

    const statusClasses = {
        'new': 'bg-blue-100 text-blue-800',
        'processing': 'bg-purple-100 text-purple-800',
        'shipping': 'bg-indigo-100 text-indigo-800',
        'delivered': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800',
    };

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/orders/${orderId}`);
            if (response.data && response.data.data) {
                setOrder(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await axios.put(`/admin/orders/${orderId}/status`, {
                status: newStatus
            });

            if (response.data.status === 'success') {
                fetchOrder();
                alert('Trạng thái đơn hàng đã được cập nhật thành công');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
            alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
        }
    };

    const handlePaymentStatusChange = async (newStatus) => {
        try {
            const response = await axios.put(`/admin/orders/${orderId}/payment-status`, {
                status: newStatus
            });

            if (response.data.status === 'success') {
                fetchOrder();
                alert('Trạng thái thanh toán đã được cập nhật thành công');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
            alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái thanh toán');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const breadcrumbItems = [
        { label: 'Đơn hàng', href: '/admin/orders' },
        { label: `Chi tiết đơn #${orderId}`, href: `/admin/orders/${orderId}` }
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

    if (!order) {
        return (
            <AdminLayout>
                <Head title="Không tìm thấy đơn hàng" />
                <div className="container mx-auto py-6 px-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy đơn hàng</h2>
                        <p className="mt-2 text-gray-600">Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                        <Button className="mt-4" onClick={() => window.location.href = '/admin/orders'}>
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
            <Head title={`Đơn hàng #${order.order_id}`} />

            {/* Thêm style cho phần in ấn */}
            <style>
                {`
                @media print {
                    /* Ẩn tất cả các phần khác khi in */
                    body * {
                        visibility: hidden;
                    }
                    /* Chỉ hiển thị phần nội dung cần in */
                    .print-content, .print-content * {
                        visibility: visible;
                    }
                    /* Định vị phần nội dung in ở vị trí đầu trang */
                    .print-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    /* Hiển thị các phần chỉ dành cho in */
                    .print-only {
                        display: block !important;
                        visibility: visible;
                    }
                    /* Ẩn các nút không cần thiết khi in */
                    .no-print {
                        display: none !important;
                    }
                }
                /* Ẩn các phần chỉ dành cho in trong chế độ hiển thị thông thường */
                .print-only {
                    display: none;
                }
                `}
            </style>

            <div className="container mx-auto py-6 px-4">
                <div className="no-print">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng #{order.order_id}</h1>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => window.location.href = '/admin/orders'}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Quay lại
                            </Button>
                            <Button onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                In đơn
                            </Button>

                            {order.order_status === 'pending' && (
                                <>
                                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange('processing')}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Xác nhận
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleStatusChange('cancelled')}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Hủy đơn
                                    </Button>
                                </>
                            )}

                            {order.order_status === 'processing' && (
                                <>
                                    <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => handleStatusChange('shipping')}>
                                        <Truck className="mr-2 h-4 w-4" />
                                        Giao hàng
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleStatusChange('cancelled')}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Hủy đơn
                                    </Button>
                                </>
                            )}

                            {order.order_status === 'shipping' && (
                                <>
                                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('completed')}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Hoàn thành
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleStatusChange('cancelled')}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Hủy đơn
                                    </Button>
                                </>
                            )}

                            {order.payment_status === 'pending' && order.order_status === 'delivered' && (
                                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handlePaymentStatusChange('paid')}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Đánh dấu đã thanh toán
                                </Button>
                                )
                            }

                            {order.payment_status === 'paid' && order.order_status === 'cancelled' && (
                                <Button className="bg-red-600 hover:bg-red-700" onClick={() => handlePaymentStatusChange('refunded')}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Đánh dấu đã hoàn tiền
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Phần nội dung sẽ được in */}
                <div className="print-content">
                    {/* Tiêu đề khi in - chỉ hiển thị khi in */}
                    <div className="print-only mb-8">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold">HÓA ĐƠN BÁN HÀNG</h1>
                            <p className="text-gray-600">Mã đơn: #{order.order_id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin đơn hàng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mã đơn:</span>
                                        <span className="font-medium">#{order.order_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ngày đặt:</span>
                                        <span>{formatDate(order.order_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Trạng thái đơn hàng:</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[order.order_status]}`}>
                                            {orderStatusLabels[order.order_status] || order.order_status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phương thức thanh toán:</span>
                                        <span>{order.payment_method}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Trạng thái thanh toán:</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusClasses[order.payment_status]}`}>
                                            {paymentStatusLabels[order.payment_status] || order.payment_status}
                                        </span>
                                    </div>
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
                                           <span className="text-gray-600">Người nhận:</span>
                                            <span className="font-medium">{order.shipping_address?.recipient_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Điện thoại:</span>
                                            <span>{order.shipping_address?.phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Địa chỉ:</span>
                                            <span className="text-right">{order.shipping_address?.street_address}, {order.shipping_address?.ward}, {order.shipping_address?.district}, {order.shipping_address?.province}</span>
                                        </div>
                                    </div>
                                </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Chi tiết đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</TableHead>
                                            <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</TableHead>
                                            <TableHead className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</TableHead>
                                            <TableHead className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</TableHead>
                                            <TableHead className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.details && order.details.map((detail, index) => (
                                            <TableRow key={index} className="hover:bg-gray-50">
                                                <TableCell className="py-4 px-6 text-sm text-gray-900">{index + 1}</TableCell>
                                                <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        {detail.variant?.image_url && (
                                                            <img
                                                                src={detail.variant.image_url}
                                                                alt={detail.variant?.product?.name}
                                                                className="w-12 h-12 mr-3 object-cover rounded"
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="font-medium">{detail.variant?.product?.name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {detail.variant?.attribute_values?.map(attr => attr.value).join(', ')}
                                                            </div>
                                                            <div className="text-xs text-gray-500">SKU: {detail.variant?.sku}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-sm text-gray-900 text-right">{detail.quantity}</TableCell>
                                                <TableCell className="py-4 px-6 text-sm text-gray-900 text-right">{formatCurrency(detail.unit_price)}</TableCell>
                                                <TableCell className="py-4 px-6 text-sm text-gray-900 font-medium text-right">{formatCurrency(detail.subtotal)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="mt-6 flex flex-col items-end">
                                <div className="w-full max-w-md space-y-2">
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Tổng tiền hàng:</span>
                                        <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    {order.discount_amount > 0 && (
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-600">Giảm giá:</span>
                                            <span className="font-medium text-red-600">-{formatCurrency(order.discount_amount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Phí vận chuyển:</span>
                                        <span className="font-medium">{formatCurrency(order.shipping_fee)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-t border-gray-200">
                                        <span className="text-gray-800 font-medium">Tổng thanh toán:</span>
                                        <span className="font-bold text-lg">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {order.note && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Ghi chú</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">{order.note}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Phần chữ ký - chỉ hiển thị khi in */}
                    <div className="print-only mt-8">
                        <div className="grid grid-cols-2 gap-6 text-center mt-20">
                            <div>
                                <p className="font-medium">Người bán hàng</p>
                                <p className="text-xs text-gray-500">(Ký, họ tên)</p>
                            </div>
                            <div>
                                <p className="font-medium">Người nhận hàng</p>
                                <p className="text-xs text-gray-500">(Ký, họ tên)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
