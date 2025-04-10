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
import { ArrowLeft, Printer, CheckCircle, Edit } from 'lucide-react';
import axios from 'axios';
import InventoryCheckForm from './InventoryCheckForm';

export default function Show({ checkId }) {
    const [showForm, setShowForm] = useState(false);
    const [inventoryCheck, setInventoryCheck] = useState(null);
    const [loading, setLoading] = useState(true);

    const statusLabels = {
        'draft': 'Nháp',
        'completed': 'Đã hoàn thành'
    };

    const statusClasses = {
        'pending': 'bg-gray-100 text-gray-800',
        'completed': 'bg-green-100 text-green-800'
    };

    const fetchInventoryCheck = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/inventory-checks/${checkId}`);
            if (response.data && response.data.data) {
                setInventoryCheck(response.data.data);
            }console.log(response.data.data);
        } catch (error) {
            console.error('Lỗi khi tải phiếu kiểm kê:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventoryCheck();
    }, [checkId]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await axios.put(`/admin/inventory-checks/${checkId}/status`, {
                status: newStatus
            });

            if (response.data.status === 'success') {
                fetchInventoryCheck();
                alert('Trạng thái phiếu kiểm kê đã được cập nhật thành công');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái phiếu kiểm kê:', error);
            alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái phiếu kiểm kê');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        fetchInventoryCheck(); // Tải lại thông tin phiếu kiểm kê sau khi cập nhật
    };

    const changePercentage = (difference, systemQuantity) => {
        if (systemQuantity === 0) return 0;
        return ((difference / systemQuantity) * 100).toFixed(2);
    };

    // Calculate total surplus and shortage from inventory check details
    const calculateTotalDiscrepancies = () => {
        if (!inventoryCheck?.details) return { totalSurplus: 0, totalShortage: 0 };

        let totalSurplus = 0;
        let totalShortage = 0;

        inventoryCheck.details.forEach(item => {
            if (item.difference > 0) {
                totalSurplus += item.difference;
            } else if (item.difference < 0) {
                totalShortage += Math.abs(item.difference);
            }
        });

        return { totalSurplus, totalShortage };
    };

    const breadcrumbItems = [
        { label: 'Kiểm kê kho', href: '/admin/inventory-checks' },
        { label: `Chi tiết phiếu #${checkId}`, href: `/admin/inventory-checks/${checkId}` }
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

    if (!inventoryCheck) {
        return (
            <AdminLayout>
                <Head title="Không tìm thấy phiếu kiểm kê" />
                <div className="container mx-auto py-6 px-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy phiếu kiểm kê</h2>
                        <p className="mt-2 text-gray-600">Phiếu kiểm kê bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                        <Button className="mt-4" onClick={() => window.location.href = '/admin/inventory-checks'}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại danh sách
                        </Button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const { totalSurplus, totalShortage } = calculateTotalDiscrepancies();

    return (
        <AdminLayout>
            <Head title={`Phiếu kiểm kê #${inventoryCheck.check_id}`} />

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
                        <h1 className="text-3xl font-bold text-gray-900">Chi tiết phiếu kiểm kê #{inventoryCheck.check_id}</h1>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => window.location.href = '/admin/inventory-checks'}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Quay lại
                            </Button>
                            {inventoryCheck.status === 'completed' && (
                                <Button onClick={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    In phiếu
                                </Button>
                            )}

                            {inventoryCheck.status === 'pending' && (
                                <>
                                    <Button variant="outline" className="bg-blue-50" onClick={() => setShowForm(true)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Chỉnh sửa
                                    </Button>
                                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('completed')}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Hoàn thành
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
                            <h1 className="text-2xl font-bold">PHIẾU KIỂM KÊ KHO</h1>
                            <p className="text-gray-600">Mã phiếu: #{inventoryCheck.check_id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin phiếu kiểm kê</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mã phiếu:</span>
                                        <span className="font-medium">#{inventoryCheck.check_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ngày kiểm kê:</span>
                                        <span>{formatDate(inventoryCheck.check_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[inventoryCheck.status]}`}>
                                            {statusLabels[inventoryCheck.status] || inventoryCheck.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Người tạo:</span>
                                        <span>{inventoryCheck.created_by_user?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ngày tạo:</span>
                                        <span>{formatDate(inventoryCheck.created_at)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tổng quan kiểm kê</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tổng sản phẩm kiểm kê:</span>
                                        <span className="font-medium">{inventoryCheck.total_products || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tổng thừa:</span>
                                        <span className="font-medium text-green-600">
                                            +{totalSurplus}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tổng thiếu:</span>
                                        <span className="font-medium text-red-600">
                                            -{totalShortage}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Số sản phẩm có chênh lệch:</span>
                                        <span className="font-medium">
                                            {inventoryCheck.details?.filter(item => item.difference !== 0).length || 0}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Chi tiết kiểm kê</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</TableHead>
                                            <TableHead className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</TableHead>
                                            <TableHead className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">SL hệ thống</TableHead>
                                            <TableHead className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">SL thực tế</TableHead>
                                            <TableHead className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Chênh lệch</TableHead>
                                            <TableHead className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Chênh lệch</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {inventoryCheck.details && inventoryCheck.details.map((detail, index) => (
                                            <TableRow key={index} className={`hover:bg-gray-50 ${detail.difference !== 0 ? 'bg-yellow-50' : ''}`}>
                                                <TableCell className="py-4 px-6 text-sm text-gray-900">{index + 1}</TableCell>
                                                <TableCell className="py-4 px-6 text-sm text-gray-900">
                                                    ID: {detail.product_id}
                                                    {detail.product?.name && <span className="block">{detail.product.name}</span>}
                                                    {detail.product?.sku && <span className="text-xs text-gray-500">SKU: {detail.product.sku}</span>}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-sm text-gray-900 text-right">{detail.system_quantity}</TableCell>
                                                <TableCell className="py-4 px-6 text-sm text-gray-900 text-right">{detail.actual_quantity}</TableCell>
                                                <TableCell className={`py-4 px-6 text-sm text-right font-medium ${detail.difference > 0 ? 'text-green-600' : detail.difference < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {detail.difference > 0 ? '+' : ''}{detail.difference}
                                                </TableCell>
                                                <TableCell className={`py-4 px-6 text-sm text-right ${changePercentage(detail.difference, detail.system_quantity) > 0 ? 'text-green-600' : changePercentage(detail.difference, detail.system_quantity) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {changePercentage(detail.difference, detail.system_quantity) > 0 ? '+' : ''}{changePercentage(detail.difference, detail.system_quantity)}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {inventoryCheck.note && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Ghi chú</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">{inventoryCheck.note}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Phần chữ ký - chỉ hiển thị khi in */}
                    <div className="print-only mt-8">
                        <div className="grid grid-cols-2 gap-6 text-center mt-20">
                            <div>
                                <p className="font-medium">Người kiểm kê</p>
                                <p className="text-xs text-gray-500">(Ký, họ tên)</p>
                            </div>
                            <div>
                                <p className="font-medium">Người quản lý kho</p>
                                <p className="text-xs text-gray-500">(Ký, họ tên)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add InventoryCheckForm component */}
                {showForm && (
                    <InventoryCheckForm
                        inventoryCheck={inventoryCheck}
                        onClose={() => setShowForm(false)}
                        onSuccess={handleFormSuccess}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
