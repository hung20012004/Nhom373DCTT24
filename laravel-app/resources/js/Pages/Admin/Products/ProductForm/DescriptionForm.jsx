import React from 'react';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';

const DescriptionForm = ({ formData, handleChange, ErrorMessage }) => {
    return (
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
    );
};

export default DescriptionForm;
