import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "@inertiajs/react";

// WishlistItem component
const WishlistItem = ({ item, onRemove }) => {
    return (
        <div className="flex items-center gap-4 p-4 border-b">
            <img
                src={item.product.thumbnail_url || "/api/placeholder/100/100"}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-grow">
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-gray-600">${item.product.price.toFixed(2)}</p>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
            >
                Remove
            </Button>
        </div>
    );
};

// Main WishlistDialog component
export const WishlistDialog = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchWishlist = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/wishlist');
            const data = await response.json();
            if (data.status === 'success') {
                setWishlistItems(data.data);
            }
        } catch (err) {
            setError("Failed to fetch wishlist");
            console.error("Fetch wishlist error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemoveItem = async (wishlistId) => {
        try {
            setIsUpdating(true);
            setError(null);
            const response = await fetch(`/wishlist/${wishlistId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.status === 'success') {
                setWishlistItems(data.data);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError("Failed to remove item. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClearWishlist = async () => {
        try {
            setIsUpdating(true);
            setError(null);
            const response = await fetch('/wishlist/clear', {
                method: 'POST',
            });
            const data = await response.json();
            if (data.status === 'success') {
                setWishlistItems([]);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError("Failed to clear wishlist. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="p-2 relative cursor-pointer inline-flex items-center border-b-2 border-transparent">
                    <Heart className="h-6 w-6" />
                    {wishlistItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {wishlistItems.length}
                        </span>
                    )}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Wishlist</DialogTitle>
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
                ) : wishlistItems.length > 0 ? (
                    <div className="flex flex-col h-full">
                        <div className="flex-grow max-h-[60vh] overflow-y-auto">
                            {wishlistItems.map((item) => (
                                <WishlistItem
                                    key={item.id}
                                    item={item}
                                    onRemove={handleRemoveItem}
                                />
                            ))}
                        </div>

                        <div className="p-4 border-t mt-auto">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleClearWishlist}
                                    disabled={isUpdating}
                                >
                                    Clear Wishlist
                                </Button>
                                <Button
                                    className="flex-1"
                                    asChild
                                    disabled={isUpdating}
                                >
                                    <Link href="/products">Continue Shopping</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="mb-4">Your wishlist is empty</p>
                        <Button asChild>
                            <Link href="/products">Continue Shopping</Link>
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
