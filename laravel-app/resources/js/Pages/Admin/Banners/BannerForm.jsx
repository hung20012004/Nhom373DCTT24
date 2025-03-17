import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Label } from '@/Components/ui/label';
import { Image, Upload, Crop, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { cn } from '@/lib/utils';
import Cropper from 'react-easy-crop';

export default function BannerForm({ banner, onClose, onSuccess }) {
    const isEditing = !!banner;
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);

    const [formData, setFormData] = useState({
        id: '',
        title: '',
        subtitle: '',
        button_text: '',
        button_link: '',
        image_url: '',
        is_active: true,
        order_sequence: 0,
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        if (banner) {
            setFormData({
                id: banner.id || '',
                title: banner.title || '',
                subtitle: banner.subtitle || '',
                button_text: banner.button_text || '',
                button_link: banner.button_link || '',
                image_url: banner.image_url || '',
                is_active: banner.is_active || false,
                order_sequence: banner.order_sequence || 0,
                start_date: banner.start_date ? formatDateForInput(banner.start_date) : '',
                end_date: banner.end_date ? formatDateForInput(banner.end_date) : ''
            });

            setPreviewImage(banner.image_url || '');
        }

        checkEndDateStatus();
    }, [banner]);

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return format(date, 'yyyy-MM-dd');
    };

    const checkEndDateStatus = () => {
        const currentDate = new Date();

        if (formData.end_date && new Date(formData.end_date) < currentDate) {
            setFormData(prev => ({
                ...prev,
                is_active: false
            }));
        }
    };

    useEffect(() => {
        checkEndDateStatus();
    }, [formData.end_date]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSwitchChange = (name, checked) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleImageURLChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            image_url: value
        }));
        setPreviewImage(value);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setImageFile(file);

            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = document.createElement('img');
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const uploadToCloudinary = async (blob) => {
        setUploadLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', blob);
            formData.append('upload_preset', 'banner_images');

            const response = await axios.post(
                'https://api.cloudinary.com/v1_1/deczn9jtq/image/upload',
                formData,
                {
                    withCredentials: false
                }
            );

            return response.data.secure_url;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        } finally {
            setUploadLoading(false);
        }
    };

    const handleCropConfirm = async () => {
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

            // Upload to Cloudinary and get URL
            const imageUrl = await uploadToCloudinary(croppedImageBlob);

            // Set the URL in the form data and preview
            setFormData(prev => ({
                ...prev,
                image_url: imageUrl
            }));
            setPreviewImage(imageUrl);

            // Reset crop state
            setShowCropper(false);
            setImageSrc(null);
            setImageFile(null);
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Đã xảy ra lỗi khi xử lý ảnh.');
        }
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setImageSrc(null);
        setImageFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            let payload = { ...formData };

            let response;

            if (isEditing) {
                response = await axios.put(`/admin/banners/${formData.id}`, payload);
            } else {
                response = await axios.post('/admin/banners', payload);
            }

            if (response.data.status === 'success') {
                if (onSuccess) onSuccess(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi lưu banner:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert(error.response?.data?.message || 'Đã xảy ra lỗi khi lưu banner.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isEndDateValid = () => {
        if (!formData.start_date || !formData.end_date) return true;
        return new Date(formData.end_date) >= new Date(formData.start_date);
    };

    useEffect(() => {
        if (!isEndDateValid()) {
            setErrors(prev => ({
                ...prev,
                end_date: 'Ngày kết thúc phải sau ngày bắt đầu'
            }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.end_date;
                return newErrors;
            });
        }
    }, [formData.start_date, formData.end_date]);

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Chỉnh sửa banner' : 'Thêm banner mới'}</DialogTitle>
                </DialogHeader>

                {showCropper ? (
                    <div className="space-y-4">
                        <div className="h-64 relative">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={16 / 9}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCropCancel}
                                className="flex items-center"
                            >
                                <X className="h-4 w-4 mr-1" /> Hủy bỏ
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleCropConfirm}
                                disabled={uploadLoading}
                                className="flex items-center"
                            >
                                {uploadLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                        Đang tải lên...
                                    </div>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4 mr-1" /> Xác nhận
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Banner Image Section - Placed at the top for better visibility */}
                        <div className="border rounded-md p-4 bg-gray-50">
                            <Label className="text-sm font-medium mb-2 block">Hình ảnh banner <span className="text-red-500">*</span></Label>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('banner-image').click()}
                                        className="flex items-center"
                                    >
                                        <Upload className="h-4 w-4 mr-2" /> Tải ảnh lên
                                    </Button>
                                    <Input
                                        id="banner-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <span className="text-sm text-gray-500">hoặc</span>
                                    <div className="flex-1">
                                        <Input
                                            id="image_url"
                                            name="image_url"
                                            placeholder="Nhập URL hình ảnh"
                                            value={formData.image_url}
                                            onChange={handleImageURLChange}
                                            className={cn(errors.image_url ? 'border-red-500' : '')}
                                        />
                                    </div>
                                </div>

                                {errors.image_url && <p className="text-red-500 text-xs">{errors.image_url}</p>}

                                {previewImage && (
                                    <div className="relative mt-3">
                                        <div className="border rounded-md overflow-hidden aspect-[16/9]">
                                            <img
                                                src={previewImage}
                                                alt="Banner preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2 h-8 w-8 p-0"
                                            onClick={() => {
                                                setPreviewImage('');
                                                setFormData(prev => ({ ...prev, image_url: '' }));
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Content Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Left Column */}
                            <div>
                                <div className="mb-4">
                                    <Label htmlFor="title">Tiêu đề <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className={errors.title ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                </div>

                                <div className="mb-4">
                                    <Label htmlFor="subtitle">Mô tả ngắn</Label>
                                    <Textarea
                                        id="subtitle"
                                        name="subtitle"
                                        value={formData.subtitle}
                                        onChange={handleChange}
                                        className={errors.subtitle ? 'border-red-500' : ''}
                                        rows={5}
                                    />
                                    {errors.subtitle && <p className="text-red-500 text-xs mt-1">{errors.subtitle}</p>}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div>
                                <div className="mb-4">
                                    <Label htmlFor="button_text">Văn bản nút</Label>
                                    <Input
                                        id="button_text"
                                        name="button_text"
                                        value={formData.button_text}
                                        onChange={handleChange}
                                        className={errors.button_text ? 'border-red-500' : ''}
                                    />
                                    {errors.button_text && <p className="text-red-500 text-xs mt-1">{errors.button_text}</p>}
                                </div>

                                <div className="mb-4">
                                    <Label htmlFor="button_link">Link nút</Label>
                                    <Input
                                        id="button_link"
                                        name="button_link"
                                        type="text"
                                        placeholder="https://"
                                        value={formData.button_link}
                                        onChange={handleChange}
                                        className={errors.button_link ? 'border-red-500' : ''}
                                    />
                                    {errors.button_link && <p className="text-red-500 text-xs mt-1">{errors.button_link}</p>}
                                </div>
                                <div className="mb-4">
                                    <Label htmlFor="order_sequence">Thứ tự hiển thị <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="order_sequence"
                                        name="order_sequence"
                                        type="number"
                                        min="0"
                                        value={formData.order_sequence}
                                        onChange={handleChange}
                                        className={errors.order_sequence ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.order_sequence && <p className="text-red-500 text-xs mt-1">{errors.order_sequence}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Date Range Row */}
                        <div className="border-t pt-4">
                            <Label className="text-sm font-medium mb-2 block">Thời gian hiển thị</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="start_date" className="text-xs text-gray-500">Ngày bắt đầu</Label>
                                    <Input
                                        id="start_date"
                                        name="start_date"
                                        type="date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        className={errors.start_date ? 'border-red-500' : ''}
                                    />
                                    {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="end_date" className="text-xs text-gray-500">Ngày kết thúc</Label>
                                    <Input
                                        id="end_date"
                                        name="end_date"
                                        type="date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        className={errors.end_date ? 'border-red-500' : ''}
                                    />
                                    {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                                </div>

                            </div>
                            <div className="flex items-center space-x-2 mt-6">
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active">Kích hoạt</Label>
                                </div>
                        </div>

                        <DialogFooter className="pt-2 border-t">
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
                                disabled={loading || !isEndDateValid() || uploadLoading}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Đang lưu...
                                    </div>
                                ) : (
                                    isEditing ? 'Cập nhật' : 'Tạo mới'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
