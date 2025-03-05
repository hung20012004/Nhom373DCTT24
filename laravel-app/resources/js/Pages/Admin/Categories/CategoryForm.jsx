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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import axios from 'axios';

const CLOUDINARY_UPLOAD_PRESET = 'category_images';
const CLOUDINARY_CLOUD_NAME = 'deczn9jtq';

export default function CategoryForm({ category, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        is_active: true,
        display_order: 0,
        image_url: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                slug: category.slug || '',
                description: category.description || '',
                is_active: category.is_active === 1,
                display_order: category.display_order || 0,
                image_url: category.image_url || ''
            });
            setImagePreview(category.image_url || null);
        }
    }, [category]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Tạo preview cho file đã chọn
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
                    withCredentials: false,
                }
            );
            return response.data.secure_url;
        } catch (error) {
            console.error('Lỗi tải ảnh lên Cloudinary:', error);
            throw new Error('Không thể tải ảnh lên');
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
            } else if (category) {
                finalFormData.image_url = category.image_url;
            }

            if (category) {
                const changedFields = {};
                Object.keys(finalFormData).forEach(key => {
                    if (finalFormData[key] !== category[key]) {
                        changedFields[key] = finalFormData[key];
                    }
                });

                await axios.post(`/admin/categories/${category.id}`, changedFields);
            } else {
                await axios.post('/admin/categories', finalFormData);
            }

            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }

            onSuccess();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setGeneralError('Đã xảy ra lỗi khi lưu loại sản phẩm. Vui lòng thử lại.');
            }
            console.error('Lỗi gửi loại sản phẩm:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name) => {
        return name.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: generateSlug(name)
        }));
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {category ? 'Chỉnh sửa loại sản phẩm' : 'Thêm loại sản phẩm mới'}
                    </DialogTitle>
                </DialogHeader>

                {generalError && (
                    <Alert variant="destructive">
                        <AlertDescription>{generalError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Hình ảnh</Label>
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

                    {/* Rest of the form fields remain the same */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Tên</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={handleNameChange}
                                required
                            />
                            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                        </div>

                        <div>
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                required
                            />
                            {errors.slug && <span className="text-red-500 text-sm">{errors.slug}</span>}
                        </div>

                        <div>
                            <Label htmlFor="description">Mô tả</Label>
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
                            <Label htmlFor="is_active">Hoạt động</Label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="min-w-[100px]"
                        >
                            {loading ? 'Đang lưu...' : (category ? 'Cập nhật' : 'Tạo')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
