import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import AddressMap from './AddressMap';
import LocationSelector from './LocationSelector';

const AddressFormDialog = ({ open, onOpenChange, onSuccess, initialPosition }) => {
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mapPosition, setMapPosition] = useState(initialPosition || { lat: 10.762622, lng: 106.660172 });
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);
    const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);

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
        province_code: '',
        district_code: '',
        ward_code: ''
    });

    useEffect(() => {
        if (open) {
            fetchProvinces();
        }
    }, [open]);

    const fetchProvinces = async () => {
        setIsLoadingLocations(true);
        try {
            const response = await axios.get('/api/provinces');
            // Đảm bảo response.data là mảng
            if (Array.isArray(response.data)) {
                const sortedProvinces = response.data
                    .map(p => ({
                        label: p.name,
                        value: p.code,
                        code: p.code
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label));
                setProvinces(sortedProvinces);
                console.log("Provinces loaded:", sortedProvinces.length);
            } else {
                console.error('Dữ liệu tỉnh/thành không phải mảng:', response.data);
                setProvinces([]);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tỉnh/thành:', error);
            setProvinces([]);
        } finally {
            setIsLoadingLocations(false);
        }
    };

    const fetchDistricts = async (provinceCode) => {
        if (!provinceCode) return;
        setIsLoadingLocations(true);
        try {
            const response = await axios.get(`/api/districts/${provinceCode}`);
            const sortedDistricts = response.data.districts
                .map(d => ({
                    label: d.name,
                    value: d.code,
                    code: d.code
                }))
                .sort((a, b) => a.label.localeCompare(b.label));
            setDistricts(sortedDistricts);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách quận/huyện:', error);
        } finally {
            setIsLoadingLocations(false);
        }
    };

    const fetchWards = async (districtCode) => {
        if (!districtCode) return;
        setIsLoadingLocations(true);
        try {
            const response = await axios.get(`/api/wards/${districtCode}`);
            const sortedWards = response.data.wards
                .map(w => ({
                    label: w.name,
                    value: w.code,
                    code: w.code
                }))
                .sort((a, b) => a.label.localeCompare(b.label));
            setWards(sortedWards);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phường/xã:', error);
        } finally {
            setIsLoadingLocations(false);
        }
    };

    // Geocode the selected location to update map position
    const geocodeSelectedLocation = async () => {
        const { province, district, ward, street_address } = addressForm.data;
        if (!province) return;

        setIsGeocodingLocation(true);
        try {
            let query = '';

            // Build a query string with available address components
            if (street_address) query += `${street_address}, `;
            if (ward) query += `${ward}, `;
            if (district) query += `${district}, `;
            if (province) query += `${province}, `;
            query += 'Vietnam';

            // Use Nominatim for geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=vn`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newPosition = { lat: parseFloat(lat), lng: parseFloat(lon) };

                // Update the map position and form
                setMapPosition(newPosition);
                addressForm.setData({
                    ...addressForm.data,
                    latitude: newPosition.lat,
                    longitude: newPosition.lng
                });
            }
        } catch (error) {
            console.error('Error geocoding address:', error);
        } finally {
            setIsGeocodingLocation(false);
        }
    };

    // Add effect to trigger geocoding when location selection changes
    useEffect(() => {
        const { province, district, ward } = addressForm.data;
        if (province && !isLoadingLocations) {
            geocodeSelectedLocation();
        }
    }, [addressForm.data.province, addressForm.data.district, addressForm.data.ward]);

    const handleLocationSelect = (location) => {
        const { lat, lng, address } = location;
        setMapPosition({ lat, lng });

        // Lưu tọa độ
        addressForm.setData({
            ...addressForm.data,
            latitude: lat,
            longitude: lng,
            province: address.state || address.city || '',
            district: address.county || address.suburb || '',
            ward: address.suburb || address.neighbourhood || '',
            street_address: [
                address.road,
                address.house_number
            ].filter(Boolean).join(' ') || location.display_name
        });
    };


    const handleAddAddress = async (e) => {
        e.preventDefault();
        setValidationErrors({});
        setIsSubmitting(true);

        try {
            // Đảm bảo latitude và longitude được gửi đi như kiểu số
            const formData = {
                ...addressForm.data,
                latitude: parseFloat(addressForm.data.latitude) || null,
                longitude: parseFloat(addressForm.data.longitude) || null
            };

            await axios.post('/shipping-addresses', formData);
            addressForm.reset();
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            if (error.response?.data?.errors) {
                setValidationErrors(error.response.data.errors);
            }
            console.error('Error adding address:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Thêm địa chỉ mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin địa chỉ giao hàng mới của bạn
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddAddress} className="space-y-4">
                    {/* Basic info section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="recipient_name">Người nhận</Label>
                            <Input
                                id="recipient_name"
                                value={addressForm.data.recipient_name}
                                onChange={e => addressForm.setData('recipient_name', e.target.value)}
                                className={validationErrors.recipient_name ? 'border-red-500' : ''}
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
                                className={validationErrors.phone ? 'border-red-500' : ''}
                                required
                            />
                            {validationErrors.phone && (
                                <p className="text-sm text-red-500">{validationErrors.phone}</p>
                            )}
                        </div>
                    </div>

                    {/* Map with loading indicator */}
                    <div className="relative">
                        <AddressMap
                            position={mapPosition}
                            setPosition={setMapPosition}
                            onLocationSelect={handleLocationSelect}
                        />
                        {isGeocodingLocation && (
                            <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        )}
                    </div>

                    {/* Location selectors */}
                    <div className="grid grid-cols-3 gap-4">
                        <LocationSelector
                            label="Tỉnh/Thành phố"
                            value={addressForm.data.province}
                            options={provinces}
                            loading={isLoadingLocations}
                            error={validationErrors.province}
                            onChange={(province) => {
                                addressForm.setData({
                                    ...addressForm.data,
                                    province: province.label,
                                    province_code: province.code,
                                    district: '',
                                    district_code: '',
                                    ward: '',
                                    ward_code: ''
                                });
                                fetchDistricts(province.code);
                            }}
                        />
                        <LocationSelector
                            label="Quận/Huyện"
                            value={addressForm.data.district}
                            options={districts}
                            loading={isLoadingLocations}
                            error={validationErrors.district}
                            onChange={(district) => {
                                addressForm.setData({
                                    ...addressForm.data,
                                    district: district.label,
                                    district_code: district.code,
                                    ward: '',
                                    ward_code: ''
                                });
                                fetchWards(district.code);
                            }}
                        />
                        <LocationSelector
                            label="Phường/Xã"
                            value={addressForm.data.ward}
                            options={wards}
                            loading={isLoadingLocations}
                            error={validationErrors.ward}
                            onChange={(ward) => {
                                addressForm.setData({
                                    ...addressForm.data,
                                    ward: ward.label,
                                    ward_code: ward.code
                                });
                            }}
                        />
                    </div>

                    {/* Street address */}
                    <div className="space-y-2">
                        <Label htmlFor="street_address">Địa chỉ chi tiết</Label>
                        <Input
                            id="street_address"
                            value={addressForm.data.street_address}
                            onChange={e => {
                                addressForm.setData('street_address', e.target.value);
                                // Trigger geocoding when street address is edited and blurred
                            }}
                            onBlur={geocodeSelectedLocation}
                            className={validationErrors.street_address ? 'border-red-500' : ''}
                            placeholder="Số nhà, tên đường..."
                            required
                        />
                        {validationErrors.street_address && (
                            <p className="text-sm text-red-500">{validationErrors.street_address}</p>
                        )}
                    </div>

                    {/* Default address checkbox */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="is_default"
                            checked={addressForm.data.is_default}
                            onChange={e => addressForm.setData('is_default', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="is_default">Đặt làm địa chỉ mặc định</Label>
                    </div>

                    {/* Hidden coordinates - change to hidden fields, not inputs */}
                    <input
                        type="hidden"
                        name="latitude"
                        value={addressForm.data.latitude}
                    />
                    <input
                        type="hidden"
                        name="longitude"
                        value={addressForm.data.longitude}
                    />

                    {/* Submit button */}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="ml-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Đang lưu...
                                </>
                            ) : (
                                'Thêm địa chỉ'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddressFormDialog;
