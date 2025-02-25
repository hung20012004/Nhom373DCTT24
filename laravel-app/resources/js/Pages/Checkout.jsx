import React, { useState, useEffect } from 'react';
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

// Tọa độ cửa hàng: 18 Đường Tam Trinh, Hai Bà Trưng, Hà Nội
const STORE_LOCATION = {
    lat: 20.993988,
    lng: 105.872376
};

const SHIPPING_RATE = 5000;

// Khoảng cách miễn phí ship (15km)
const FREE_SHIPPING_DISTANCE = 15;

// Hàm tính khoảng cách giữa 2 điểm theo công thức Haversine
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Bán kính trái đất tính bằng km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Khoảng cách tính bằng km
    return distance;
};

const deg2rad = (deg) => {
    return deg * (Math.PI/180);
};

const CheckoutPage = () => {
    const { cart, isLoading } = useCart();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
    const searchParams = new URLSearchParams(window.location.search);
    const selectedItemIds = searchParams.get('items')?.split(',') || [];
    const [shippingFee, setShippingFee] = useState(0); // Giá mặc định là 0 (miễn phí)
    const [distance, setDistance] = useState(null);
    const [chargableDistance, setChargableDistance] = useState(0);

    // Form cho thông tin đơn hàng
    const { data, setData, post, processing, errors } = useForm({
        shipping_address_id: '',
        paymentMethod: 'cod',
        items: selectedItemIds,
        note: '',
        shipping_fee: shippingFee // Thêm phí ship vào form data
    });

    const handleAddressSelect = async (address) => {
        if (address) {
            setData('shipping_address_id', address.id);

            // Nếu có địa chỉ đã chọn, tính phí ship dựa trên khoảng cách
            try {
                // Giả sử bạn có thể lấy tọa độ từ địa chỉ đã chọn hoặc địa chỉ mặc định
                if (address.latitude && address.longitude) {
                    const customerLocation = {
                        lat: address.latitude,
                        lng: address.longitude
                    };

                    // Tính khoảng cách
                    const calculatedDistance = calculateDistance(
                        STORE_LOCATION.lat,
                        STORE_LOCATION.lng,
                        customerLocation.lat,
                        customerLocation.lng
                    );

                    setDistance(calculatedDistance);

                    // Tính khoảng cách cần tính phí (chỉ tính phần vượt quá 15km)
                    const distanceToCharge = Math.max(0, calculatedDistance - FREE_SHIPPING_DISTANCE);
                    setChargableDistance(distanceToCharge);

                    // Tính phí ship dựa trên khoảng cách vượt quá (10,000đ/km)
                    const calculatedFee = Math.ceil(distanceToCharge * SHIPPING_RATE);

                    // Nếu khoảng cách <= 15km thì miễn phí ship
                    const finalFee = calculatedDistance <= FREE_SHIPPING_DISTANCE ? 0 : calculatedFee;

                    setShippingFee(finalFee);
                    setData('shipping_fee', finalFee);
                } else {
                    // Nếu không có tọa độ, sử dụng phí ship mặc định (0 cho miễn phí 15km đầu)
                    setShippingFee(0);
                    setData('shipping_fee', 0);
                }
            } catch (error) {
                console.error('Lỗi khi tính phí vận chuyển:', error);
                // Sử dụng phí mặc định nếu có lỗi
                setShippingFee(0);
                setData('shipping_fee', 0);
            }
        } else {
            setData('shipping_address_id', '');
            setShippingFee(0);
            setData('shipping_fee', 0);
        }
    };

    const selectedItems = cart?.items?.filter(item =>
        item?.cart_item_id && selectedItemIds.includes(item.cart_item_id.toString())
    ) || [];

    const calculateSubtotal = () => {
        return selectedItems.reduce((total, item) =>
            total + (item.variant.price * item.quantity), 0
        );
    };

    const total = calculateSubtotal() + shippingFee;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.shipping_address_id) {
            alert('Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        // Nếu phương thức thanh toán là VNPAY, chuyển hướng đến cổng thanh toán
        if (data.paymentMethod === 'vnpay') {
            post('/payment/vnpay/create', {
                ...data,
                amount: total,
            });
        } else {
            // Xử lý các phương thức thanh toán khác như cũ
            post('/checkout', {
                onSuccess: () => {
                    // Xử lý sau khi thanh toán thành công
                },
            });
        }
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
                                            id="vnpay"
                                            name="paymentMethod"
                                            value="vnpay"
                                            checked={selectedPaymentMethod === 'vnpay'}
                                            onChange={e => {
                                                setSelectedPaymentMethod(e.target.value);
                                                setData('paymentMethod', e.target.value);
                                            }}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="vnpay" className="flex items-center space-x-2">
                                            <span>Thanh toán VNPAY</span>
                                            <img
                                                src="/images/vnpay-logo.png"
                                                alt="VNPAY"
                                                className="h-6"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </Label>
                                    </div>

                                    {selectedPaymentMethod === 'vnpay' && (
                                        <Alert>
                                            <AlertDescription>
                                                Bạn sẽ được chuyển đến cổng thanh toán VNPAY để hoàn tất thanh toán số tiền {total.toLocaleString('vi-VN')}đ
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
                                            <div className="text-right">
                                                <div>{shippingFee.toLocaleString('vi-VN')}đ</div>
                                                {distance && (
                                                    <div className="text-sm text-gray-500">
                                                        {distance.toFixed(1)} km
                                                        {distance <= FREE_SHIPPING_DISTANCE ?
                                                            " (Miễn phí)" :
                                                            ` (Miễn phí ${FREE_SHIPPING_DISTANCE}km đầu, tính phí ${chargableDistance.toFixed(1)}km)`
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between font-medium text-lg pt-2 border-t">
                                            <span>Tổng cộng:</span>
                                            <span>{total.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    </div>

                                    <Button
                                        className={`w-full ${selectedPaymentMethod === 'vnpay' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                        onClick={handleSubmit}
                                        disabled={processing || !data.shipping_address_id}
                                    >
                                        {processing ? 'Đang xử lý...' : selectedPaymentMethod === 'vnpay' ? 'Thanh toán với VNPAY' : 'Đặt hàng'}
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
