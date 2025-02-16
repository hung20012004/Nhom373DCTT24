import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { useCart } from '@/Contexts/CartContext';
import Layout from '@/Layouts/Layout';
import AddressSection from '@/Components/ShippingAddress/AddressSection';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Alert,
    AlertDescription,
} from '@/components/ui/alert';

const CheckoutPage = () => {
    const { cart, isLoading } = useCart();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
    const searchParams = new URLSearchParams(window.location.search);
    const selectedItemIds = searchParams.get('items')?.split(',') || [];

    // Form cho thông tin đơn hàng
    const { data, setData, post, processing, errors } = useForm({
        shipping_address_id: '',
        paymentMethod: 'cod',
        items: selectedItemIds,
        note: ''
    });

    const handleAddressSelect = (address) => {
        if (address) {
            setData('shipping_address_id', address.id);
        } else {
            setData('shipping_address_id', '');
        }
    };

    const selectedItems = cart?.items?.filter(item =>
        selectedItemIds.includes(item.cart_item_id.toString())
    ) || [];

    const calculateSubtotal = () => {
        return selectedItems.reduce((total, item) =>
            total + (item.variant.price * item.quantity), 0
        );
    };

    const shippingFee = 30000;
    const total = calculateSubtotal() + shippingFee;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.shipping_address_id) {
            alert('Vui lòng chọn địa chỉ giao hàng');
            return;
        }
        post('/checkout', {
            onSuccess: () => {
                // Xử lý sau khi thanh toán thành công
            },
        });
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Head title="Thanh toán" />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold mb-6">Thanh toán</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Form thông tin thanh toán */}
                    <div>
                        <AddressSection onAddressSelect={handleAddressSelect} />

                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Phương thức thanh toán</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="cod"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={selectedPaymentMethod === 'cod'}
                                            onChange={e => {
                                                setSelectedPaymentMethod(e.target.value);
                                                setData('paymentMethod', e.target.value);
                                            }}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="cod">Thanh toán khi nhận hàng (COD)</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="banking"
                                            name="paymentMethod"
                                            value="banking"
                                            checked={selectedPaymentMethod === 'banking'}
                                            onChange={e => {
                                                setSelectedPaymentMethod(e.target.value);
                                                setData('paymentMethod', e.target.value);
                                            }}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="banking">Chuyển khoản ngân hàng</Label>
                                    </div>

                                    {selectedPaymentMethod === 'banking' && (
                                        <Alert>
                                            <AlertDescription>
                                                Thông tin tài khoản ngân hàng sẽ được gửi qua email sau khi đặt hàng
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="note">Ghi chú</Label>
                                        <Input
                                            id="note"
                                            value={data.note}
                                            onChange={e => setData('note', e.target.value)}
                                            placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Thông tin đơn hàng */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin đơn hàng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {selectedItems.map((item) => (
                                        <div key={item.cart_item_id} className="flex justify-between py-2 border-b">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={item.variant.image || '/placeholder.png'}
                                                    alt={item.variant.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div>
                                                    <p className="font-medium">{item.variant.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Số lượng: {item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {(item.variant.price * item.quantity).toLocaleString('vi-VN')}đ
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="space-y-2 pt-4">
                                        <div className="flex justify-between">
                                            <span>Tạm tính:</span>
                                            <span>{calculateSubtotal().toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Phí vận chuyển:</span>
                                            <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-lg pt-2 border-t">
                                            <span>Tổng cộng:</span>
                                            <span>{total.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full"
                                        onClick={handleSubmit}
                                        disabled={processing || !data.shipping_address_id}
                                    >
                                        {processing ? 'Đang xử lý...' : 'Đặt hàng'}
                                    </Button>

                                    {Object.keys(errors).length > 0 && (
                                        <Alert variant="destructive">
                                            <AlertDescription>
                                                Vui lòng kiểm tra lại thông tin
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CheckoutPage;
