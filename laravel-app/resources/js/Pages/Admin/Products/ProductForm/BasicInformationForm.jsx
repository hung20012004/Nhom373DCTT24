import React from 'react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';

const BasicInformationForm = ({ formData, handleChange, categories, materials, setFormData, ErrorMessage }) => {
    return (
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
                <Label htmlFor="sku">SKU (Mã sản phẩm)</Label>
                <Input
                    id="sku"
                    name="sku"
                    value={formData.sku || ''}
                    onChange={handleChange}
                    className="mt-1"
                />
                <ErrorMessage field="sku" />
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

            <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active === true || formData.is_active === "true"}
                    onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, is_active: checked }))
                    }
                />
                <Label htmlFor="is_active">Đang hoạt động</Label>
                <ErrorMessage field="is_active" />
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
    );
};

export default BasicInformationForm;
