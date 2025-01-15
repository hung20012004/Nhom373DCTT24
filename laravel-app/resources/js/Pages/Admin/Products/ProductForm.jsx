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
        images: [],
    });

    const [categories, setCategories] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [tags, setTags] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                tags: product.tags?.map(t => t.tag_id) || [],
                variants: product.variants || [],
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
                console.error('Error fetching form data:', error);
            }
        };

        fetchFormData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'images' && formData[key] instanceof FileList) {
                Array.from(formData[key]).forEach(file => {
                    submitData.append('images[]', file);
                });
            } else if (key === 'tags' || key === 'variants') {
                submitData.append(key, JSON.stringify(formData[key]));
            } else {
                submitData.append(key, formData[key]);
            }
        });

        try {
            if (product) {
                await axios.post(`/api/admin/products/${product.product_id}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await axios.post('/api/admin/products', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            onSuccess();
        } catch (error) {
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

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {product ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="brand">Brand</Label>
                            <Input
                                id="brand"
                                value={formData.brand}
                                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                required
                            />
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
                        </div>

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
                        </div>

                        <div>
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={formData.stock_quantity}
                                onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                                required
                            />
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
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                            rows={4}
                        />
                    </div>

                    <div>
                        <Label>Product Images</Label>
                        <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setFormData({...formData, images: e.target.files})}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label>Variants</Label>
                            <Button type="button" onClick={addVariant}>
                                Add Variant
                            </Button>
                        </div>

                        {formData.variants.map((variant, index) => (
                            <div key={index} className="grid grid-cols-5 gap-2 mb-2">
                                <Select
                                    value={variant.size_id}
                                    onValueChange={(value) => handleVariantChange(index, 'size_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sizes.map((size) => (
                                            <SelectItem key={size.size_id} value={size.size_id}>
                                                {size.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={variant.color_id}
                                    onValueChange={(value) => handleVariantChange(index, 'color_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {colors.map((color) => (
                                            <SelectItem key={color.color_id} value={color.color_id}>
                                                {color.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Input
                                    type="number"
                                    placeholder="Stock"
                                    value={variant.stock_quantity}
                                    onChange={(e) => handleVariantChange(index, 'stock_quantity', e.target.value)}
                                />

                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Price"
                                    value={variant.price}
                                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                />

                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => removeVariant(index)}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (product ? 'Update' : 'Create')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
