import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import { Plus, X, ArrowUp, ArrowDown, Image as ImageIcon, Trash } from 'lucide-react';
import axios from 'axios';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

const CLOUDINARY_UPLOAD_PRESET = 'product_image';
const CLOUDINARY_CLOUD_NAME = 'deczn9jtq';

const SortableImage = ({ image, index, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: image.image_id || `new-${index}`,
    });

    const style = {
        transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
        transition,
    };

    // Determine the image URL to display
    const imageUrl = image.url || image.image_url || '';

    // Determine if this image is the primary one
    const isPrimary = image.is_primary || index === 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative flex items-center bg-white border rounded-md p-2 mb-2 cursor-move ${isPrimary ? 'border-blue-500' : ''}`}
            {...attributes}
            {...listeners}
        >
            <div className="w-16 h-16 mr-3 bg-gray-100 rounded-md overflow-hidden">
                {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="text-gray-400" />
                    </div>
                )}
            </div>
            <div className="flex-grow">
                <p className="text-sm font-medium truncate">{image.file?.name || image.filename || 'Ảnh thứ: '}</p>
                <p className="text-xs text-gray-500">
                    Position: {index + 1}
                    {isPrimary && <span className="ml-2 text-blue-500 font-medium">(Primary)</span>}
                </p>
            </div>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() => onRemove(index)}
            >
                <Trash className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default function ProductForm({ product, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        category_id: '',
        material_id: '',
        brand: '',
        name: '',
        description: '',
        price: '',
        sale_price: '',
        stock_quantity: '',
        min_purchase_quantity: '1',
        max_purchase_quantity: '10',
        gender: 'unisex',
        care_instruction: '',
    });

    const [selectedTags, setSelectedTags] = useState([]);
    const [variants, setVariants] = useState([]);
    const [images, setImages] = useState([]);
    const [newTagId, setNewTagId] = useState('');

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

    // New variant form state
    const [newVariant, setNewVariant] = useState({
        size_id: '',
        color_id: '',
        price: '',
        stock_quantity: '',
    });

    // Sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

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
                        stock_quantity: product.stock_quantity?.toString() || '',
                        min_purchase_quantity: product.min_purchase_quantity?.toString() || '1',
                        max_purchase_quantity: product.max_purchase_quantity?.toString() || '10',
                        gender: product.gender || 'unisex',
                        care_instruction: product.care_instruction || '',
                    });

                    // Load product tags
                    if (product.tags) {
                        setSelectedTags(product.tags.map(tag => tag.id));
                    }

                    // Load product variants
                    if (product.variants) {
                        setVariants(product.variants);
                    }

                    // Load product images
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
        console.log('Categories:', categories);
        console.log('Materials:', materials);
        console.log('Tags:', tags);
        console.log('Sizes:', sizes);
        console.log('Colors:', colors);
        console.log('FormData:', formData);
    }, [product]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const uploadToCloudinary = async (file) => {
        try {
            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); // Replace with your upload preset

            // Upload to Cloudinary directly (client-side upload)
            const response = await axios.post(
                'https://api.cloudinary.com/v1_1/deczn9jtq/image/upload', // Replace with your cloud name
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: false,
                }
            );

            return {
                public_id: response.data.public_id,
                url: response.data.secure_url,
                format: response.data.format
            };
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    };

    // Handle image file selection
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(validateImage);

        const newImages = validFiles.map(file => ({
            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            url: URL.createObjectURL(file)
        }));

        setImages(prev => [...prev, ...newImages]);
    };

    // Remove image
    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Handle image reordering
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setImages((items) => {
                const oldIndex = items.findIndex(item => (item.image_id || `new-${items.indexOf(item)}`) === active.id);
                const newIndex = items.findIndex(item => (item.image_id || `new-${items.indexOf(item)}`) === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Add a tag to the product
    const handleAddTag = () => {
        if (newTagId && !selectedTags.includes(parseInt(newTagId))) {
            setSelectedTags(prev => [...prev, parseInt(newTagId)]);
            setNewTagId('');
        }
    };

    // Remove a tag from the product
    const handleRemoveTag = (tagId) => {
        setSelectedTags(prev => prev.filter(id => id !== tagId));
    };

    // Add a new variant
    const handleAddVariant = () => {
        // Validate variant data
        if (!newVariant.size_id || !newVariant.color_id || !newVariant.price || !newVariant.stock_quantity) {
            return;
        }

        // Check if variant with same size and color already exists
        const exists = variants.some(
            v => v.size_id.toString() === newVariant.size_id.toString() &&
                 v.color_id.toString() === newVariant.color_id.toString()
        );

        if (exists) {
            alert('A variant with this size and color combination already exists.');
            return;
        }

        // Create a temporary ID for new variants
        const tempId = `temp-${Date.now()}`;

        setVariants(prev => [...prev, {
            id: tempId,
            size_id: newVariant.size_id,
            color_id: newVariant.color_id,
            price: newVariant.price,
            stock_quantity: newVariant.stock_quantity,
            // Add references to the selected size and color objects for display
            size: sizes.find(s => s.id.toString() === newVariant.size_id.toString()),
            color: colors.find(c => c.id.toString() === newVariant.color_id.toString())
        }]);

        // Reset new variant form
        setNewVariant({
            size_id: '',
            color_id: '',
            price: '',
            stock_quantity: '',
        });
    };

    // Remove a variant
    const handleRemoveVariant = (variantId) => {
        setVariants(prev => prev.filter(v => v.id !== variantId));
    };

    // Submit the form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            // Create FormData object to handle file uploads
            const productData = new FormData();

            // Add all form fields
            Object.entries(formData).forEach(([key, value]) => {
                productData.append(key, value);
            });

            // Add tags
            selectedTags.forEach(tagId => {
                productData.append('tags[]', tagId);
            });

            // Add variants
            variants.forEach((variant, index) => {
                productData.append(`variants[${index}][size_id]`, variant.size_id);
                productData.append(`variants[${index}][color_id]`, variant.color_id);
                productData.append(`variants[${index}][price]`, variant.price);
                productData.append(`variants[${index}][stock_quantity]`, variant.stock_quantity);
                if (variant.id && !variant.id.toString().startsWith('temp-')) {
                    productData.append(`variants[${index}][id]`, variant.id);
                }
            });

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
                            image_url: cloudinaryData.url,  // Use image_url instead of url
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

            // Now add the processed image data to the form
            productData.append('images', JSON.stringify(imageData));
            console.log('Product data:', productData);
            // Send the request
            let response;
            if (product) {
                // Update existing product
                response = await axios.post(`/admin/products/${product.product_id}`, productData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Create new product
                response = await axios.post('/admin/products', productData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            if (response.data.success) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error submitting product form:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateImage = (file) => {
        // Check file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > maxSize) {
            alert(`File "${file.name}" quá lớn. Kích thước tối đa là 2MB.`);
            return false;
        }

        // Check file type
        const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!acceptedTypes.includes(file.type)) {
            alert(`File "${file.name}" không được hỗ trợ. Chỉ chấp nhận JPEG, PNG và WEBP.`);
            return false;
        }

        return true;
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
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Tên sản phẩm</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="mt-1"
                                    />
                                    <ErrorMessage field="name" />
                                </div>

                                <div>
                                    <Label htmlFor="brand">Thương hiệu</Label>
                                    <Input
                                        id="brand"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="mt-1"
                                    />
                                    <ErrorMessage field="brand" />
                                </div>

                                <div>
                                    <Label htmlFor="category_id">Danh mục</Label>
                                    <Select
                                        value={formData.category_id}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(category => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <ErrorMessage field="category_id" />
                                </div>

                                <div>
                                    <Label htmlFor="material_id">Chất liệu</Label>
                                    <Select
                                        value={formData.material_id}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, material_id: value }))}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Chọn chất liệu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {materials.map(material => (
                                                <SelectItem key={material.id} value={material.id.toString()}>
                                                    {material.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <ErrorMessage field="material_id" />
                                </div>

                                <div>
                                    <Label htmlFor="gender">Giới tính</Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Chọn giới tính" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Nam</SelectItem>
                                            <SelectItem value="female">Nữ</SelectItem>
                                            <SelectItem value="unisex">Unisex</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <ErrorMessage field="gender" />
                                </div>
                            </div>

                            {/* Pricing and Inventory */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="price">Giá (VND)</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="mt-1"
                                    />
                                    <ErrorMessage field="price" />
                                </div>

                                <div>
                                    <Label htmlFor="sale_price">Giá khuyến mãi (VND)</Label>
                                    <Input
                                        id="sale_price"
                                        name="sale_price"
                                        type="number"
                                        value={formData.sale_price}
                                        onChange={handleChange}
                                        className="mt-1"
                                    />
                                    <ErrorMessage field="sale_price" />
                                </div>

                                <div>
                                    <Label htmlFor="stock_quantity">Số lượng tồn kho</Label>
                                    <Input
                                        id="stock_quantity"
                                        name="stock_quantity"
                                        type="number"
                                        value={formData.stock_quantity}
                                        onChange={handleChange}
                                        className="mt-1"
                                    />
                                    <ErrorMessage field="stock_quantity" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="min_purchase_quantity">Số lượng mua tối thiểu</Label>
                                        <Input
                                            id="min_purchase_quantity"
                                            name="min_purchase_quantity"
                                            type="number"
                                            value={formData.min_purchase_quantity}
                                            onChange={handleChange}
                                            className="mt-1"
                                        />
                                        <ErrorMessage field="min_purchase_quantity" />
                                    </div>

                                    <div>
                                        <Label htmlFor="max_purchase_quantity">Số lượng mua tối đa</Label>
                                        <Input
                                            id="max_purchase_quantity"
                                            name="max_purchase_quantity"
                                            type="number"
                                            value={formData.max_purchase_quantity}
                                            onChange={handleChange}
                                            className="mt-1"
                                        />
                                        <ErrorMessage field="max_purchase_quantity" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description and Care Instructions */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="description">Mô tả sản phẩm</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="mt-1 min-h-[100px]"
                                />
                                <ErrorMessage field="description" />
                            </div>

                            <div>
                                <Label htmlFor="care_instruction">Hướng dẫn bảo quản</Label>
                                <Textarea
                                    id="care_instruction"
                                    name="care_instruction"
                                    value={formData.care_instruction}
                                    onChange={handleChange}
                                    className="mt-1 min-h-[100px]"
                                />
                                <ErrorMessage field="care_instruction" />
                            </div>
                        </div>

                        {/* Tags Management */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Thẻ tag</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedTags.map(tagId => {
                                    const tag = tags.find(t => t.id === tagId);
                                    return tag ? (
                                        <Badge key={tag.id} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                            {tag.name}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="ml-1 p-0 h-4 w-4"
                                                onClick={() => handleRemoveTag(tag.id)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    ) : null;
                                })}
                            </div>

                            <div className="flex gap-2">
                                <Select
                                    value={newTagId}
                                    onValueChange={setNewTagId}
                                >
                                    <SelectTrigger className="flex-grow">
                                        <SelectValue placeholder="Chọn tag" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tags
                                            .filter(tag => !selectedTags.includes(tag.id))
                                            .map(tag => (
                                                <SelectItem key={tag.id} value={tag.id.toString()}>
                                                    {tag.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    onClick={handleAddTag}
                                    disabled={!newTagId}
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Thêm Tag
                                </Button>
                            </div>
                        </div>

                        {/* Variants Management */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Biến thể sản phẩm</h3>

                            {variants.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kích cỡ</TableHead>
                                            <TableHead>Màu sắc</TableHead>
                                            <TableHead>Giá (VND)</TableHead>
                                            <TableHead>Số lượng</TableHead>
                                            <TableHead className="text-right">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {variants.map((variant) => (
                                            <TableRow key={variant.id}>
                                                <TableCell>{variant.size?.name || 'Không rõ'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <div
                                                            className="w-4 h-4 rounded-full mr-2"
                                                            style={{ backgroundColor: variant.color?.description || '#CCCCCC' }}
                                                        ></div>
                                                        {variant.color?.name || 'Không rõ'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{Intl.NumberFormat('vi-VN').format(variant.price)}</TableCell>
                                                <TableCell>{variant.stock_quantity}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRemoveVariant(variant.id)}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <Label htmlFor="size_id">Kích cỡ</Label>
                                            <Select
                                                value={newVariant.size_id}
                                                onValueChange={(value) => setNewVariant(prev => ({ ...prev, size_id: value }))}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Chọn kích cỡ" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sizes.map(size => (
                                                        <SelectItem key={size.id} value={size.id.toString()}>
                                                            {size.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="color_id">Màu sắc</Label>
                                            <Select
                                                value={newVariant.color_id}
                                                onValueChange={(value) => setNewVariant(prev => ({ ...prev, color_id: value }))}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Chọn màu sắc" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {colors.map(color => (
                                                        <SelectItem key={color.id} value={color.id.toString()}>
                                                            <div className="flex items-center">
                                                                <div
                                                                    className="w-4 h-4 rounded-full mr-2"
                                                                    style={{ backgroundColor: color.description }}
                                                                ></div>
                                                                {color.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="variant_price">Giá (VND)</Label>
                                            <Input
                                                id="variant_price"
                                                type="number"
                                                value={newVariant.price}
                                                onChange={(e) => setNewVariant(prev => ({ ...prev, price: e.target.value }))}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="variant_stock">Số lượng</Label>
                                            <Input
                                                id="variant_stock"
                                                type="number"
                                                value={newVariant.stock_quantity}
                                                onChange={(e) => setNewVariant(prev => ({ ...prev, stock_quantity: e.target.value }))}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        className="mt-4"
                                        onClick={handleAddVariant}
                                        disabled={!newVariant.size_id || !newVariant.color_id || !newVariant.price || !newVariant.stock_quantity}
                                    >
                                        <Plus className="h-4 w-4 mr-1" /> Thêm biến thể
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Hình ảnh sản phẩm</h3>
                            <p className="text-sm text-gray-500">Kéo thả để sắp xếp thứ tự hình ảnh. Hình ảnh đầu tiên sẽ là hình ảnh chính.</p>

                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click để tải ảnh lên</span> hoặc kéo thả vào đây
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG hoặc WEBP (MAX. 2MB cho mỗi ảnh)</p>
                                    </div>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        multiple
                                        accept="image/png, image/jpeg, image/webp"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>

                            {/* Sortable images list */}
                            <div className="mt-4">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                    modifiers={[restrictToVerticalAxis]}
                                >
                                    <SortableContext
                                        items={images.map((img, index) => img.image_id || `new-${index}`)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {images.map((image, index) => (
                                            <SortableImage
                                                key={image.image_id || `new-${index}`}
                                                image={image}
                                                index={index}
                                                onRemove={handleRemoveImage}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>
                            <ErrorMessage field="images" />
                        </div>

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
