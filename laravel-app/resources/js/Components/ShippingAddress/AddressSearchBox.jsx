import React, { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Loader2 } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import debounce from 'lodash/debounce';

const AddressSearchBox = ({ onSelectResult }) => {
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query) => {
            if (!query || query.trim() === '') {
                setSearchResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                        query
                    )}, Việt Nam&format=json&addressdetails=1&limit=5&countrycodes=vn`
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
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300),
        []
    );

    const handleInputChange = (value) => {
        setSearchValue(value);
        debouncedSearch(value);
    };

    return (
        <div className="space-y-2">
            <Label>Tìm kiếm địa chỉ</Label>
            <Command className="rounded-lg border shadow-md overflow-visible">
                <CommandInput
                    placeholder="Nhập địa chỉ để tìm kiếm..."
                    value={searchValue}
                    onValueChange={handleInputChange}
                    className="h-9" // Đảm bảo chiều cao phù hợp
                />
                {(searchResults.length > 0 || isLoading) && (
                    <CommandGroup className="max-h-48 overflow-y-auto">
                        {isLoading && (
                            <div className="flex items-center justify-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Đang tìm kiếm...
                            </div>
                        )}

                        {!isLoading && searchResults.length === 0 && searchValue && (
                            <CommandEmpty>
                                Không tìm thấy địa chỉ
                            </CommandEmpty>
                        )}

                        {searchResults.map((result) => (
                            <CommandItem
                                key={result.value}
                                onSelect={() => {
                                    onSelectResult(result);
                                    setSearchValue(''); // Clear after selection
                                    setSearchResults([]); // Hide results
                                }}
                            >
                                {result.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </Command>
        </div>
    );
};

export default AddressSearchBox;
