import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CartItem } from './CartItem';
import axios from 'axios';

export const CartDialog = () => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const response = await axios.get('/api/cart');
      setCart(response.data.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await axios.put(`/api/cart/items/${cartItemId}`, { quantity });
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await axios.delete(`/api/cart/items/${cartItemId}`);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart/clear');
      await fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const calculateTotal = () => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.variant.price * item.quantity);
    }, 0);
  };

  const totalItems = cart?.items?.length || 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="p-2 relative cursor-pointer inline-flex items-center border-b-2 border-transparent">
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems}
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Shopping Cart</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : cart?.items?.length ? (
          <div className="max-h-[60vh] overflow-y-auto">
            {cart.items.map((item) => (
              <CartItem
                key={item.cart_item_id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
            <div className="p-4 border-t">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-medium">${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
                <Button className="w-full">
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            Your cart is empty
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
