import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Alert,
    AlertDescription,
} from '@/components/ui/alert';

const AddressSection = ({ onAddressSelect }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Form cho địa chỉ mới
    const addressForm = useForm({
        recipient_name: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        street_address: '',
        is_default: false
    });

    // Lấy danh sách địa chỉ của user
    const fetchAddresses = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/shipping-addresses');
            const addressList = response.data;

            setAddresses(addressList);

            // Tự động chọn địa chỉ mặc định nếu có
            const defaultAddress = addressList.find(addr => addr.is_default);
            if (defaultAddress) {
                setSelectedAddress(defaultAddress);
                onAddressSelect(defaultAddress);
            } else if (addressList.length > 0) {
                // Nếu không có địa chỉ mặc định nhưng có địa chỉ, chọn địa chỉ đầu tiên
                setSelectedAddress(addressList[0]);
                onAddressSelect(addressList[0]);
            } else {
                setSelectedAddress(null);
                onAddressSelect(null);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    // Thêm địa chỉ mới
    const handleAddAddress = async (e) => {
        e.preventDefault();
        setValidationErrors({});

        try {
            await axios.post('/shipping-addresses', addressForm.data);
            addressForm.reset();
            setShowNewAddressForm(false);
            await fetchAddresses(); // Tải lại danh sách địa chỉ sau khi thêm
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                setValidationErrors(error.response.data.errors);
            }
            console.error('Error adding address:', error);
        }
    };

    // Xóa địa chỉ
    const handleDeleteAddress = async (id) => {
        if (!id || typeof id !== 'number') {
            console.error("Invalid address ID:", id);
            return;
        }

        try {
            await axios.delete(`/shipping-addresses/${id}`);
            await fetchAddresses(); // Tải lại danh sách địa chỉ sau khi xóa
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    // Đặt địa chỉ mặc định
    const handleSetDefaultAddress = async (id) => {
        if (!id || typeof id !== 'number') {
            console.error("Invalid address ID:", id);
            return;
        }

        try {
            await axios.put(`/shipping-addresses/${id}/set-default`);
            await fetchAddresses(); // Tải lại danh sách địa chỉ sau khi đặt mặc định
        } catch (error) {
            console.error('Error setting default address:', error);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Địa chỉ giao hàng</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-4">
                        <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Địa chỉ giao hàng</CardTitle>
                <CardDescription>
                    Chọn địa chỉ giao hàng hoặc thêm địa chỉ mới
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Danh sách địa chỉ */}
                    {addresses.length > 0 ? (
                        addresses.map((address) => (
                            <div
                                key={address.id}
                                className={`p-4 border rounded-lg cursor-pointer ${
                                    selectedAddress?.id === address.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200'
                                }`}
                                onClick={() => {
                                    setSelectedAddress(address);
                                    onAddressSelect(address);
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{address.recipient_name}</p>
                                        <p className="text-sm text-gray-600">{address.phone}</p>
                                        <p className="text-sm text-gray-600">
                                            {address.street_address}, {address.ward},
                                            {address.district}, {address.province}
                                        </p>
                                        {address.is_default && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                                                Mặc định
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-x-2">
                                        {!address.is_default && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (address.id) {
                                                        handleSetDefaultAddress(address.id);
                                                    }
                                                }}
                                            >
                                                Đặt mặc định
                                            </Button>
                                        )}
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (address.id) {
                                                    handleDeleteAddress(address.id);
                                                }
                                            }}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Alert>
                            <AlertDescription>
                                Bạn chưa có địa chỉ giao hàng nào. Vui lòng thêm địa chỉ mới.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Nút thêm địa chỉ mới */}
                    <Dialog open={showNewAddressForm} onOpenChange={setShowNewAddressForm}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                + Thêm địa chỉ mới
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Thêm địa chỉ mới</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddAddress} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="recipient_name">Người nhận</Label>
                                    <Input
                                        id="recipient_name"
                                        value={addressForm.data.recipient_name}
                                        onChange={e => addressForm.setData('recipient_name', e.target.value)}
                                        required
                                    />
                                    {validationErrors.recipient_name && (
                                        <p className="text-sm text-red-500">{validationErrors.recipient_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input
                                        id="phone"
                                        value={addressForm.data.phone}
                                        onChange={e => addressForm.setData('phone', e.target.value)}
                                        required
                                    />
                                    {validationErrors.phone && (
                                        <p className="text-sm text-red-500">{validationErrors.phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="province">Tỉnh/Thành phố</Label>
                                    <Input
                                        id="province"
                                        value={addressForm.data.province}
                                        onChange={e => addressForm.setData('province', e.target.value)}
                                        required
                                    />
                                    {validationErrors.province && (
                                        <p className="text-sm text-red-500">{validationErrors.province}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="district">Quận/Huyện</Label>
                                    <Input
                                        id="district"
                                        value={addressForm.data.district}
                                        onChange={e => addressForm.setData('district', e.target.value)}
                                        required
                                    />
                                    {validationErrors.district && (
                                        <p className="text-sm text-red-500">{validationErrors.district}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ward">Phường/Xã</Label>
                                    <Input
                                        id="ward"
                                        value={addressForm.data.ward}
                                        onChange={e => addressForm.setData('ward', e.target.value)}
                                        required
                                    />
                                    {validationErrors.ward && (
                                        <p className="text-sm text-red-500">{validationErrors.ward}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="street_address">Địa chỉ chi tiết</Label>
                                    <Input
                                        id="street_address"
                                        value={addressForm.data.street_address}
                                        onChange={e => addressForm.setData('street_address', e.target.value)}
                                        required
                                    />
                                    {validationErrors.street_address && (
                                        <p className="text-sm text-red-500">{validationErrors.street_address}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_default"
                                        checked={addressForm.data.is_default}
                                        onChange={e => addressForm.setData('is_default', e.target.checked)}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="is_default">Đặt làm địa chỉ mặc định</Label>
                                </div>

                                <Button type="submit" className="w-full">
                                    Thêm địa chỉ
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
};

export default AddressSection;
