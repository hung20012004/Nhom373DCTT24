import React, { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/Components/cart/CartItem";
import { useCart } from "@/Contexts/CartContext";
import { Link } from "@inertiajs/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

export const CartDialog = () => {
    const {
        cart,
        isLoading,
        fetchCart,
        updateQuantity,
        removeItem,
        clearCart,
    } = useCart();

    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const calculateTotal = () => {
        if (!cart?.items?.length) return 0;
        return cart.items.reduce((total, item) => {
            if (selectedItems.has(item.cart_item_id)) {
                return total + item.variant.price * item.quantity;
            }
            return total;
        }, 0);
    };

    const totalItems =
        cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    const handleUpdateQuantity = async (cartItemId, quantity) => {
        try {
            setIsUpdating(true);
            setError(null);
            await updateQuantity(cartItemId, quantity);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Không thể cập nhật số lượng. Vui lòng thử lại."
            );
            console.error("Lỗi cập nhật số lượng:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            setIsUpdating(true);
            setError(null);
            await removeItem(cartItemId);
            setSelectedItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartItemId);
                return newSet;
            });
        } catch (err) {
            setError("Không thể xóa sản phẩm. Vui lòng thử lại.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClearCart = async () => {
        try {
            setIsUpdating(true);
            setError(null);
            await clearCart();
            setSelectedItems(new Set());
            setSelectAll(false);
        } catch (err) {
            setError("Không thể xóa giỏ hàng. Vui lòng thử lại.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSelectItem = (cartItemId) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cartItemId)) {
                newSet.delete(cartItemId);
                setSelectAll(false);
            } else {
                newSet.add(cartItemId);
                if (newSet.size === cart?.items?.length) {
                    setSelectAll(true);
                }
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(cart?.items?.map(item => item.cart_item_id)));
        }
        setSelectAll(!selectAll);
    };

    const handleProceedToCheckout = () => {
        if (selectedItems.size === 0) {
            setError("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
            return;
        }
        // Chuyển đến trang thanh toán với các sản phẩm đã chọn
        const selectedProductIds = Array.from(selectedItems);
        window.location.href = `/checkout?items=${selectedProductIds.join(',')}`;
    };

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
                    <DialogTitle>Giỏ Hàng</DialogTitle>
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
                        <div className="p-2 border-b">
                            <label className="flex items-center space-x-2">
                                <Checkbox
                                    checked={selectAll}
                                    onCheckedChange={handleSelectAll}
                                />
                                <span>Chọn tất cả</span>
                            </label>
                        </div>
                        <div className="flex-grow max-h-[60vh] overflow-y-auto">
                            {cart.items.map((item) => (
                                <div key={item.cart_item_id} className="flex items-center p-2">
                                    <Checkbox
                                        checked={selectedItems.has(item.cart_item_id)}
                                        onCheckedChange={() => handleSelectItem(item.cart_item_id)}
                                        className="mr-2"
                                    />
                                    <CartItem
                                        item={item}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemove={handleRemoveItem}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t mt-auto">
                            <div className="flex justify-between mb-4">
                                <span className="font-medium">Tổng tiền:</span>
                                <span className="font-medium">
                                    {calculateTotal().toLocaleString('vi-VN')}đ
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleClearCart}
                                    disabled={isUpdating}
                                    className="w-full"
                                >
                                    Xóa giỏ hàng
                                </Button>
                                <Button
                                    onClick={handleProceedToCheckout}
                                    disabled={isUpdating || selectedItems.size === 0}
                                    className="w-full"
                                >
                                    Thanh toán
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="mb-4">Giỏ hàng của bạn đang trống</p>
                        <Button asChild>
                            <Link href="/products">Tiếp tục mua sắm</Link>
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
