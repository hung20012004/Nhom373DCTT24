import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWishlist = useCallback(async () => {
        try {
            const response = await axios.get('/wishlist');
            setWishlist(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setWishlist([]); // Set a default empty array on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateWishlist = useCallback(async () => {
        try {
            const response = await axios.get('/wishlist');
            setWishlist(response.data.data);
        } catch (error) {
            console.error('Error updating wishlist:', error);
        }
    }, []);

    const removeItem = useCallback(async (wishlistItemId) => {
        try {
            await axios.delete(`/wishlist/${wishlistItemId}`);
            await updateWishlist();
        } catch (error) {
            console.error('Error removing item:', error);
            throw error;
        }
    }, [updateWishlist]);

    const clearWishlist = useCallback(async () => {
        try {
            await axios.delete('/wishlist/');
            await updateWishlist();
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            throw error;
        }
    }, [updateWishlist]);

    const addToWishlist = useCallback(async (productId) => {
        try {
            const response = await axios.post('/wishlist/add', {
                product_id: productId
            });
            await updateWishlist();
            return {
                success: true,
                message: 'Item added to wishlist successfully'
            };
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add item to wishlist'
            };
        }
    }, [updateWishlist]);

    const value = {
        wishlist,
        isLoading,
        fetchWishlist,
        updateWishlist,
        removeItem,
        clearWishlist,
        addToWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
