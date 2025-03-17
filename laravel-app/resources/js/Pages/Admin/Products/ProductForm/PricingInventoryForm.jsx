import React from 'react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

const PricingInventoryForm = ({ formData, handleChange, ErrorMessage, stockQuantityReadOnly = false }) => {
    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="price">Giá sản phẩm (VND)</Label>
                <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    className="mt-1"
                />
                <ErrorMessage field="price" />
            </div>

            <div>
                <Label htmlFor="sale_price">Giá khuyến mãi (VND)</Label>
                <Input
                    id="sale_price"
                    name="sale_price"
                    type="number"
                    value={formData.sale_price}
                    onChange={handleChange}
                    className="mt-1"
                />
                <ErrorMessage field="sale_price" />
            </div>

            <div>
                <Label htmlFor="stock_quantity">
                    Số lượng trong kho {stockQuantityReadOnly && "(Tự động tính từ các biến thể)"}
                </Label>
                <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    className="mt-1"
                    readOnly={stockQuantityReadOnly}
                    disabled={stockQuantityReadOnly}
                />
                {stockQuantityReadOnly && (
                    <p className="text-sm text-gray-500 mt-1">
                        Số lượng này được tính tự động từ tổng số lượng của tất cả biến thể
                    </p>
                )}
                <ErrorMessage field="stock_quantity" />
            </div>

            <div>
                <Label htmlFor="min_purchase_quantity">Số lượng mua tối thiểu</Label>
                <Input
                    id="min_purchase_quantity"
                    name="min_purchase_quantity"
                    type="number"
                    value={formData.min_purchase_quantity}
                    onChange={handleChange}
                    className="mt-1"
                />
                <ErrorMessage field="min_purchase_quantity" />
            </div>

            <div>
                <Label htmlFor="max_purchase_quantity">Số lượng mua tối đa</Label>
                <Input
                    id="max_purchase_quantity"
                    name="max_purchase_quantity"
                    type="number"
                    value={formData.max_purchase_quantity}
                    onChange={handleChange}
                    className="mt-1"
                />
                <ErrorMessage field="max_purchase_quantity" />
            </div>
        </div>
    );
};

export default PricingInventoryForm;
