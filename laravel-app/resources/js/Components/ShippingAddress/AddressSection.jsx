import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from '@/components/ui/alert';
import AddressList from './AddressList';
import AddressFormDialog from './AddressFormDialog';

const AddressSection = ({ onAddressSelect }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [mapPosition, setMapPosition] = useState({ lat: 10.762622, lng: 106.660172 });

    // Fetch existing addresses
    const fetchAddresses = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/shipping-addresses');
            setAddresses(response.data);

            const defaultAddress = response.data.find(addr => addr.is_default);
            if (defaultAddress) {
                setSelectedAddress(defaultAddress);
                onAddressSelect(defaultAddress);
                if (defaultAddress.latitude && defaultAddress.longitude) {
                    setMapPosition({
                        lat: parseFloat(defaultAddress.latitude),
                        lng: parseFloat(defaultAddress.longitude)
                    });
                }
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

    const handleSetDefaultAddress = async (addressId) => {
        try {
            await axios.put(`/shipping-addresses/${addressId}/set-default`);
            await fetchAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
            return;
        }

        try {
            await axios.delete(`/shipping-addresses/${addressId}`);
            await fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
        onAddressSelect(address);
        if (address.latitude && address.longitude) {
            setMapPosition({
                lat: parseFloat(address.latitude),
                lng: parseFloat(address.longitude)
            });
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Địa chỉ giao hàng</CardTitle>
                <CardDescription>
                    Chọn địa chỉ giao hàng hoặc thêm địa chỉ mới
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : addresses.length > 0 ? (
                        <AddressList
                            addresses={addresses}
                            selectedAddress={selectedAddress}
                            onAddressSelect={handleAddressSelect}
                            onSetDefault={handleSetDefaultAddress}
                            onDelete={handleDeleteAddress}
                        />
                    ) : (
                        <Alert>
                            <AlertDescription>
                                Bạn chưa có địa chỉ giao hàng nào. Vui lòng thêm địa chỉ mới.
                            </AlertDescription>
                        </Alert>
                    )}

                    <AddressFormDialog
                        open={showNewAddressForm}
                        onOpenChange={setShowNewAddressForm}
                        onSuccess={fetchAddresses}
                        initialPosition={mapPosition}
                    />

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowNewAddressForm(true)}
                    >
                        + Thêm địa chỉ mới
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default AddressSection;
