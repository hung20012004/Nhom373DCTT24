import React, { useState, useMemo } from 'react';

const VariantDisplay = ({ variants }) => {
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);

    // Helper function to sort sizes
    const sortSizes = (sizes) => {
        return sizes.sort((a, b) => {
            // Convert common size formats (S, M, L, XL, etc.)
            const sizeOrder = { 'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5, 'XL': 6, 'XXL': 7, '2XL': 7, '3XL': 8, '4XL': 9 };

            // If both sizes are in our sizeOrder mapping
            if (sizeOrder[a] && sizeOrder[b]) {
                return sizeOrder[a] - sizeOrder[b];
            }

            // If sizes are numbers (e.g., "36", "38", "40")
            const numA = parseFloat(a);
            const numB = parseFloat(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }

            // Default to alphabetical sorting
            return a.localeCompare(b);
        });
    };

    // Extract and sort unique sizes and colors from variants
    const { uniqueSizes, uniqueColors, variantMap } = useMemo(() => {
        const sizes = new Set();
        const colors = new Set();
        const variantMapping = new Map();

        variants?.forEach(variant => {
            if (variant.size?.name) sizes.add(variant.size.name);
            if (variant.color?.name) colors.add(variant.color.name);

            // Create mapping for quick lookup
            const key = `${variant.size?.name}-${variant.color?.name}`;
            variantMapping.set(key, variant);
        });

        return {
            uniqueSizes: sortSizes(Array.from(sizes)),
            uniqueColors: Array.from(colors).sort((a, b) => a.localeCompare(b)), // Sort colors alphabetically
            variantMap: variantMapping
        };
    }, [variants]);

    // Check if a size-color combination exists
    const doesCombinationExist = (size, color) => {
        return variantMap.has(`${size}-${color}`);
    };

    // Get available sizes for a color
    const getAvailableSizesForColor = (color) => {
        return uniqueSizes.filter(size => doesCombinationExist(size, color));
    };

    // Get available colors for a size
    const getAvailableColorsForSize = (size) => {
        return uniqueColors.filter(color => doesCombinationExist(size, color));
    };

    const handleSizeClick = (size) => {
        setSelectedSize(selectedSize === size ? null : size);
        setSelectedColor(null);
    };

    const handleColorClick = (color) => {
        setSelectedColor(selectedColor === color ? null : color);
        setSelectedSize(null);
    };

    return (
        <div className="space-y-2">
            {/* Sizes Section */}
            <div>
                <div className="text-xs font-medium mb-1">Sizes:</div>
                <div className="flex flex-wrap gap-1">
                    {uniqueSizes.map((size) => {
                        const isActive = selectedSize === size;
                        const isAvailable = !selectedColor || getAvailableSizesForColor(selectedColor).includes(size);

                        return (
                            <button
                                key={size}
                                onClick={() => handleSizeClick(size)}
                                className={`
                                    px-2 py-1 text-xs rounded-md transition-all
                                    ${isActive ? 'bg-blue-500 text-white' :
                                      isAvailable ? 'bg-gray-100 hover:bg-gray-200' :
                                      'bg-gray-50 text-gray-400 cursor-not-allowed'}
                                `}
                            >
                                {size}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Colors Section */}
            <div>
                <div className="text-xs font-medium mb-1">Colors:</div>
                <div className="flex flex-wrap gap-1">
                    {uniqueColors.map((color) => {
                        const isActive = selectedColor === color;
                        const isAvailable = !selectedSize || getAvailableColorsForSize(selectedSize).includes(color);

                        return (
                            <button
                                key={color}
                                onClick={() => handleColorClick(color)}
                                className={`
                                    px-2 py-1 text-xs rounded-md transition-all
                                    ${isActive ? 'bg-blue-500 text-white' :
                                      isAvailable ? 'bg-gray-100 hover:bg-gray-200' :
                                      'bg-gray-50 text-gray-400 cursor-not-allowed'}
                                `}
                            >
                                {color}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default VariantDisplay;
