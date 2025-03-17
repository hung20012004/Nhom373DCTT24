import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import axios from 'axios';

// Import all sub-components
import BasicInformationForm from './ProductForm/BasicInformationForm';
import PricingInventoryForm from './ProductForm/PricingInventoryForm';
import DescriptionForm from './ProductForm/DescriptionForm';
import TagsManager from './ProductForm/TagsManager';
import VariantsManager from './ProductForm/VariantsManager';
import ImagesManager from './ProductForm/ImagesManager';
import { uploadToCloudinary } from './ProductForm/utils';

export default function ProductForm({ product, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        category_id: '',
        material_id: '',
        brand: '',
        name: '',
        description: '',
        price: '',
        sale_price: '',
        stock_quantity: '0', // Will be calculated automatically from variants
        min_purchase_quantity: '1',
        max_purchase_quantity: '10',
        gender: 'unisex',
        care_instruction: '',
        is_active: true,
        sku: '',
    });

    const [selectedTags, setSelectedTags] = useState([]);
    const [variants, setVariants] = useState([]);
    const [images, setImages] = useState([]);

    // For dropdowns
    const [categories, setCategories] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [tags, setTags] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);

    // Form states
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Calculate total stock quantity whenever variants change
    useEffect(() => {
        const totalStock = variants.reduce((sum, variant) => {
            return sum + (parseInt(variant.stock_quantity) || 0);
        }, 0);

        setFormData(prev => ({
            ...prev,
            stock_quantity: totalStock.toString()
        }));
    }, [variants]);

    // Load necessary data when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [categoriesRes, materialsRes, tagsRes, sizesRes, colorsRes] = await Promise.all([
                    axios.get('/api/v1/categories'),
                    axios.get('/api/v1/materials'),
                    axios.get('/api/v1/tags'),
                    axios.get('/api/v1/sizes'),
                    axios.get('/api/v1/colors')
                ]);

                setCategories(categoriesRes.data.data);
                setMaterials(materialsRes.data.data);
                setTags(tagsRes.data.data);
                setSizes(sizesRes.data.data);
                setColors(colorsRes.data.data);

                // If editing an existing product, load its data
                if (product) {
                    setFormData({
                        category_id: product.category_id?.toString() || '',
                        material_id: product.material_id?.toString() || '',
                        brand: product.brand || '',
                        name: product.name || '',
                        description: product.description || '',
                        price: product.price?.toString() || '',
                        sale_price: product.sale_price?.toString() || '',
                        stock_quantity: '0', // Will be calculated from variants
                        min_purchase_quantity: product.min_purchase_quantity?.toString() || '1',
                        max_purchase_quantity: product.max_purchase_quantity?.toString() || '10',
                        gender: product.gender || 'unisex',
                        care_instruction: product.care_instruction || '',
                        is_active: product.is_active || true,
                        sku: product.sku || '',
                    });

                    // Load product tags, variants, and images
                    if (product.tags) {
                        setSelectedTags(product.tags.map(tag => tag.id));
                    }
                    if (product.variants) {
                        setVariants(product.variants);
                    }
                    if (product.images) {
                        setImages(product.images.map((img, index) => ({
                            ...img,
                            display_order: img.display_order || index,
                        })));
                    }
                }
            } catch (error) {
                console.error('Error loading form data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [product]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        console.log("Form data trước khi gửi:", formData);
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            // Thay vì sử dụng FormData, chúng ta sẽ sử dụng object JSON
            const productData = {
                ...formData,
                is_active: formData.is_active ? 1 : 0,
                tags: selectedTags,
                variants: variants.map(v => ({
                    size_id: v.size_id,
                    color_id: v.color_id,
                    price: v.price,
                    stock_quantity: v.stock_quantity,
                    id: v.id && !v.id.toString().startsWith('temp-') ? v.id : undefined
                }))
            };

            // Xử lý hình ảnh
            const imageUploads = [];
            const imageData = [];

            // Process all images
            for (let i = 0; i < images.length; i++) {
                const image = images[i];

                if (image.file) {
                    // This is a new image that needs to be uploaded to Cloudinary
                    imageUploads.push(uploadToCloudinary(image.file).then(cloudinaryData => {
                        imageData.push({
                            display_order: i,
                            type: 'new',
                            public_id: cloudinaryData.public_id,
                            image_url: cloudinaryData.url,
                            format: cloudinaryData.format,
                            is_primary: i === 0  // First image is primary
                        });
                    }));
                } else if (image.image_id) {
                    // This is an existing image that might need reordering
                    imageData.push({
                        display_order: i,
                        type: 'existing',
                        image_id: image.image_id,
                        is_primary: i === 0  // First image is primary
                    });
                }
            }

            // Wait for all Cloudinary uploads to complete
            await Promise.all(imageUploads);

            // Thêm dữ liệu hình ảnh vào object
            productData.images = JSON.stringify(imageData);

            // In ra dữ liệu để kiểm tra
            console.log("Dữ liệu sản phẩm gửi đi:", productData);

            // Send the request
            let response;
            if (product) {
                // Update existing product
                response = await axios.post(`/admin/products/${product.product_id}`, productData);
            } else {
                // Create new product
                response = await axios.post('/admin/products', productData);
            }

            if (response.data.success) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error submitting product form:', error);
            if (error.response && error.response.data) {
                console.log('Chi tiết lỗi:', error.response.data);
                setErrors(error.response.data.errors || {});
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Display error message for a field
    const ErrorMessage = ({ field }) => {
        if (!errors[field]) return null;
        return <p className="text-sm text-red-500 mt-1">{errors[field][0]}</p>;
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <BasicInformationForm
                                formData={formData}
                                handleChange={handleChange}
                                categories={categories}
                                materials={materials}
                                setFormData={setFormData}
                                ErrorMessage={ErrorMessage}
                            />

                            {/* Pricing and Inventory - Modified to display calculated stock quantity */}
                            <PricingInventoryForm
                                formData={formData}
                                handleChange={handleChange}
                                ErrorMessage={ErrorMessage}
                                stockQuantityReadOnly={true} // New prop to make stock quantity read-only
                            />
                        </div>

                        {/* Description and Care Instructions */}
                        <DescriptionForm
                            formData={formData}
                            handleChange={handleChange}
                            ErrorMessage={ErrorMessage}
                        />

                        {/* Tags Management */}
                        <TagsManager
                            selectedTags={selectedTags}
                            setSelectedTags={setSelectedTags}
                            tags={tags}
                        />

                        {/* Variants Management */}
                        <VariantsManager
                            variants={variants}
                            setVariants={setVariants}
                            sizes={sizes}
                            colors={colors}
                        />

                        {/* Image Upload */}
                        <ImagesManager
                            images={images}
                            setImages={setImages}
                            ErrorMessage={ErrorMessage}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
