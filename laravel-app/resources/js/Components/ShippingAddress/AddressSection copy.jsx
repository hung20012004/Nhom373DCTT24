import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import debounce from 'lodash/debounce';
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
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Alert,
    AlertDescription,
} from '@/components/ui/alert';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2 } from "lucide-react";

// Fix Leaflet's default icon issue
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Component to update map view when position changes
const MapUpdater = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([position.lat, position.lng], map.getZoom());
    }, [position, map]);
    return null;
};

const MapEvents = ({ onLocationSelect }) => {
    const map = useMap();

    useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&countrycodes=vn`
                );
                const data = await response.json();

                // Chỉ xử lý nếu địa chỉ thuộc Việt Nam
                if (data.address.country_code === 'vn') {
                    onLocationSelect({
                        lat,
                        lng,
                        address: data.address,
                        display_name: data.display_name
                    });
                }
            } catch (error) {
                console.error('Error getting address:', error);
            }
        },
    });
    return null;
};
// Updated Combobox component for location selection
const LocationCombobox = ({ label, value, onChange, options, loading, error }) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const hasSearched = searchValue.length > 0;

    return (
        <div className="flex flex-col space-y-2">
            <Label>{label}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={`justify-between w-full ${error ? 'border-red-500' : ''}`}
                        role="combobox"
                    >
                        {value || `Chọn ${label}`}
                        {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder={`Tìm ${label.toLowerCase()}...`}
                            value={searchValue}
                            onValueChange={setSearchValue}
                        />
                        <CommandEmpty>
                            {loading ? (
                                <div className="flex items-center justify-center py-2">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Đang tải...
                                </div>
                            ) : hasSearched ? (
                                'Không tìm thấy địa chỉ'
                            ) : null}
                        </CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-y-auto">
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        onChange(option);
                                        setOpen(false);
                                        setSearchValue('');
                                    }}
                                >
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};
// Main component
const AddressSection = ({ onAddressSelect }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [mapPosition, setMapPosition] = useState({ lat: 10.762622, lng: 106.660172 });
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

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

    // Updated debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query) => {
            setSearchValue(query); // Cập nhật giá trị tìm kiếm
            if (!query) {
                setSearchResults([]);
                return;
            }

            setIsLoadingLocations(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}, Việt Nam&format=json&addressdetails=1&limit=5&countrycodes=vn`
                );
                const data = await response.json();
                const validResults = data.filter(item => item.address.country_code === 'vn');
                setSearchResults(validResults.map(item => ({
                    label: item.display_name,
                    value: item.place_id,
                    lat: parseFloat(item.lat),
                    lon: parseFloat(item.lon),
                    address: item.address
                })));
            } catch (error) {
                console.error('Lỗi khi tìm kiếm:', error);
            } finally {
                setIsLoadingLocations(false);
            }
        }, 300),
        []
    );
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

    // Updated fetch administrative regions functions
    const fetchProvinces = async () => {
        setIsLoadingLocations(true);
        try {
            const response = await axios.get('/api/provinces');
            const sortedProvinces = response.data
                .map(p => ({
                    label: p.name,
                    value: p.code,
                    code: p.code
                }))
                .sort((a, b) => a.label.localeCompare(b.label));
            setProvinces(sortedProvinces);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tỉnh/thành:', error);
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

    useEffect(() => {
        fetchAddresses();
        fetchProvinces();
    }, []);

    const handleLocationSelect = (location) => {
        const { lat, lng, address } = location;
        setMapPosition({ lat, lng });
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

    const handleSearchSelect = async (result) => {
        const newPosition = {
            lat: result.lat,
            lng: result.lon
        };
        setMapPosition(newPosition);

        // Extract địa chỉ từ kết quả tìm kiếm
        const address = result.address;
        const provinceName = address.city || address.province || address.state;
        const districtName = address.district || address.county || address.suburb;
        const wardName = address.suburb || address.ward || address.neighbourhood;

        // Cập nhật form với thông tin địa chỉ
        if (provinceName) {
            const provinceCode = getProvinceCode(provinceName);
            if (provinceCode) {
                addressForm.setData('province', provinceName);
                addressForm.setData('province_code', provinceCode);
                await fetchDistricts(provinceCode);

                if (districtName) {
                    const districtCode = getDistrictCode(districtName, provinceCode);
                    if (districtCode) {
                        addressForm.setData('district', districtName);
                        addressForm.setData('district_code', districtCode);
                        await fetchWards(districtCode);

                        if (wardName) {
                            addressForm.setData('ward', wardName);
                            const ward = wards.find(w =>
                                w.label.toLowerCase() === wardName.toLowerCase()
                            );
                            if (ward) {
                                addressForm.setData('ward_code', ward.code);
                            }
                        }
                    }
                }
            }
        }

        // Cập nhật địa chỉ chi tiết
        const streetAddress = [
            address.house_number,
            address.road,
            address.street
        ].filter(Boolean).join(' ');

        addressForm.setData(prev => ({
            ...prev,
            latitude: result.lat,
            longitude: result.lon,
            street_address: streetAddress || result.display_name
        }));
    };

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

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setValidationErrors({});
        setIsSubmitting(true);

        try {
            await axios.post('/shipping-addresses', addressForm.data);
            addressForm.reset();
            setShowNewAddressForm(false);
            await fetchAddresses();
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
                        addresses.map((address) => (
                            <div
                                key={address.address_id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                    selectedAddress?.id === address.address_id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => {
                                    setSelectedAddress(address);
                                    onAddressSelect(address);
                                    if (address.latitude && address.longitude) {
                                        setMapPosition({
                                            lat: parseFloat(address.latitude),
                                            lng: parseFloat(address.longitude)
                                        });
                                    }
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
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
                                                    handleSetDefaultAddress(address.address_id);
                                                }}
                                            >
                                                Đặt mặc định
                                            </Button>
                                        )}
                                        <Button
                                            variant="destructive"
                                            size="sm" onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteAddress(address.address_id);
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

                    <Dialog open={showNewAddressForm} onOpenChange={setShowNewAddressForm}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                + Thêm địa chỉ mới
                            </Button>
                        </DialogTrigger>
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

                                {/* Search box */}
                                <div className="space-y-2">
            <Label>Tìm kiếm địa chỉ</Label>
            <Command className="rounded-lg border shadow-md">
                <CommandInput
                    placeholder="Nhập địa chỉ để tìm kiếm..."
                    onValueChange={(value) => {
                        setSearchValue(value);
                        debouncedSearch(value);
                    }}
                />
                <CommandEmpty>
                    {isLoadingLocations ? (
                        <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Đang tìm kiếm...
                        </div>
                    ) : searchResults.length === 0 && searchValue ? (
                        'Không tìm thấy địa chỉ'
                    ) : null}
                </CommandEmpty>
                <CommandGroup className="max-h-48 overflow-y-auto">
                    {searchResults.map((result) => (
                        <CommandItem
                            key={result.value}
                            onSelect={() => handleSearchSelect(result)}
                        >
                            {result.label}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </Command>
        </div>

                                {/* Map */}
                                <div className="h-64 rounded-lg overflow-hidden border">
                                    <MapContainer
                                        center={[mapPosition.lat, mapPosition.lng]}
                                        zoom={13}
                                        className="h-full w-full"
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <Marker
                                            position={[mapPosition.lat, mapPosition.lng]}
                                            icon={icon}
                                        />
                                        <MapEvents onLocationSelect={handleLocationSelect} />
                                        <MapUpdater position={mapPosition} />
                                    </MapContainer>
                                </div>

                                {/* Location selectors */}
                                <div className="grid grid-cols-3 gap-4">
                                    <LocationCombobox
                                        label="Tỉnh/Thành phố"
                                        value={addressForm.data.province}
                                        onChange={(province) => {
                                            addressForm.setData('province', province.label);
                                            addressForm.setData('province_code', province.code);
                                            addressForm.setData('district', '');
                                            addressForm.setData('district_code', '');
                                            addressForm.setData('ward', '');
                                            addressForm.setData('ward_code', '');
                                            fetchDistricts(province.code);
                                        }}
                                        options={provinces}
                                        loading={isLoadingLocations}
                                        error={validationErrors.province}
                                    />
                                    <LocationCombobox
                                        label="Quận/Huyện"
                                        value={addressForm.data.district}
                                        onChange={(district) => {
                                            addressForm.setData('district', district.label);
                                            addressForm.setData('district_code', district.code);
                                            addressForm.setData('ward', '');
                                            addressForm.setData('ward_code', '');
                                            fetchWards(district.code);
                                        }}
                                        options={districts}
                                        loading={isLoadingLocations}
                                        error={validationErrors.district}
                                    />
                                    <LocationCombobox
                                        label="Phường/Xã"
                                        value={addressForm.data.ward}
                                        onChange={(ward) => {
                                            addressForm.setData('ward', ward.label);
                                            addressForm.setData('ward_code', ward.code);
                                        }}
                                        options={wards}
                                        loading={isLoadingLocations}
                                        error={validationErrors.ward}
                                    />
                                </div>

                                {/* Street address */}
                                <div className="space-y-2">
                                    <Label htmlFor="street_address">Địa chỉ chi tiết</Label>
                                    <Input
                                        id="street_address"
                                        value={addressForm.data.street_address}
                                        onChange={e => addressForm.setData('street_address', e.target.value)}
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

                                {/* Hidden coordinates */}
                                <input
                                    type="hidden"
                                    value={addressForm.data.latitude}
                                    onChange={e => addressForm.setData('latitude', e.target.value)}
                                />
                                <input
                                    type="hidden"
                                    value={addressForm.data.longitude}
                                    onChange={e => addressForm.setData('longitude', e.target.value)}
                                />

                                {/* Submit button */}
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowNewAddressForm(false)}
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
                </div>
            </CardContent>
        </Card>
    );
};

export default AddressSection;
