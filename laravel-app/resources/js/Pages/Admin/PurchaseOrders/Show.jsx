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
import { ArrowLeft, Printer, CheckCircle, XCircle, Edit } from 'lucide-react';
import axios from 'axios';
import PurchaseOrderForm from './PurchaseOrderForm';

export default function Show({ poId }) {
    const [showForm, setShowForm] = useState(false);
    const [purchaseOrder, setPurchaseOrder] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const fetchPurchaseOrder = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/purchase-orders/${poId}`);
            if (response.data && response.data.data) {
                setPurchaseOrder(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải đơn đặt hàng:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchaseOrder();
    }, [poId]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await axios.put(`/admin/api/purchase-orders/${poId}/status`, {
                status: newStatus
            });

            if (response.data.status === 'success') {
                fetchPurchaseOrder();
                alert('Trạng thái đơn đặt hàng đã được cập nhật thành công');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn đặt hàng:', error);
            alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn đặt hàng');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        fetchPurchaseOrder(); // Tải lại thông tin đơn hàng sau khi cập nhật
    };

    const breadcrumbItems = [
        { label: 'Đơn đặt hàng', href: '/admin/purchase-orders' },
        { label: `Chi tiết đơn #${poId}`, href: `/admin/purchase-orders/${poId}` }
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

    if (!purchaseOrder) {
        return (
            <AdminLayout>
                <Head title="Không tìm thấy đơn đặt hàng" />
                <div className="container mx-auto py-6 px-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy đơn đặt hàng</h2>
                        <p className="mt-2 text-gray-600">Đơn đặt hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                        <Button className="mt-4" onClick={() => window.location.href = '/admin/purchase-orders'}>
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
            <Head title={`Đơn đặt hàng #${purchaseOrder.po_id}`} />

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
                        <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn đặt hàng #{purchaseOrder.po_id}</h1>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => window.location.href = '/admin/purchase-orders'}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Quay lại
                            </Button>
                            <Button onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                In đơn
                            </Button>

                            {purchaseOrder.status === 'draft' && (
                                <>
                                     <Button variant="outline" className="bg-blue-50" onClick={() => setShowForm(true)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Chỉnh sửa
                                    </Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange('ordered')}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Đặt hàng
                                    </Button>
                                </>
                            )}

                            {purchaseOrder.status === 'ordered' && (
                                <>
                                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('received')}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Nhận hàng
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleStatusChange('cancelled')}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Hủy đơn
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Phần nội dung sẽ được in */}
                <div className="print-content">
                    {/* Tiêu đề khi in - chỉ hiển thị khi in */}
                    <div className="print-only mb-8">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold">HÓA ĐƠN NHẬP HÀNG</h1>
                            <p className="text-gray-600">Mã đơn: #{purchaseOrder.po_id}</p>
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
                                        <span className="font-medium">#{purchaseOrder.po_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ngày đặt:</span>
                                        <span>{formatDate(purchaseOrder.order_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ngày dự kiến nhận:</span>
                                        <span>{formatDate(purchaseOrder.expected_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[purchaseOrder.status]}`}>
                                            {statusLabels[purchaseOrder.status] || purchaseOrder.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Người tạo:</span>
                                        <span>{purchaseOrder.created_by_user?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ngày tạo:</span>
                                        <span>{formatDate(purchaseOrder.created_at)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin nhà cung cấp</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tên nhà cung cấp:</span>
                                        <span className="font-medium">{purchaseOrder.supplier?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Người liên hệ:</span>
                                        <span>{purchaseOrder.supplier?.contact_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Điện thoại:</span>
                                        <span>{purchaseOrder.supplier?.phone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span>{purchaseOrder.supplier?.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Địa chỉ:</span>
                                        <span className="text-right">{purchaseOrder.supplier?.address}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Chi tiết sản phẩm</CardTitle>
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
                                        {purchaseOrder.details && purchaseOrder.details.map((detail, index) => (
                                            <TableRow key={index} className="hover:bg-gray-50">
                                                <TableCell className="py-4 px-6 text-sm text-gray-900">{index + 1}</TableCell>
                                                <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                    ID: {detail.product_id}
                                                    {detail.product?.name && <span className="block">{detail.product.name}</span>}
                                                    {detail.product?.sku && <span className="text-xs text-gray-500">SKU: {detail.product.sku}</span>}
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
                                        <span className="text-gray-600">Tổng số lượng:</span>
                                        <span className="font-medium">
                                            {purchaseOrder.details?.reduce((sum, item) => sum + parseInt(item.quantity), 0) || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-t border-gray-200">
                                        <span className="text-gray-800 font-medium">Tổng tiền:</span>
                                        <span className="font-bold text-lg">{formatCurrency(purchaseOrder.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {purchaseOrder.note && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Ghi chú</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">{purchaseOrder.note}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Phần chữ ký - chỉ hiển thị khi in */}
                    <div className="print-only mt-8">
                        <div className="grid grid-cols-3 gap-6 text-center mt-20">
                            <div>
                                <p className="font-medium">Người lập phiếu</p>
                                <p className="text-xs text-gray-500">(Ký, họ tên)</p>
                            </div>
                            <div>
                                <p className="font-medium">Người giao hàng</p>
                                <p className="text-xs text-gray-500">(Ký, họ tên)</p>
                            </div>
                            <div>
                                <p className="font-medium">Người nhận hàng</p>
                                <p className="text-xs text-gray-500">(Ký, họ tên)</p>
                            </div>
                        </div>
                    </div>
                </div>
            {/* Add PurchaseOrderForm component */}
            {showForm && (
                    <PurchaseOrderForm
                        purchaseOrder={purchaseOrder}
                        onClose={() => setShowForm(false)}
                        onSuccess={handleFormSuccess}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
