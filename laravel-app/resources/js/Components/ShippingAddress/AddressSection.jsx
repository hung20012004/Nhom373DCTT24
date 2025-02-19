import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
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
const GOOGLE_MAPS_API_KEY = import.meta.env.GOOGLE_MAPS_API_KEY;

const AddressSection = ({ onAddressSelect }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [coordinates, setCoordinates] = useState({
        lat: 20.9977, // VCT Tam Trinh default location
        lng: 105.8621
    });
    const [shippingFee, setShippingFee] = useState(0);

    const storeLocation = {
        lat: 20.9977, // VCT Tam Trinh store location
        lng: 105.8621
    };

    const addressForm = useForm({
        recipient_name: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        street_address: '',
        is_default: false,
        latitude: '',
        longitude: '',
        shipping_fee: 0
    });

    // Calculate distance between two points (in km)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // Calculate shipping fee based on distance
    const calculateShippingFee = (distance) => {
        if (distance <= 2) return 15000;
        if (distance <= 5) return 30000;
        return 30000 + Math.ceil((distance - 5) * 5000);
    };

    // Handle map click event
    const handleMapClick = async (event) => {
        const newCoordinates = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        };
        setCoordinates(newCoordinates);

        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newCoordinates.lat},${newCoordinates.lng}&key=${GOOGLE_MAPS_API_KEY}`
            );

            if (response.data.results[0]) {
                const addressComponents = response.data.results[0].address_components;
                let formattedAddress = {
                    street_address: '',
                    ward: '',
                    district: '',
                    province: ''
                };

                addressComponents.forEach(component => {
                    if (component.types.includes('street_number') || component.types.includes('route')) {
                        formattedAddress.street_address += component.long_name + ' ';
                    } else if (component.types.includes('sublocality_level_1')) {
                        formattedAddress.ward = component.long_name;
                    } else if (component.types.includes('administrative_area_level_2')) {
                        formattedAddress.district = component.long_name;
                    } else if (component.types.includes('administrative_area_level_1')) {
                        formattedAddress.province = component.long_name;
                    }
                });

                addressForm.setData({
                    ...addressForm.data,
                    street_address: formattedAddress.street_address.trim(),
                    ward: formattedAddress.ward,
                    district: formattedAddress.district,
                    province: formattedAddress.province,
                    latitude: newCoordinates.lat,
                    longitude: newCoordinates.lng
                });

                // Calculate and set shipping fee
                const distance = calculateDistance(
                    storeLocation.lat,
                    storeLocation.lng,
                    newCoordinates.lat,
                    newCoordinates.lng
                );
                const fee = calculateShippingFee(distance);
                setShippingFee(fee);
                addressForm.setData('shipping_fee', fee);
            }
        } catch (error) {
            console.error('Error getting address:', error);
        }
    };

    // Existing fetch addresses function
    const fetchAddresses = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/shipping-addresses');
            const addressList = response.data;

            setAddresses(addressList);

            const defaultAddress = addressList.find(addr => addr.is_default);
            if (defaultAddress) {
                setSelectedAddress(defaultAddress);
                onAddressSelect(defaultAddress);
                setCoordinates({
                    lat: parseFloat(defaultAddress.latitude),
                    lng: parseFloat(defaultAddress.longitude)
                });
            } else if (addressList.length > 0) {
                setSelectedAddress(addressList[0]);
                onAddressSelect(addressList[0]);
                setCoordinates({
                    lat: parseFloat(addressList[0].latitude),
                    lng: parseFloat(addressList[0].longitude)
                });
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

    // Modified form submission handler
    const handleAddAddress = async (e) => {
        e.preventDefault();
        setValidationErrors({});

        try {
            await axios.post('/shipping-addresses', {
                ...addressForm.data,
                shipping_fee: shippingFee
            });
            addressForm.reset();
            setShowNewAddressForm(false);
            await fetchAddresses();
        } catch (error) {
            if (error.response?.data?.errors) {
                setValidationErrors(error.response.data.errors);
            }
            console.error('Error adding address:', error);
        }
    };

    // Xóa địa chỉ
    const handleDeleteAddress = async (address) => {
        if (!address || typeof address !== 'object') {
            console.error("Invalid address ID:", address.address_id);
            return;
        }

        try {
            await axios.delete(`/shipping-addresses/${address.address_id}`);
            await fetchAddresses(); // Tải lại danh sách địa chỉ sau khi xóa
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    // Đặt địa chỉ mặc định
    const handleSetDefaultAddress = async (address) => {
        if (!address || typeof address !== 'object') {
            console.error("Invalid address ID:", address.address_id);
            return;
        }

        try {
            await axios.put(`/shipping-addresses/${address.address_id}/set-default`);
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
                                                    if (address) {
                                                        handleSetDefaultAddress(address);
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
                                                if (address) {
                                                    handleDeleteAddress(address);
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
                        <DialogContent className="max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>Thêm địa chỉ mới</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Map Section */}
                                <div className="h-[600px]">
                                    <LoadScript googleMapsApiKey = {GOOGLE_MAPS_API_KEY}>
                                        <GoogleMap
                                            mapContainerStyle={{ width: '100%', height: '100%' }}
                                            center={coordinates}
                                            zoom={15}
                                            onClick={handleMapClick}
                                        >
                                            <Marker position={coordinates} />
                                            <Marker
                                                position={storeLocation}
                                                icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                                            />
                                        </GoogleMap>
                                    </LoadScript>
                                </div>
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

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="ward">Phường/Xã</Label>
                                            <Input
                                                id="ward"
                                                value={addressForm.data.ward}
                                                onChange={e => addressForm.setData('ward', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="district">Quận/Huyện</Label>
                                            <Input
                                                id="district"
                                                value={addressForm.data.district}
                                                onChange={e => addressForm.setData('district', e.target.value)}
                                                required
                                            />
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
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
};

export default AddressSection;
