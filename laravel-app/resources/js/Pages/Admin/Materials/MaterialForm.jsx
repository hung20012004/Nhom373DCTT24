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
import axios from 'axios';

export default function MaterialForm({ material, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');

    useEffect(() => {
        if (material) {
            setFormData({
                name: material.name || '',
                description: material.description || ''
            });
        }
    }, [material]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError('');

        try {
            if (material) {
                const changedFields = {};
                Object.keys(formData).forEach(key => {
                    if (formData[key] !== material[key]) {
                        changedFields[key] = formData[key];
                    }
                });

                await axios.post(`/admin/materials/${material.id}`, changedFields);
            } else {
                await axios.post('/admin/materials', formData);
            }

            onSuccess();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setGeneralError('An error occurred while saving the material. Please try again.');
            }
            console.error('Error submitting material:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {material ? 'Edit Material' : 'Add New Material'}
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
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                placeholder="Enter material name"
                            />
                            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={4}
                                placeholder="Enter material description"
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
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="min-w-[100px]"
                        >
                            {loading ? 'Saving...' : (material ? 'Update' : 'Create')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
