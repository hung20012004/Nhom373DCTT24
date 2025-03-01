import React from 'react';
import { Button } from '@/components/ui/button';

const AddressList = ({
    addresses,
    selectedAddress,
    onAddressSelect,
    onSetDefault,
    onDelete
}) => {
    return (
        <div className="space-y-3">
            {addresses.map((address) => (
                <div
                    key={address.address_id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress?.address_id === address.address_id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onAddressSelect(address)}
                >
                    <div className="flex justify-between">
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
                        <div className="space-y-2 flex flex-col items-end">
                            {!address.is_default && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSetDefault(address.address_id);
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
                                    onDelete(address.address_id);
                                }}
                            >
                                Xóa
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AddressList;
