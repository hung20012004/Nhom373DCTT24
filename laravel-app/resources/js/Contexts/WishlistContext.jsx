import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Thêm state để kích hoạt cập nhật

    // Fetch wishlist ban đầu và khi refreshTrigger thay đổi
    useEffect(() => {
        fetchWishlist();
    }, [refreshTrigger]); // Thêm dependency vào useEffect

    const fetchWishlist = useCallback(async () => {
        setIsLoading(true);
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

    const updateWishlist = useCallback(() => {
        // Thay vì gọi API trực tiếp, chỉ cần trigger refresh
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const removeItem = useCallback(async (wishlistItemId) => {
        try {
            await axios.delete(`/wishlist/${wishlistItemId}`);
            updateWishlist(); // Gọi hàm updateWishlist để trigger refresh
        } catch (error) {
            console.error('Error removing item:', error);
            throw error;
        }
    }, [updateWishlist]);

    const clearWishlist = useCallback(async () => {
        try {
            await axios.delete('/wishlist/');
            updateWishlist(); // Gọi hàm updateWishlist để trigger refresh
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
            updateWishlist(); // Gọi hàm updateWishlist để trigger refresh
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
