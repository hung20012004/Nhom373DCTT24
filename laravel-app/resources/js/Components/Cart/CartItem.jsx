import React from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await onUpdateQuantity(item.cart_item_id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <img
          src={item.variant.product.image_url || "/api/placeholder/100/100"}
          alt={item.variant.product.name}
          className="w-16 h-16 object-cover rounded"
        />
        <div>
          <h3 className="font-medium">{item.variant.product.name}</h3>
          <p className="text-sm text-gray-500">
            {item.variant.size?.name} - {item.variant.color?.name}
          </p>
          <p className="font-medium">${item.variant.price}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity - 1)}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity + 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.cart_item_id)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
