import React from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const handleIncrement = () => {
        if (item.quantity < item.variant.stock_quantity) {
            onUpdateQuantity(item.cart_item_id, item.quantity + 1);
        }
    };

    const handleDecrement = () => {
        if (item.quantity > 1) {
            onUpdateQuantity(item.cart_item_id, item.quantity - 1);
        }
    };

    // Format price in Vietnamese currency
    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN') + 'đ';
    };

    return (
        <div className="flex items-start gap-3 py-3 w-full border-b">
            {/* Product image - maintain aspect ratio */}
            <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border bg-gray-50">
                <img
                    src={item.variant.image_url}
                    alt={item.variant.product.name}
                    className="w-full h-full object-contain"
                />
            </div>

            {/* Product details */}
            <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-medium text-sm truncate">{item.variant.product.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">
                            {item.variant.color.name} - {item.variant.size.name}
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(item.cart_item_id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 flex-shrink-0 ml-2"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                {/* Quantity controls and price */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center border rounded-md">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-r-none p-0"
                            onClick={handleDecrement}
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                            {item.quantity}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-l-none p-0"
                            onClick={handleIncrement}
                            disabled={item.quantity >= item.variant.stock_quantity}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                    <span className="text-sm font-medium">
                        {formatPrice(item.variant.price * item.quantity)}
                    </span>
                </div>
            </div>
        </div>
    );
};
