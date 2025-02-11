import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCart = useCallback(async () => {
        try {
            const response = await axios.get('/cart');
            setCart(response.data.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateCart = useCallback(async () => {
        try {
            const response = await axios.get('/cart');
            setCart(response.data.data);
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    }, []);

    const updateQuantity = useCallback(async (cartItemId, quantity) => {
        try {
            await axios.put(`/cart/${cartItemId}`, { quantity });
            await updateCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
            throw error; // Thêm throw error để component có thể bắt lỗi
        }
    }, [updateCart]);

    const removeItem = useCallback(async (cartItemId) => {
        try {
            await axios.delete(`/cart/${cartItemId}`);
            await updateCart();
        } catch (error) {
            console.error('Error removing item:', error);
            throw error;
        }
    }, [updateCart]);

    const clearCart = useCallback(async () => {
        try {
            await axios.delete('/cart/');
            await updateCart();
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    }, [updateCart]);

    const addToCart = useCallback(async (variantId, quantity = 1) => {
        try {
            const response = await axios.post('/cart/add', {
                variant_id: variantId,
                quantity: quantity
            });
            await updateCart();
            return {
                success: true,
                message: 'Item added to cart successfully'
            };
        } catch (error) {
            console.error('Error adding to cart:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add item to cart'
            };
        }
    }, [updateCart]);
    const value = {
        cart,
        isLoading,
        fetchCart,
        updateCart,
        updateQuantity,
        removeItem,
        clearCart,
        addToCart // Thêm hàm addToCart vào context
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
