import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';
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
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { CalendarIcon, X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function PurchaseOrderForm({ purchaseOrder, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        supplier_id: '',
        order_date: '',
        expected_date: '',
        status: 'draft',
        note: '',
        details: [],
        isDraft: true
    });
    const [errors, setErrors] = useState({});
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [generalError, setGeneralError] = useState('');

    useEffect(() => {
        // Only run this effect when purchaseOrder changes and is not null/undefined
        if (purchaseOrder) {
            setIsEdit(true);

            // Create a clean transformed data object
            const formattedData = {
                supplier_id: purchaseOrder.supplier_id.toString(),
                order_date: format(new Date(purchaseOrder.order_date), 'yyyy-MM-dd'),
                expected_date: format(new Date(purchaseOrder.expected_date), 'yyyy-MM-dd'),
                status: purchaseOrder.status || 'draft',
                note: purchaseOrder.note || '',
                details: purchaseOrder.details.map(detail => ({
                    product_id: detail.product_id,
                    product: detail.product,
                    quantity: detail.quantity,
                    unit_price: detail.unit_price,
                    subtotal: Number(detail.quantity) * Number(detail.unit_price)
                })),
                isDraft: (purchaseOrder.status || 'draft') === 'draft'
            };

            // Update state in a single operation
            setFormData(formattedData);
        }

    }, [purchaseOrder]);

    // Separate useEffect for initial data loading - doesn't depend on purchaseOrder
    useEffect(() => {
        fetchSuppliers();
        fetchProducts();
    }, []);

    useEffect(() => {
        if (formData.status) {
            setFormData(prev => ({
                ...prev,
                isDraft: prev.status === 'draft'
            }));
        }
    }, [formData.status]);

    useEffect(() => {
        // Calculate total amount when details change
        const total = formData.details.reduce((sum, item) => sum + Number(item.subtotal), 0);
        setTotalAmount(total);
    }, [formData.details]);

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('/api/v1/suppliers');
            if (response.data && response.data.data) {
                setSuppliers(response.data.data);
            }
        } catch (error) {
            console.error('Error loading suppliers list:', error);
            setGeneralError('Failed to load suppliers. Please try again.');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/api/v1/products');
            if (response.data && response.data.data) {
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error('Error loading products list:', error);
            setGeneralError('Failed to load products. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'status' ? { isDraft: value === 'draft' } : {})
          }));
        // Clear related errors
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleDateChange = (field, e) => {
        const value = e.target.value;
        if (value) {
            setFormData(prev => ({ ...prev, [field]: value }));
            // Clear related errors
            if (errors[field]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            }
        }
    };

    const addProductToOrder = () => {
        if (!selectedProduct || !quantity || !unitPrice) {
            setErrors({
                ...errors,
                product_details: 'Please select a product, quantity, and unit price'
            });
            return;
        }

        const product = products.find(p => p.product_id.toString() === selectedProduct);
        if (!product) return;

        const subtotal = Number(quantity) * Number(unitPrice);

        // Check if product already exists in order
        const existingProductIndex = formData.details.findIndex(
            d => d.product_id.toString() === selectedProduct
        );

        if (existingProductIndex >= 0) {
            // Update existing product
            const updatedDetails = [...formData.details];
            const existingItem = updatedDetails[existingProductIndex];

            updatedDetails[existingProductIndex] = {
                ...existingItem,
                quantity: Number(existingItem.quantity) + Number(quantity),
                unit_price: Number(unitPrice),
                subtotal: Number(existingItem.subtotal) + subtotal
            };

            setFormData(prev => ({ ...prev, details: updatedDetails }));
        } else {
            // Add new product
            setFormData(prev => ({
                ...prev,
                details: [
                    ...prev.details,
                    {
                        product_id: selectedProduct,
                        product: product,
                        quantity: Number(quantity),
                        unit_price: Number(unitPrice),
                        subtotal: subtotal
                    }
                ]
            }));
        }

        // Reset form
        setSelectedProduct('');
        setQuantity('');
        setUnitPrice('');
        setErrors({...errors, product_details: ''});
    };

    const removeProductFromOrder = (productId) => {
        setFormData(prev => ({
            ...prev,
            details: prev.details.filter(d => d.product_id.toString() !== productId.toString())
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError('');

        if (!formData.supplier_id) {
            setErrors({...errors, supplier_id: 'Please select a supplier'});
            setLoading(false);
            return;
        }

        if (formData.details.length === 0) {
            setErrors({...errors, details: 'Please add at least one product to the order'});
            setLoading(false);
            return;
        }

        try {
            // Prepare data to send
            const dataToSend = {
                ...formData,
                details: formData.details.map(detail => ({
                    product_id: detail.product_id,
                    quantity: detail.quantity,
                    unit_price: detail.unit_price
                }))
            };

            delete dataToSend.isDraft;

            let response;
            if (isEdit) {
                response = await axios.put(`/admin/api/purchase-orders/${purchaseOrder.po_id}`, dataToSend);
            } else {
                response = await axios.post('/admin/api/purchase-orders', dataToSend);
            }

            if (response.data.status === 'success') {
                toast.success(isEdit ? 'Purchase order updated successfully' : 'Purchase order created successfully');
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving purchase order:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                setGeneralError(error.response?.data?.message || 'An error occurred while saving the purchase order');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getMinExpectedDate = () => {
        // Expected date cannot be earlier than the order date
        return formData.order_date || format(new Date(), 'yyyy-MM-dd');
    };

    return(
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Edit Purchase Order' : 'Create New Purchase Order'}
                    </DialogTitle>
                </DialogHeader>

                {generalError && (
                    <Alert variant="destructive">
                        <AlertDescription>{generalError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Supplier selection */}
                        <div className="space-y-2">
                            <Label>Supplier</Label>
                            <Select
                                value = {formData.supplier_id}
                                onValueChange={(value) => handleSelectChange('supplier_id', value)}
                                disabled={loading || (isEdit && !formData.isDraft)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map((supplier) => (
                                        <SelectItem
                                            key={supplier.id}
                                            value={supplier.id.toString()}
                                        >
                                            {supplier.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.supplier_id && <span className="text-red-500 text-sm">{errors.supplier_id}</span>}
                        </div>

                        {/* Status selection */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleSelectChange('status', value)}
                                disabled={loading || isEdit}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="ordered">Ordered</SelectItem>
                                    <SelectItem value="received">Received</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <span className="text-red-500 text-sm">{errors.status}</span>}
                        </div>

                        {/* Order date */}
                        <div className="space-y-2">
                            <Label htmlFor="order_date">Order Date</Label>
                            <div className="relative">
                                <div className="flex">
                                    <Input
                                        id="order_date"
                                        type="date"
                                        name="order_date"
                                        value={formData.order_date}
                                        onChange={(e) => handleDateChange('order_date', e)}
                                        className="w-full pr-10"
                                        disabled={loading || (isEdit && !formData.isDraft)}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            {errors.order_date && <span className="text-red-500 text-sm">{errors.order_date}</span>}
                        </div>

                        {/* Expected date */}
                        <div className="space-y-2">
                            <Label htmlFor="expected_date">Expected Delivery Date</Label>
                            <div className="relative">
                                <div className="flex">
                                    <Input
                                        id="expected_date"
                                        type="date"
                                        name="expected_date"
                                        value={formData.expected_date}
                                        onChange={(e) => handleDateChange('expected_date', e)}
                                        min={getMinExpectedDate()}
                                        className="w-full pr-10"
                                        disabled={loading || (isEdit && !formData.isDraft)}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            {errors.expected_date && <span className="text-red-500 text-sm">{errors.expected_date}</span>}
                        </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <Label htmlFor="note">Note</Label>
                        <Textarea
                            id="note"
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            rows={3}
                            disabled={loading || (isEdit && !formData.isDraft)}
                        />
                        {errors.note && <span className="text-red-500 text-sm">{errors.note}</span>}
                    </div>

                    {/* Product selection area */}
                    {(!isEdit || formData.status === 'draft') && (
                        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                            <h3 className="font-medium">Add Products</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label>Product</Label>
                                    <Select
                                        value={selectedProduct}
                                        onValueChange={setSelectedProduct}
                                        disabled={loading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((product) => (
                                                <SelectItem
                                                    key={product.product_id}
                                                    value={product.product_id.toString()}
                                                >
                                                    {product.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <Label>Unit Price</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={unitPrice}
                                        onChange={(e) => setUnitPrice(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        onClick={addProductToOrder}
                                        disabled={loading}
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Add
                                    </Button>
                                </div>
                            </div>
                            {errors.product_details && (
                                <span className="text-red-500 text-sm block mt-2">{errors.product_details}</span>
                            )}
                        </div>
                    )}

                    {/* Products table */}
                    <div className="space-y-2">
                        <Label>Order Details</Label>
                        {errors.details && <span className="text-red-500 text-sm block">{errors.details}</span>}

                        {formData.details.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                        {(!isEdit || formData.status === 'draft') && (
                                            <TableHead className="w-[50px]"></TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.details.map((detail) => (
                                        <TableRow key={detail.product_id}>
                                            <TableCell>{detail.product?.name || `Product #${detail.product_id}`}</TableCell>
                                            <TableCell className="text-right">{detail.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(detail.unit_price)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(detail.subtotal)}</TableCell>
                                            {(!isEdit || formData.status === 'draft') && (
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeProductFromOrder(detail.product_id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={(!isEdit || formData.status === 'draft') ? 3 : 2} className="font-medium text-right">Total:</TableCell>
                                        <TableCell className="font-bold text-right">{formatCurrency(totalAmount)}</TableCell>
                                        {(!isEdit || formData.status === 'draft') && <TableCell></TableCell>}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-4 border rounded-md bg-gray-50">
                                No products added to the order yet
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <div className="flex justify-end gap-2 w-full">
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
                                disabled={loading || (isEdit && formData.status !== 'draft')}
                                className="min-w-[100px]"
                            >
                                {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
