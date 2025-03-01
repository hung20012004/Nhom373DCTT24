import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { useCart } from '@/Contexts/CartContext';
import Layout from '@/Layouts/Layout';
import AddressSection from '@/Components/ShippingAddress/AddressSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';

// Tọa độ cửa hàng
const STORE_LOCATION = { lat: 20.993988, lng: 105.872376 };
const SHIPPING_RATE = 5000; // 5,000đ/km
const FREE_SHIPPING_DISTANCE = 15; // 15km miễn phí

// Hàm tính khoảng cách Haversine
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Bán kính trái đất (km)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const deg2rad = (deg) => deg * (Math.PI / 180);

const CheckoutPage = () => {
    const { cart, isLoading } = useCart();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
    const [shippingFee, setShippingFee] = useState(0);
    const [distance, setDistance] = useState(null);
    const [chargableDistance, setChargableDistance] = useState(0);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
    const [addresses, setAddresses] = useState([]);

    const searchParams = new URLSearchParams(window.location.search);
    const selectedItemIds = searchParams.get('items')?.split(',') || [];

    const { data, setData, post, processing, errors } = useForm({
        shipping_address_id: '',
        payment_method: 'cod', // Changed from paymentMethod to payment_method
        items: selectedItemIds,
        note: '',
        shipping_fee: 0,
    });
    // Fetch địa chỉ và chọn địa chỉ mặc định
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                setIsLoadingAddresses(true);
                const response = await axios.get('/shipping-addresses');
                setAddresses(response.data);

                const defaultAddress = response.data.find((address) => address.is_default);
                if (defaultAddress) {
                    setData((prevData) => ({
                        ...prevData,
                        shipping_address_id: defaultAddress.address_id,
                    }));
                    handleAddressSelect(defaultAddress); // Gọi ngay sau khi setData
                }
            } catch (error) {
                console.error('Lỗi khi lấy địa chỉ:', error);
            } finally {
                setIsLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, []); // Không cần phụ thuộc vào setData

    const handleAddressSelect = (address) => {
        if (!address) {
            setShippingFee(0);
            setDistance(null);
            setChargableDistance(0);
            setData((prevData) => ({
                ...prevData,
                shipping_address_id: '',
                shipping_fee: 0,
            }));
            return;
        }

        setData((prevData) => ({
            ...prevData,
            shipping_address_id: address.address_id,
        }));

        if (address.latitude && address.longitude) {
            const calculatedDistance = calculateDistance(
                STORE_LOCATION.lat,
                STORE_LOCATION.lng,
                address.latitude,
                address.longitude
            );
            const distanceToCharge = Math.max(0, calculatedDistance - FREE_SHIPPING_DISTANCE);
            const finalFee = calculatedDistance <= FREE_SHIPPING_DISTANCE ? 0 : Math.ceil(distanceToCharge * SHIPPING_RATE);

            setDistance(calculatedDistance);
            setChargableDistance(distanceToCharge);
            setShippingFee(finalFee);
            setData((prevData) => ({
                ...prevData,
                shipping_fee: finalFee,
            }));
        } else {
            setShippingFee(0);
            setData((prevData) => ({
                ...prevData,
                shipping_fee: 0,
            }));
        }
    };

    const selectedItems = cart?.items?.filter((item) =>
        item?.cart_item_id && selectedItemIds.includes(item.cart_item_id.toString())
    ) || [];

    const calculateSubtotal = () => {
        return selectedItems.reduce((total, item) => total + item.variant.price * item.quantity, 0);
    };

    const total = calculateSubtotal() + shippingFee;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.shipping_address_id) {
            alert('Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        if (!data.items.length) {
            alert('Không có sản phẩm nào được chọn');
            return;
        }

        post('/order', {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Xử lý sau khi thành công (nếu cần)
            },
            onError: (errors) => {
                console.log('Lỗi khi tạo đơn hàng:', errors);
            },
        });
    };

    if (isLoading || isLoadingAddresses) {
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
                    <div>
                        <AddressSection
                            onAddressSelect={handleAddressSelect}
                            preSelectedAddressId={data.shipping_address_id}
                            addresses={addresses}
                        />
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
                                            onChange={(e) => {
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
                                            onChange={(e) => {
                                                setSelectedPaymentMethod(e.target.value);
                                                setData('paymentMethod', e.target.value);
                                            }}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="vnpay">Thanh toán VNPAY</Label>
                                    </div>
                                    {selectedPaymentMethod === 'vnpay' && (
                                        <Alert>
                                            <AlertDescription>
                                                Bạn sẽ được chuyển đến cổng thanh toán VNPAY để hoàn tất thanh toán {total.toLocaleString('vi-VN')}đ
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="note">Ghi chú</Label>
                                        <Input
                                            id="note"
                                            value={data.note}
                                            onChange={(e) => setData('note', e.target.value)}
                                            placeholder="Ghi chú về đơn hàng..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
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
                                                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-medium">
                                                {(item.variant.price * item.quantity).toLocaleString('vi-VN')}đ
                                            </p>
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
                                                        {distance <= FREE_SHIPPING_DISTANCE
                                                            ? ' (Miễn phí)'
                                                            : ` (Miễn phí ${FREE_SHIPPING_DISTANCE}km đầu, tính phí ${chargableDistance.toFixed(1)}km)`}
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
                                        disabled={processing}
                                    >
                                        {processing ? 'Đang xử lý...' : selectedPaymentMethod === 'vnpay' ? 'Thanh toán với VNPAY' : 'Đặt hàng'}
                                    </Button>
                                    {Object.keys(errors).length > 0 && (
                                        <Alert variant="destructive">
                                            <AlertDescription>
                                                {errors.message || 'Vui lòng kiểm tra lại thông tin'}
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
