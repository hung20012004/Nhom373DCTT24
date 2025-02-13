import React, { useState, useEffect, useMemo } from "react";
import { usePage } from "@inertiajs/react";
import { useCart } from "@/Contexts/CartContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    ShoppingCart,
    Plus,
    Minus,
} from "lucide-react";
import { ProductPrice } from "./ProductPrice";

const ProductDialog = ({
    product,
    isOpen,
    onClose,
    onToggleWishlist,
    isInWishlist,
}) => {
    const { auth } = usePage().props;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();

    useEffect(() => {
        if (isOpen) {
            setSelectedColor(null);
            setSelectedSize(null);
            setError(null);
            setQuantity(1);
            setCurrentImageIndex(0);
        }
    }, [isOpen, product]);

    // Organize variants by size and color
    const variantMap = useMemo(() => {
        const map = new Map();
        if (!product?.variants) return map;

        product.variants.forEach((variant) => {
            if (!map.has(variant.size_id)) {
                map.set(variant.size_id, new Map());
            }
            map.get(variant.size_id).set(variant.color_id, variant);
        });

        return map;
    }, [product?.variants]);

    // Check if a specific size-color combination exists and has stock
    const hasVariant = (sizeId, colorId) => {
        const sizeVariants = variantMap.get(sizeId);
        if (!sizeVariants) return false;
        const variant = sizeVariants.get(colorId);
        return variant && variant.stock_quantity > 0;
    };

    // Get current variant based on selections
    const currentVariant = useMemo(() => {
        if (!selectedSize || !selectedColor) return null;

        const sizeVariants = variantMap.get(selectedSize.size_id);
        if (!sizeVariants) return null;

        return sizeVariants.get(selectedColor.color_id);
    }, [selectedSize, selectedColor, variantMap]);

    // Image navigation handlers
    const nextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex(
            (prev) => (prev - 1 + product.images.length) % product.images.length
        );
    };

    // Quantity handlers
    const incrementQuantity = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentVariant && quantity < currentVariant.stock_quantity) {
            setQuantity((prev) => prev + 1);
        }
    };

    const decrementQuantity = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 1) {
            if (currentVariant && value <= currentVariant.stock_quantity) {
                setQuantity(value);
            } else if (currentVariant) {
                setQuantity(currentVariant.stock_quantity);
            }
        }
    };

    const handleAddToCart = async () => {
        if (!auth.user) {
            setError("Please login to add items to cart.");
            return;
        }

        if (!currentVariant) {
            setError(
                "Please select both size and color before adding to cart."
            );
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await addToCart(
                currentVariant.variant_id,
                quantity
            );

            if (response.success) {
                onClose();
            } else {
                setError(
                    response.message ||
                        "Failed to add item to cart. Please try again."
                );
            }
        } catch (err) {
            setError(
                "An error occurred while adding to cart. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {product.name}
                    </DialogTitle>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Section */}
                    <div className="relative">
                        <div
                            className="relative overflow-hidden rounded-lg"
                            style={{ aspectRatio: "3/4" }}
                        >
                            <img
                                src={
                                    product.images[currentImageIndex]?.image_url
                                }
                                alt={`${product.name} view ${
                                    currentImageIndex + 1
                                }`}
                                className="w-full h-full object-cover"
                            />

                            {product.images.length > 1 && (
                                <div className="absolute inset-0 flex items-center justify-between p-2">
                                    <button
                                        onClick={prevImage}
                                        className="bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        <div className="mt-4 flex gap-2 overflow-x-auto">
                            {product.images.map((image, index) => (
                                <button
                                    key={image.image_id}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden ${
                                        currentImageIndex === index
                                            ? "ring-2 ring-blue-500"
                                            : ""
                                    }`}
                                >
                                    <img
                                        src={image.image_url}
                                        alt={`${product.name} thumbnail ${
                                            index + 1
                                        }`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <ProductPrice
                                price={currentVariant?.price || product.price}
                                salePrice={
                                    currentVariant?.sale_price ||
                                    product.sale_price
                                }
                            />
                        </div>

                        <p className="text-gray-600 mb-6">
                            {product.description}
                        </p>

                        {product.material && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Material
                                </h3>
                                <p className="text-gray-600">
                                    {product.material.name}
                                </p>
                                {product.material.description && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {product.material.description}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Size Selection */}
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Select Size
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {product.available_sizes?.map((size) => (
                                    <button
                                        key={size.size_id}
                                        onClick={() => {
                                            setSelectedSize(size);
                                            if (
                                                selectedColor &&
                                                !hasVariant(
                                                    size.size_id,
                                                    selectedColor.color_id
                                                )
                                            ) {
                                                setSelectedColor(null);
                                            }
                                        }}
                                        className={`px-4 py-2 border rounded-md transition-colors ${
                                            selectedSize?.size_id ===
                                            size.size_id
                                                ? "border-blue-500 bg-blue-50"
                                                : "hover:border-blue-500"
                                        }`}
                                    >
                                        {size.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Select Color
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {product.available_colors?.map((color) => {
                                    const isAvailable = selectedSize
                                        ? hasVariant(
                                              selectedSize.size_id,
                                              color.color_id
                                          )
                                        : product.variants?.some(
                                              (v) =>
                                                  v.color_id ===
                                                      color.color_id &&
                                                  v.stock_quantity > 0
                                          );

                                    return (
                                        <button
                                            key={color.color_id}
                                            onClick={() => {
                                                if (isAvailable) {
                                                    setSelectedColor(color);
                                                }
                                            }}
                                            disabled={!isAvailable}
                                            className={`group relative p-1 rounded-full ${
                                                selectedColor?.color_id ===
                                                color.color_id
                                                    ? "ring-2 ring-blue-500"
                                                    : ""
                                            } ${
                                                !isAvailable
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            title={`${color.name}${
                                                selectedSize &&
                                                hasVariant(
                                                    selectedSize.size_id,
                                                    color.color_id
                                                )
                                                    ? ` - ${
                                                          variantMap
                                                              .get(
                                                                  selectedSize.size_id
                                                              )
                                                              .get(
                                                                  color.color_id
                                                              ).stock_quantity
                                                      } in stock`
                                                    : !isAvailable
                                                    ? " - Not available for selected size"
                                                    : ""
                                            }`}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full border"
                                                style={{
                                                    backgroundColor:
                                                        color.description,
                                                }}
                                            />
                                            <span className="absolute inset-0 rounded-full group-hover:bg-black/10" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quantity Controls */}
                        {currentVariant && (
                            <div className="space-y-4 mb-4">
                                <p className="text-sm text-gray-600">
                                    {currentVariant.stock_quantity} units
                                    available
                                </p>

                                <div className="flex items-center space-x-4">
                                    <span className="font-semibold text-gray-900">
                                        Quantity:
                                    </span>
                                    <div className="flex items-center border rounded-lg">
                                        <button
                                            type="button"
                                            onClick={decrementQuantity}
                                            disabled={quantity <= 1}
                                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={currentVariant.stock_quantity}
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            className="w-16 text-center border-x p-2"
                                        />

                                        <button
                                            type="button"
                                            onClick={incrementQuantity}
                                            disabled={
                                                quantity >=
                                                currentVariant.stock_quantity
                                            }
                                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-auto pt-6 flex gap-4">
                            <button
                                type="button"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={
                                    !currentVariant ||
                                    currentVariant.stock_quantity <= 0 ||
                                    isLoading
                                }
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {isLoading
                                    ? "Adding..."
                                    : !currentVariant
                                    ? "Select Options"
                                    : currentVariant.stock_quantity <= 0
                                    ? "Out of Stock"
                                    : "Add to Cart"}
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    onToggleWishlist(product.product_id)
                                }
                                className="p-2 rounded-lg border hover:bg-gray-50"
                            >
                                <Heart
                                    className={`w-5 h-5 ${
                                        isInWishlist
                                            ? "fill-red-500 text-red-500"
                                            : "text-gray-600"
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDialog;
