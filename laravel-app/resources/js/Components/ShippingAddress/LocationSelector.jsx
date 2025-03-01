import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown } from "lucide-react";
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

const LocationSelector = ({ label, value, onChange, options, loading, error }) => {
    const [open, setOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState([]);

    // Initialize filtered options with all options
    useEffect(() => {
        if (options && options.length > 0) {
            setFilteredOptions(options);
        } else {
            setFilteredOptions([]);
        }
    }, [options]);

    // Handle search directly within the component without exposing UI search box
    const handleSearch = (searchValue) => {
        if (!options) return;

        if (searchValue.trim() === '') {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter(option =>
                option.label.toLowerCase().includes(searchValue.toLowerCase())
            );
            setFilteredOptions(filtered);
        }
    };

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
                        <span className="truncate">{value || `Chọn ${label}`}</span>
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        ) : (
                            <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder={`Tìm ${label.toLowerCase()}...`}
                            onValueChange={handleSearch}
                            className="border-none focus:ring-0"
                        />
                        {loading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Đang tải...</span>
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <CommandEmpty className="py-6 text-center text-sm">
                                Không tìm thấy địa chỉ
                            </CommandEmpty>
                        ) : (
                            <CommandGroup className="max-h-64 overflow-y-auto">
                                {filteredOptions.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        className="flex items-center py-2 px-2 cursor-pointer hover:bg-gray-100"
                                        onSelect={() => {
                                            onChange(option);
                                            setOpen(false);
                                        }}
                                    >
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default LocationSelector;
