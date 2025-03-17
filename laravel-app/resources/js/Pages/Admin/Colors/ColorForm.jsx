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
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';

export default function ColorForm({ color, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        colorCode: '#000000'
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');

    useEffect(() => {
        if (color) {
            setFormData({
                name: color.name || '',
                colorCode: color.description || '#000000'
            });
        }
    }, [color]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError('');

        try {
            const dataToSubmit = {
                ...formData,
                description: formData.colorCode
            };

            if (color) {
                const changedFields = {};
                Object.keys(dataToSubmit).forEach((key) => {
                    if (dataToSubmit[key] !== color[key]) {
                        changedFields[key] = dataToSubmit[key];
                    }
                });

                await axios.post(`/admin/colors/${color.id}`, changedFields);
            } else {
                await axios.post('/admin/colors', dataToSubmit);
            }

            onSuccess();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setGeneralError('An error occurred while saving the color. Please try again.');
            }
            console.error('Error submitting color:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {color ? 'Cập nhật' : 'Thêm mới'}
                    </DialogTitle>
                </DialogHeader>

                {generalError && (
                    <Alert variant="destructive">
                        <AlertDescription>{generalError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Tên màu</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                        </div>
                        <div>
                            <Label htmlFor="colorCode">Chọn màu</Label>
                            <Input
                                id="colorCode"
                                type="color"
                                value={formData.colorCode}
                                onChange={(e) => setFormData({...formData, colorCode: e.target.value})}
                            />
                            {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
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
                            {loading ? 'Đang lưu...' : (color ? 'Cập nhật' : 'Tạo mới')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
