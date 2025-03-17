import React, { useState } from 'react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Card, CardContent } from '@/Components/ui/card';
import { Plus, Trash } from 'lucide-react';

const VariantsManager = ({ variants, setVariants, sizes, colors }) => {
    // New variant form state
    const [newVariant, setNewVariant] = useState({
        size_id: '',
        color_id: '',
        price: '',
        stock_quantity: '',
    });

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

    return (
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
    );
};

export default VariantsManager;
