import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/Components/cart/CartItem';
import { useCart } from '@/Contexts/CartContext';
import { Link } from '@inertiajs/react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CartDialog = () => {
    const {
        cart,
        isLoading,
        fetchCart,
        updateQuantity,
        removeItem,
        clearCart
    } = useCart();

    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const calculateTotal = () => {
        if (!cart?.items?.length) return 0;
        return cart.items.reduce((total, item) => {
            return total + (item.variant.price * item.quantity);
        }, 0);
    };

    const totalItems = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    const handleUpdateQuantity = async (cartItemId, quantity) => {
        try {
            setIsUpdating(true);
            setError(null);
            await updateQuantity(cartItemId, quantity);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update quantity. Please try again.');
            console.error('Update quantity error:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            setIsUpdating(true);
            setError(null);
            await removeItem(cartItemId);
        } catch (err) {
            setError('Failed to remove item. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClearCart = async () => {
        try {
            setIsUpdating(true);
            setError(null);
            await clearCart();
        } catch (err) {
            setError('Failed to clear cart. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="p-2 relative cursor-pointer inline-flex items-center border-b-2 border-transparent">
                    <ShoppingCart className="h-6 w-6" />
                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {totalItems}
                        </span>
                    )}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Shopping Cart</DialogTitle>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {isLoading || isUpdating ? (
                    <div className="p-4 text-center">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : cart?.items?.length ? (
                    <div className="flex flex-col h-full">
                        <div className="flex-grow max-h-[60vh] overflow-y-auto">
                            {cart.items.map((item) => (
                                <CartItem
                                    key={item.cart_item_id}
                                    item={item}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemove={handleRemoveItem}
                                />
                            ))}
                        </div>

                        <div className="p-4 border-t mt-auto">
                            <div className="flex justify-between mb-4">
                                <span className="font-medium">Total:</span>
                                <span className="font-medium">
                                    ${calculateTotal().toFixed(2)}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleClearCart}
                                    disabled={isUpdating}
                                >
                                    Clear Cart
                                </Button>
                                <Button
                                    className="flex-1"
                                    asChild
                                    disabled={isUpdating}
                                >
                                    <Link href="/checkout">
                                        Checkout
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="mb-4">Your cart is empty</p>
                        <Button asChild>
                            <Link href="/products">Continue Shopping</Link>
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
