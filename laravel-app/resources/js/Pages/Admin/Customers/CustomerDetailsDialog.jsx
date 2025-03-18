import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { User, Mail, Phone, Calendar, MapPin, CreditCard, ShoppingBag } from 'lucide-react';

// Order status translations and color mapping
const ORDER_STATUS = {
    'new': { label: 'Mới', color: 'bg-blue-100 text-blue-800' },
    'processing': { label: 'Đang xử lý', color: 'bg-purple-100 text-purple-800' },
    'confirmed': { label: 'Đã xác nhận', color: 'bg-indigo-100 text-indigo-800' },
    'preparing': { label: 'Đang chuẩn bị', color: 'bg-cyan-100 text-cyan-800' },
    'packed': { label: 'Đã đóng gói', color: 'bg-teal-100 text-teal-800' },
    'shipping': { label: 'Đang giao hàng', color: 'bg-yellow-100 text-yellow-800' },
    'delivered': { label: 'Đã giao hàng', color: 'bg-green-100 text-green-800' },
    'cancelled': { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
    'completed': { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    'pending': { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' }
};

const CustomerDetailsDialog = ({ customerId, onClose, isOpen }) => {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');

    console.log('CustomerDetailsDialog rendered with:', { customerId, isOpen });

    useEffect(() => {
        const fetchCustomerDetails = async () => {
            if (!customerId) {
                console.log('No customerId provided, skipping fetch');
                return;
            }

            console.log('Fetching customer details for ID:', customerId);
            try {
                setLoading(true);
                console.log('API call started to:', `/admin/customers/${customerId}`);
                const response = await axios.get(`/admin/customers/${customerId}`);
                console.log('API response received:', response);
                console.log('Customer data:', response.data);
                setCustomer(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching customer details:', err);
                console.log('Error details:', err.response?.data || err.message);
                setError('Không thể tải thông tin khách hàng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
                console.log('Loading state set to false');
            }
        };

        if (isOpen) {
            console.log('Dialog is open, initiating data fetch');
            fetchCustomerDetails();
        } else {
            console.log('Dialog is closed, skipping data fetch');
        }
    }, [customerId, isOpen]);

    console.log('Current state:', { customer, loading, error, activeTab });

    if (!isOpen) {
        console.log('Dialog is not open, returning null');
        return null;
    }

    // Loading state
    if (loading) {
        console.log('Rendering loading state');
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl">
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Error state
    if (error) {
        console.log('Rendering error state:', error);
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Lỗi</DialogTitle>
                    </DialogHeader>
                    <div className="text-red-500 py-4">{error}</div>
                    <DialogFooter>
                        <Button onClick={onClose}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    // No customer data
    if (!customer) {
        console.log('No customer data available');
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Không tìm thấy thông tin</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">Không tìm thấy thông tin khách hàng.</div>
                    <DialogFooter>
                        <Button onClick={onClose}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    // Helper function to get order status display info
    const getOrderStatusInfo = (status) => {
        return ORDER_STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    };

    console.log('Rendering customer dialog with data:', customer);
    console.log('Default shipping address:', customer.defaultShippingAddress);
    console.log('Orders data:', customer.orders);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <User className="h-6 w-6" />
                        Chi tiết khách hàng
                    </DialogTitle>
                </DialogHeader>

                {/* Customer header info */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex flex-col md:flex-row justify-between">
                        <div>
                            <h2 className="text-xl font-bold">{customer.full_name || 'Chưa cập nhật tên'}</h2>
                            <p className="text-gray-600">{customer.email}</p>
                        </div>
                        <div className="mt-2 md:mt-0">
                            <Badge className={customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {customer.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">ID: {customer.user_id}</p>
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={(value) => {
                    console.log('Tab changed to:', value);
                    setActiveTab(value);
                }} className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="personal">Thông tin cá nhân</TabsTrigger>
                        <TabsTrigger value="address">Địa chỉ</TabsTrigger>
                        <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
                    </TabsList>

                    {/* Tab: Thông tin cá nhân */}
                    <TabsContent value="personal" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                    <User className="h-4 w-4" />
                                    Thông tin liên hệ
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">Email:</span>
                                        <span className="text-sm font-medium">{customer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">Điện thoại:</span>
                                        <span className="text-sm font-medium">{customer.phone || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">Ngày sinh:</span>
                                        <span className="text-sm font-medium">
                                            {customer.date_of_birth ? formatDate(customer.date_of_birth) : 'Chưa cập nhật'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">Giới tính:</span>
                                        <span className="text-sm font-medium">{customer.gender || 'Chưa cập nhật'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                    <CreditCard className="h-4 w-4" />
                                    Thông tin tài khoản
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Trạng thái:</span>
                                        <Badge className={customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {customer.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Đăng nhập cuối:</span>
                                        <span className="text-sm font-medium">
                                            {customer.last_login ? formatDate(customer.last_login, true) : 'Chưa có thông tin'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Ngày đăng ký:</span>
                                        <span className="text-sm font-medium">
                                            {customer.created_at ? formatDate(customer.created_at, true) : 'Chưa có thông tin'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab: Địa chỉ */}
                    <TabsContent value="address">
                        {customer.defaultShippingAddress ? (
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
                                    <MapPin className="h-4 w-4" />
                                    Địa chỉ giao hàng mặc định
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium">{customer.defaultShippingAddress.recipient_name || customer.full_name}</p>
                                    <p className="text-gray-700">{customer.defaultShippingAddress.street_address}</p>
                                    <p className="text-gray-700">
                                        {customer.defaultShippingAddress.ward}, {customer.defaultShippingAddress.district}
                                    </p>
                                    <p className="text-gray-700">{customer.defaultShippingAddress.province}</p>
                                    <p className="text-gray-700">SĐT: {customer.defaultShippingAddress.phone || customer.phone || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-lg text-center">
                                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">Khách hàng chưa cập nhật địa chỉ giao hàng</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Tab: Đơn hàng */}
                    <TabsContent value="orders">
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
                                <ShoppingBag className="h-4 w-4" />
                                Đơn hàng gần đây
                            </h3>
                            {customer.orders && customer.orders.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {customer.orders.map(order => {
                                        const statusInfo = getOrderStatusInfo(order.order_status);
                                        return (
                                          <tr key={order.order_id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{order.order_id}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(order.created_at)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{order.total_amount?.toLocaleString() || 0} đ</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                                              <Badge className={statusInfo.color}>
                                                {statusInfo.label}
                                              </Badge>
                                            </td>
                                          </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="bg-gray-50 p-6 rounded-lg text-center">
                                    <ShoppingBag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">Khách hàng chưa có đơn hàng nào</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={() => {
                        console.log('Close button clicked');
                        onClose();
                    }}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerDetailsDialog;
