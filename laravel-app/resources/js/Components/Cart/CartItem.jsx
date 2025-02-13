import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    console.log('CartItem data:', item);

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value);
        // Thêm kiểm tra cart_item_id
        if (!item.cart_item_id) {
            console.error('Missing cart_item_id:', item);
            return;
        }

        if (newQuantity > 0 && newQuantity <= item.variant.stock_quantity) {
            onUpdateQuantity(item.cart_item_id, newQuantity);
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 border-b">
            <div className="w-20 h-20 flex-shrink-0">
                {/* <img
                    src={item.variant.product.images[0]?.image_url}
                    alt={item.variant.product.name}
                    className="w-full h-full object-cover rounded"
                /> */}
            </div>
            <div className="flex-grow">
                <h3 className="font-medium">{item.variant.product.name}</h3>
                <p className="text-sm text-gray-500">
                    {item.variant.color.name} - {item.variant.size.name}
                </p>
                <div className="flex items-center gap-4 mt-2">
                    <select
                        value={item.quantity}
                        onChange={handleQuantityChange}
                        className="w-20 rounded border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                        {[...Array(item.variant.stock_quantity)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {i + 1}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm font-medium">
                        ${(item.variant.price * item.quantity).toFixed(2)}
                    </span>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.cart_item_id)}
                className="text-gray-500 hover:text-red-500"
            >
                <Trash2 className="h-5 w-5" />
            </Button>
        </div>
    );
};
