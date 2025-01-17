import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from "lucide-react";
import { ProductPrice } from "./ProductPrice";

const ProductDialog = ({
    product,
    isOpen,
    onClose,
    onToggleWishlist,
    isInWishlist,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex(
            (prev) => (prev - 1 + product.images.length) % product.images.length
        );
    };

    React.useEffect(() => {
        if (isOpen) {
            setSelectedColor(null);
            setSelectedSize(null);
        }
    }, [isOpen, product]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {product.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Gallery */}
                    <div className="relative">
                        <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: '3/4' }}>
                            <img
                                src={product.images[currentImageIndex]?.image_url}
                                alt={product.name}
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

                        {/* Thumbnail Gallery - Adjusted size */}
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
                                price={product.price}
                                salePrice={product.sale_price}
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

                        {product.available_colors && product.available_colors.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Available Colors
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.available_colors.map((color) => (
                                        <button
                                            key={color.color_id}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-4 py-2 border rounded-md transition-colors ${
                                                selectedColor?.color_id === color.color_id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "hover:border-blue-500"
                                            }`}
                                        >
                                            {color.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.available_sizes && product.available_sizes.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Available Sizes
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.available_sizes.map((size) => (
                                        <button
                                            key={size.size_id}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 border rounded-md transition-colors ${
                                                selectedSize?.size_id === size.size_id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "hover:border-blue-500"
                                            }`}
                                        >
                                            {size.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {product.care_instruction && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        Care Instructions
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {product.care_instruction}
                                    </p>
                                </div>
                            )}

                            {product.gender && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        Gender
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {product.gender}
                                    </p>
                                </div>
                            )}

                            {product.season && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        Season
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {product.season}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-6 flex gap-4">
                            <button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!selectedColor || !selectedSize || product.stock_quantity <= 0}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {product.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button
                                onClick={() => onToggleWishlist(product.product_id)}
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
