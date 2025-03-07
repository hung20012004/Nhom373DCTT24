import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Check, X, Plus, Trash2, Search } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

export default function InventoryCheckForm({ inventoryCheck, onClose, onSuccess }) {
    const [isOpen, setIsOpen] = useState(true);
    const [checkDate, setCheckDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [note, setNote] = useState('');
    const [details, setDetails] = useState([]);
    const [status, setStatus] = useState('draft');
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    // Fetch products for search
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/products/all');
            if (response.data) {
                const productsData = Array.isArray(response.data) ? response.data :
                                     // Nếu API trả về đối tượng có thuộc tính data
                                     (response.data.data || []);

                setProducts(productsData);
            }
            console.log('Danh sách sản phẩm:', products);
        } catch (error) {
            console.error('Lỗi khi tải danh sách sản phẩm:', error);
            setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Load existing inventory check data if editing
    useEffect(() => {
        if (inventoryCheck) {
            setCheckDate(format(new Date(inventoryCheck.check_date), 'yyyy-MM-dd'));
            setNote(inventoryCheck.note || '');
            setStatus(inventoryCheck.status || 'draft');
            setDetails(inventoryCheck.details || []);
        }

        fetchProducts();
    }, [inventoryCheck]);

    // Search products when search term changes
    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        setSearchLoading(true);
        const timer = setTimeout(() => {
            const results = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(results);
            setSearchLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, products]);

    // Handle search box toggle
    const toggleProductSearch = () => {
        setShowProductSearch(!showProductSearch);
        if (!showProductSearch) {
            setSearchTerm('');
            setSearchResults([]);
        }
    };

    // Add product to details
    const addProduct = (product) => {
        // Check if product already exists in details
        const existing = details.find(detail => detail.product_id === product.product_id);
        if (existing) {
            alert(`Sản phẩm "${product.name}" đã có trong danh sách kiểm kê`);
            return;
        }

        // Add product to details with default values
        const newDetail = {
            product_id: product.product_id,
            product: product,
            system_quantity: product.stock_quantity || 0,
            actual_quantity: product.stock_quantity || 0,
            difference: 0,
            note: ''
        };

        setDetails([...details, newDetail]);
        setShowProductSearch(false);
        setSearchTerm('');
        setSearchResults([]);
    };

    // Remove product from details
    const removeProduct = (productId) => {
        setDetails(details.filter(detail => detail.product_id !== productId));
    };

    // Update detail field
    const updateDetail = (productId, field, value) => {
        const updatedDetails = details.map(detail => {
            if (detail.product_id === productId) {
                const updatedDetail = { ...detail, [field]: value };

                // Recalculate difference if system_quantity or actual_quantity changes
                if (field === 'system_quantity' || field === 'actual_quantity') {
                    const systemQty = field === 'system_quantity' ? value : detail.system_quantity;
                    const actualQty = field === 'actual_quantity' ? value : detail.actual_quantity;
                    updatedDetail.difference = actualQty - systemQty;
                }

                return updatedDetail;
            }
            return detail;
        });

        setDetails(updatedDetails);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (details.length === 0) {
            setError('Vui lòng thêm ít nhất một sản phẩm vào phiếu kiểm kê');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const payload = {
                check_date: checkDate,
                status: status,
                note: note,
                details: details.map(detail => ({
                    product_id: detail.product_id,
                    system_quantity: parseInt(detail.system_quantity) || 0,
                    actual_quantity: parseInt(detail.actual_quantity) || 0,
                    note: detail.note
                }))
            };

            let response;
            if (inventoryCheck) {
                // Update existing inventory check
                response = await axios.put(`/admin/inventory-checks/${inventoryCheck.check_id}`, payload);
            } else {
                // Create new inventory check
                response = await axios.post('/admin/inventory-checks', payload);
            }

            if (response.data.status === 'success') {
                handleClose();
                if (onSuccess) {
                    onSuccess(response.data.data);
                }
            }
        } catch (error) {
            console.error('Lỗi khi lưu phiếu kiểm kê:', error);
            setError(
                error.response?.data?.message ||
                'Đã xảy ra lỗi khi lưu phiếu kiểm kê. Vui lòng thử lại sau.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Close the form dialog
    const handleClose = () => {
        setIsOpen(false);
        if (onClose) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {inventoryCheck ? 'Chỉnh sửa phiếu kiểm kê' : 'Tạo phiếu kiểm kê mới'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                            <Label htmlFor="check_date">Ngày kiểm kê</Label>
                            <Input
                                id="check_date"
                                type="date"
                                value={checkDate}
                                onChange={(e) => setCheckDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Trạng thái</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Nháp</SelectItem>
                                    <SelectItem value="completed">Hoàn thành</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        <Label htmlFor="note">Ghi chú</Label>
                        <Textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Nhập ghi chú (nếu có)"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Danh sách sản phẩm kiểm kê</h3>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={toggleProductSearch}
                                className="flex items-center gap-1"
                            >
                                <Plus className="h-4 w-4" />
                                Thêm sản phẩm
                            </Button>
                        </div>

                        {showProductSearch && (
                            <div className="border rounded-md p-4 mb-4 bg-gray-50">
                                <div className="flex gap-2 mb-4">
                                    <div className="relative flex-grow">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={toggleProductSearch}
                                        size="icon"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {searchLoading ? (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="max-h-60 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Mã</TableHead>
                                                    <TableHead>Tên sản phẩm</TableHead>
                                                    <TableHead>Tồn kho</TableHead>
                                                    <TableHead></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {searchResults.map((product) => (
                                                    <TableRow key={product.product_id}>
                                                        <TableCell className="font-medium">{product.product_id}</TableCell>
                                                        <TableCell>{product.name}</TableCell>
                                                        <TableCell>{product.stock_quantity || 0}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => addProduct(product)}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : searchTerm.length >= 2 ? (
                                    <div className="text-center py-4 text-gray-500">
                                        Không tìm thấy sản phẩm nào
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        Nhập ít nhất 2 ký tự để tìm kiếm
                                    </div>
                                )}
                            </div>
                        )}

                        {details.length > 0 ? (
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mã</TableHead>
                                            <TableHead>Tên sản phẩm</TableHead>
                                            <TableHead className="w-24">SL hệ thống</TableHead>
                                            <TableHead className="w-24">SL thực tế</TableHead>
                                            <TableHead className="w-24">Chênh lệch</TableHead>
                                            <TableHead className="w-32">Ghi chú</TableHead>
                                            <TableHead className="w-16"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {details.map((detail) => (
                                            <TableRow key={detail.product_id}>
                                                <TableCell className="font-medium">
                                                    {detail.product?.product_id}
                                                </TableCell>
                                                <TableCell>
                                                    {detail.product?.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={detail.system_quantity}
                                                        onChange={(e) =>
                                                            updateDetail(
                                                                detail.product_id,
                                                                'system_quantity',
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        className="h-8"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={detail.actual_quantity}
                                                        onChange={(e) =>
                                                            updateDetail(
                                                                detail.product_id,
                                                                'actual_quantity',
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        className="h-8"
                                                    />
                                                </TableCell>
                                                <TableCell className={
                                                    detail.difference < 0
                                                        ? 'text-red-600'
                                                        : detail.difference > 0
                                                            ? 'text-green-600'
                                                            : ''
                                                }>
                                                    {detail.difference}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="text"
                                                        value={detail.note || ''}
                                                        onChange={(e) =>
                                                            updateDetail(
                                                                detail.product_id,
                                                                'note',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Ghi chú"
                                                        className="h-8"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeProduct(detail.product_id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-6 border rounded-md text-gray-500">
                                Chưa có sản phẩm nào trong phiếu kiểm kê
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || details.length === 0}
                            className="ml-2"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang lưu...
                                </div>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    {inventoryCheck ? 'Cập nhật' : 'Tạo phiếu kiểm kê'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
