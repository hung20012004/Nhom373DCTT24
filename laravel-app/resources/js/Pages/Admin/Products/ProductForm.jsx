import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import axios from 'axios';

const CLOUDINARY_UPLOAD_PRESET = 'product_images';
const CLOUDINARY_CLOUD_NAME = 'deczn9jtq';

export default function ProductForm({ product, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        category_id: '',
        material_id: '',
        brand: '',
        gender: '',
        name: '',
        description: '',
        care_instruction: '',
        season: '',
        min_purchase_quantity: 1,
        stock_quantity: 0,
        price: '',
        sale_price: '',
        max_purchase_quantity: 1,
        is_active: true,
        tags: [],
        variants: []
    });

    const [categories, setCategories] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [tags, setTags] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                tags: product.tags?.map(t => t.tag_id) || [],
                variants: product.variants || [],
            });
            setImagePreview(product.image_url || null);
        }
    }, [product]);

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                const [categoriesRes, materialsRes, tagsRes, sizesRes, colorsRes] =
                    await Promise.all([
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
            } catch (error) {
                setGeneralError('Lỗi không load được dữ liệu');
                console.error('Error fetching form data:', error);
            }
        };

        fetchFormData();
    }, []);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setSelectedFile(file);
    };

    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data.secure_url;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw new Error('Failed to upload image');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError('');

        try {
            let finalFormData = { ...formData };

            if (selectedFile) {
                const cloudinaryUrl = await uploadImageToCloudinary(selectedFile);
                finalFormData.image_url = cloudinaryUrl;
            } else if (!imagePreview) {
                finalFormData.image_url = '';
            } else if (product) {
                finalFormData.image_url = product.image_url;
            }

            if (product) {
                await axios.post(`/admin/products/${product.product_id}`, finalFormData);
            } else {
                await axios.post('/admin/products', finalFormData);
            }

            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }

            onSuccess();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setGeneralError(product.data);
            }
            console.error('Error submitting product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setFormData({ ...formData, variants: newVariants });
    };

    const addVariant = () => {
        setFormData({
            ...formData,
            variants: [
                ...formData.variants,
                { size_id: '', color_id: '', stock_quantity: 0, price: 0 }
            ]
        });
    };

    const removeVariant = (index) => {
        const newVariants = formData.variants.filter((_, i) => i !== index);
        setFormData({ ...formData, variants: newVariants });
    };
    console.log('product prop in ProductForm:', product);
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {product ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                </DialogHeader>

                {generalError && (
                    <Alert variant="destructive">
                        <AlertDescription>{generalError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Product Image</Label>
                        <div className="flex items-center gap-4">
                            {imagePreview && (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (imagePreview.startsWith('blob:')) {
                                                URL.revokeObjectURL(imagePreview);
                                            }
                                            setImagePreview(null);
                                            setSelectedFile(null);
                                            setFormData(prev => ({ ...prev, image_url: '' }));
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={loading}
                            />
                        </div>
                        {errors.image_url && <span className="text-red-500 text-sm">{errors.image_url}</span>}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                        </div>

                        <div>
                            <Label htmlFor="brand">Brand</Label>
                            <Input
                                id="brand"
                                value={formData.brand}
                                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                required
                            />
                            {errors.brand && <span className="text-red-500 text-sm">{errors.brand}</span>}
                        </div>

                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value) => setFormData({...formData, category_id: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.category_id}
                                            value={category.category_id}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && <span className="text-red-500 text-sm">{errors.category_id}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    required
                                />
                                {errors.price && <span className="text-red-500 text-sm">{errors.price}</span>}
                            </div>

                            <div>
                                <Label htmlFor="sale_price">Sale Price</Label>
                                <Input
                                    id="sale_price"
                                    type="number"
                                    step="0.01"
                                    value={formData.sale_price}
                                    onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                                />
                                {errors.sale_price && <span className="text-red-500 text-sm">{errors.sale_price}</span>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={4}
                            />
                            {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                            />
                            <Label htmlFor="is_active">Active</Label>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <Label>Product Variants</Label>
                            <Button
                                type="button"
                                onClick={addVariant}
                                variant="outline"
                                size="sm"
                            >
                                Add Variant
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {formData.variants.map((variant, index) => (
                                <div key={index} className="grid grid-cols-4 gap-2 p-4 border rounded-lg bg-gray-50">
                                    <div>
                                        <Label>Size</Label>
                                        <Select
                                            value={variant.size_id}
                                            onValueChange={(value) => handleVariantChange(index, 'size_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sizes.map((size) => (
                                                    <SelectItem key={size.size_id} value={size.size_id}>
                                                        {size.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Color</Label>
                                        <Select
                                            value={variant.color_id}
                                            onValueChange={(value) => handleVariantChange(index, 'color_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select color" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {colors.map((color) => (
                                                    <SelectItem key={color.color_id} value={color.color_id}>
                                                        {color.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Stock</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={variant.stock_quantity}
                                            onChange={(e) => handleVariantChange(index, 'stock_quantity', e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col justify-between">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeVariant(index)}
                                            className="mt-6"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="min-w-[100px]"
                        >
                            {loading ? 'Saving...' : (product ? 'Update' : 'Create')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
