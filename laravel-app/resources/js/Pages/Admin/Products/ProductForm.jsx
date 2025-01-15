import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import axios from 'axios';

export default function ProductForm({ product, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        category_id: '',
        material_id: '',
        brand: '',
        gender: '',
        care_instruction: '',
        season: '',
        min_purchase_quantity: 1,
        stock_quantity: 0,
        description: '',
        price: '',
        sale_price: '',
        max_purchase_quantity: 1,
        tags: [],
        variants: [],
        new_images: [],
        delete_image_ids: []
    });

    const [categories, setCategories] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [tags, setTags] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                tags: product.tags?.map(t => t.tag_id) || [],
                variants: product.variants || [],
                new_images: [],
                delete_image_ids: []
            });
        }
    }, [product]);

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                const [
                    categoriesRes,
                    materialsRes,
                    tagsRes,
                    sizesRes,
                    colorsRes
                ] = await Promise.all([
                    axios.get('/api/admin/categories'),
                    axios.get('/api/admin/materials'),
                    axios.get('/api/admin/tags'),
                    axios.get('/api/admin/sizes'),
                    axios.get('/api/admin/colors')
                ]);

                setCategories(categoriesRes.data);
                setMaterials(materialsRes.data);
                setTags(tagsRes.data);
                setSizes(sizesRes.data);
                setColors(colorsRes.data);
            } catch (error) {
                setGeneralError('Error loading form data. Please try again.');
                console.error('Error fetching form data:', error);
            }
        };

        fetchFormData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError('');

        const submitData = new FormData();

        // Append basic fields
        Object.keys(formData).forEach(key => {
            if (key !== 'new_images' && key !== 'variants' && key !== 'tags' && key !== 'delete_image_ids') {
                submitData.append(key, formData[key]);
            }
        });

        // Handle arrays and objects
        submitData.append('tags', JSON.stringify(formData.tags));
        submitData.append('variants', JSON.stringify(formData.variants));
        if (formData.delete_image_ids.length > 0) {
            submitData.append('delete_image_ids', JSON.stringify(formData.delete_image_ids));
        }

        // Handle new images
        if (formData.new_images.length > 0) {
            Array.from(formData.new_images).forEach(file => {
                submitData.append('new_images[]', file);
            });
        }

        try {
            if (product) {
                await axios.post(`/api/admin/products/${product.product_id}`, submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                });
            } else {
                await axios.post('/api/admin/products', submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                });
            }
            onSuccess();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setGeneralError('An error occurred while saving the product. Please try again.');
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

    const handleImageDelete = (imageId) => {
        setFormData(prev => ({
            ...prev,
            delete_image_ids: [...prev.delete_image_ids, imageId]
        }));
    };

    const handleTagToggle = (tagId) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tagId)
                ? prev.tags.filter(id => id !== tagId)
                : [...prev.tags, tagId]
        }));
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="brand">Brand</Label>
                            <Input
                                id="brand"
                                value={formData.brand}
                                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                required
                            />
                            {errors.brand && <span className="text-red-500 text-sm">{errors.brand[0]}</span>}
                        </div>

                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value) => setFormData({...formData, category_id: value})}
                                required
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
                            {errors.category_id && <span className="text-red-500 text-sm">{errors.category_id[0]}</span>}
                        </div>

                        <div>
                            <Label htmlFor="material">Material</Label>
                            <Select
                                value={formData.material_id}
                                onValueChange={(value) => setFormData({...formData, material_id: value})}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select material" />
                                </SelectTrigger>
                                <SelectContent>
                                    {materials.map((material) => (
                                        <SelectItem
                                            key={material.material_id}
                                            value={material.material_id}
                                        >
                                            {material.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.material_id && <span className="text-red-500 text-sm">{errors.material_id[0]}</span>}
                        </div>

                        <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(value) => setFormData({...formData, gender: value})}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="unisex">Unisex</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && <span className="text-red-500 text-sm">{errors.gender[0]}</span>}
                        </div>

                        <div>
                            <Label htmlFor="season">Season</Label>
                            <Select
                                value={formData.season}
                                onValueChange={(value) => setFormData({...formData, season: value})}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select season" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="spring">Spring</SelectItem>
                                    <SelectItem value="summer">Summer</SelectItem>
                                    <SelectItem value="autumn">Autumn</SelectItem>
                                    <SelectItem value="winter">Winter</SelectItem>
                                    <SelectItem value="all">All Seasons</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.season && <span className="text-red-500 text-sm">{errors.season[0]}</span>}
                        </div>
                    </div>

                    {/* Price and Quantity Information */}
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
                            {errors.price && <span className="text-red-500 text-sm">{errors.price[0]}</span>}
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
                            {errors.sale_price && <span className="text-red-500 text-sm">{errors.sale_price[0]}</span>}
                        </div>

                        <div>
                            <Label htmlFor="min_purchase_quantity">Minimum Purchase Quantity</Label>
                            <Input
                                id="min_purchase_quantity"
                                type="number"
                                min="1"
                                value={formData.min_purchase_quantity}
                                onChange={(e) => setFormData({...formData, min_purchase_quantity: e.target.value})}
                                required
                            />
                            {errors.min_purchase_quantity && <span className="text-red-500 text-sm">{errors.min_purchase_quantity[0]}</span>}
                        </div>

                        <div>
                            <Label htmlFor="max_purchase_quantity">Maximum Purchase Quantity</Label>
                            <Input
                                id="max_purchase_quantity"
                                type="number"
                                min="1"
                                value={formData.max_purchase_quantity}
                                onChange={(e) => setFormData({...formData, max_purchase_quantity: e.target.value})}
                                required
                            />
                            {errors.max_purchase_quantity && <span className="text-red-500 text-sm">{errors.max_purchase_quantity[0]}</span>}
                        </div>

                        <div>
                            <Label htmlFor="stock_quantity">Stock Quantity</Label>
                            <Input
                                id="stock_quantity"
                                type="number"
                                min="0"
                                value={formData.stock_quantity}
                                onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                                required
                            />
                            {errors.stock_quantity && <span className="text-red-500 text-sm">{errors.stock_quantity[0]}</span>}
                        </div>
                    </div>

                    {/* Description and Care Instructions */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                required
                                rows={4}
                            />
                            {errors.description && <span className="text-red-500 text-sm">{errors.description[0]}</span>}
                        </div>

                        <div>
                            <Label htmlFor="care_instruction">Care Instructions</Label>
                            <Textarea
                                id="care_instruction"
                                value={formData.care_instruction}
                                onChange={(e) => setFormData({...formData, care_instruction: e.target.value})}
                                rows={3}
                            />
                            {errors.care_instruction && <span className="text-red-500 text-sm">{errors.care_instruction[0]}</span>}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map((tag) => (
                                <button
                                    key={tag.tag_id}
                                    type="button"
                                    onClick={() => handleTagToggle(tag.tag_id)}
                                    className={`px-3 py-1 rounded-full text-sm ${
                                        formData.tags.includes(tag.tag_id)
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                        {errors.tags && <span className="text-red-500 text-sm">{errors.tags[0]}</span>}
                    </div>

                    {/* Variants Section */}
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
                                <div key={index} className="grid grid-cols-5 gap-2 p-4 border rounded-lg bg-gray-50">
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
                                        {errors[`variants.${index}.size_id`] &&
                                            <span className="text-red-500 text-sm">{errors[`variants.${index}.size_id`][0]}</span>
                                        }
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
                                        {errors[`variants.${index}.color_id`] &&
                                            <span className="text-red-500 text-sm">{errors[`variants.${index}.color_id`][0]}</span>
                                        }
                                    </div>

                                    <div>
                                        <Label>Stock</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={variant.stock_quantity}
                                            onChange={(e) => handleVariantChange(index, 'stock_quantity', e.target.value)}
                                        />
                                        {errors[`variants.${index}.stock_quantity`] &&
                                            <span className="text-red-500 text-sm">{errors[`variants.${index}.stock_quantity`][0]}</span>
                                        }
                                    </div>

                                    <div>
                                        <Label>Price</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={variant.price}
                                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                        />
                                        {errors[`variants.${index}.price`] &&
                                            <span className="text-red-500 text-sm">{errors[`variants.${index}.price`][0]}</span>
                                        }
                                    </div>

                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeVariant(index)}
                                            className="w-full"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {errors.variants && <span className="text-red-500 text-sm">{errors.variants[0]}</span>}
                        </div>
                    </div>

                    {/* Images Section */}
                    <div>
                        <Label>Product Images</Label>
                        <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setFormData({...formData, new_images: e.target.files})}
                            className="mt-2"
                        />
                        {errors.new_images && <span className="text-red-500 text-sm block mt-1">{errors.new_images[0]}</span>}

                        {/* Existing Images Preview */}
                        {product?.images && product.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-4 mt-4">
                                {product.images
                                    .filter(img => !formData.delete_image_ids.includes(img.image_id))
                                    .map((image) => (
                                    <div key={image.image_id} className="relative group">
                                        <img
                                            src={`/storage/${image.image_url}`}
                                            alt="Product"
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleImageDelete(image.image_id)}
                                            className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                        {image.is_primary && (
                                            <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
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
